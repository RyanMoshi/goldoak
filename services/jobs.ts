import { runInBackground } from '@/lib/background'
import { getSql } from '@/lib/db/client'
import { ensureSchema } from '@/lib/db/migrate'
import { newId } from '@/lib/ids'

/**
 * Durable background jobs on Postgres. Anything slow or fallible (OCR, memory
 * summaries, outbound media) is enqueued and processed by `runJobs()`, which
 * runs right after a webhook acknowledges (in the background), from the cron
 * endpoints, and on demand from the admin. Failed jobs retry with backoff up
 * to `max_attempts`, then are marked dead and surfaced on the admin dashboard.
 */

export type JobType = 'ocr-upload' | 'memory-summary' | 'whatsapp-send' | 'whatsapp-send-document' | 'process-inbound' | 'web-answer' | 'email-send' | 'campaign-batch'

export interface Job {
  id: string
  organizationId: string | null
  type: JobType
  payload: Record<string, unknown>
  attempts: number
}

type Handler = (job: Job) => Promise<void>
const handlers = new Map<JobType, Handler>()

export function registerJob(type: JobType, handler: Handler): void {
  handlers.set(type, handler)
}

interface EnqueueInput {
  type: JobType
  payload: Record<string, unknown>
  organizationId?: string | null
  /** Same key → the job is enqueued once. */
  idempotencyKey?: string
  delaySeconds?: number
  maxAttempts?: number
}

export async function enqueue(input: EnqueueInput): Promise<string | null> {
  await ensureSchema()
  const sql = getSql()
  const id = newId('job')
  const rows = await sql`INSERT INTO jobs (id, organization_id, type, payload, run_after, idempotency_key, max_attempts)
    VALUES (${id}, ${input.organizationId ?? null}, ${input.type}, ${sql.json(input.payload as never)}, now() + (${input.delaySeconds ?? 0} || ' seconds')::interval, ${input.idempotencyKey ?? null}, ${input.maxAttempts ?? 4})
    ON CONFLICT (idempotency_key) DO NOTHING RETURNING id`
  const id2 = rows[0] ? String(rows[0].id) : null
  if (id2 && !(input.delaySeconds && input.delaySeconds > 0)) kickQueue()
  return id2
}

let kicking = false

/**
 * Drains due jobs right after the current response is sent, so an email or a
 * WhatsApp message queued by a request goes out within seconds rather than at
 * the next scheduled run. The scheduled worker remains the safety net for
 * anything that fails here. Handlers are loaded lazily to avoid an import cycle.
 */
export function kickQueue(): void {
  if (kicking) return
  kicking = true
  runInBackground(async () => {
    try {
      const { registerJobHandlers } = await import('@/services/jobs/handlers')
      registerJobHandlers()
      await runJobs(10, 45_000)
    } catch (error) {
      console.error('queue kick failed', error instanceof Error ? error.message : error)
    } finally {
      kicking = false
    }
  })
}

export interface RunSummary {
  ran: number
  done: number
  failed: number
  dead: number
}

/** Claims and runs up to `limit` due jobs. Safe to call concurrently. */
export async function runJobs(limit = 10, budgetMs = 240_000): Promise<RunSummary> {
  await ensureSchema()
  const sql = getSql()
  const summary: RunSummary = { ran: 0, done: 0, failed: 0, dead: 0 }
  const started = Date.now()

  for (let i = 0; i < limit; i++) {
    if (Date.now() - started > budgetMs) break
    const claimed = await sql`UPDATE jobs SET status = 'running', attempts = attempts + 1, started_at = now()
      WHERE id = (SELECT id FROM jobs WHERE status = 'queued' AND run_after <= now() ORDER BY run_after ASC LIMIT 1 FOR UPDATE SKIP LOCKED)
      RETURNING *`
    const row = claimed[0]
    if (!row) break
    const job: Job = { id: String(row.id), organizationId: row.organization_id ? String(row.organization_id) : null, type: row.type as JobType, payload: (row.payload as Record<string, unknown>) ?? {}, attempts: Number(row.attempts) }
    summary.ran++
    const handler = handlers.get(job.type)
    try {
      if (!handler) throw new Error(`No handler for job type ${job.type}`)
      await handler(job)
      await sql`UPDATE jobs SET status = 'done', finished_at = now(), last_error = NULL WHERE id = ${job.id}`
      summary.done++
    } catch (error) {
      const message = (error instanceof Error ? error.message : String(error)).slice(0, 500)
      const dead = job.attempts >= Number(row.max_attempts)
      const delay = Math.min(3600, 30 * 2 ** job.attempts)
      await sql`UPDATE jobs SET status = ${dead ? 'dead' : 'queued'}, last_error = ${message}, finished_at = ${dead ? sql`now()` : null}, run_after = now() + (${delay} || ' seconds')::interval WHERE id = ${job.id}`
      if (dead) summary.dead++
      else summary.failed++
      console.error(`job ${job.type} ${job.id} failed (attempt ${job.attempts})`, message)
    }
  }
  // Jobs stuck in "running" (a worker died mid-way) go back to the queue after 10 minutes.
  await sql`UPDATE jobs SET status = 'queued', run_after = now() WHERE status = 'running' AND started_at < now() - interval '10 minutes'`
  return summary
}

export interface JobStats {
  queued: number
  running: number
  failed24h: number
  dead: number
  done24h: number
}

export async function jobStats(): Promise<JobStats> {
  await ensureSchema()
  const sql = getSql()
  const rows = await sql`SELECT
    (SELECT count(*) FROM jobs WHERE status = 'queued') AS queued,
    (SELECT count(*) FROM jobs WHERE status = 'running') AS running,
    (SELECT count(*) FROM jobs WHERE status = 'dead') AS dead,
    (SELECT count(*) FROM jobs WHERE last_error IS NOT NULL AND created_at > now() - interval '1 day') AS failed,
    (SELECT count(*) FROM jobs WHERE status = 'done' AND finished_at > now() - interval '1 day') AS done`
  const r = rows[0] ?? {}
  return { queued: Number(r.queued ?? 0), running: Number(r.running ?? 0), dead: Number(r.dead ?? 0), failed24h: Number(r.failed ?? 0), done24h: Number(r.done ?? 0) }
}

export interface JobRow {
  id: string
  organizationId: string | null
  type: string
  status: string
  attempts: number
  lastError: string | null
  createdAt: string
  finishedAt: string | null
}

export async function listJobs(status: 'dead' | 'failed' | 'all' = 'all', limit = 50): Promise<JobRow[]> {
  await ensureSchema()
  const sql = getSql()
  const rows =
    status === 'dead'
      ? await sql`SELECT * FROM jobs WHERE status = 'dead' ORDER BY created_at DESC LIMIT ${limit}`
      : status === 'failed'
        ? await sql`SELECT * FROM jobs WHERE last_error IS NOT NULL ORDER BY created_at DESC LIMIT ${limit}`
        : await sql`SELECT * FROM jobs ORDER BY created_at DESC LIMIT ${limit}`
  return rows.map((r) => ({
    id: String(r.id),
    organizationId: r.organization_id ? String(r.organization_id) : null,
    type: String(r.type),
    status: String(r.status),
    attempts: Number(r.attempts),
    lastError: r.last_error ? String(r.last_error) : null,
    createdAt: new Date(String(r.created_at)).toISOString(),
    finishedAt: r.finished_at ? new Date(String(r.finished_at)).toISOString() : null,
  }))
}

export async function retryJob(id: string): Promise<void> {
  const sql = getSql()
  await sql`UPDATE jobs SET status = 'queued', run_after = now(), attempts = 0, last_error = NULL WHERE id = ${id}`
}

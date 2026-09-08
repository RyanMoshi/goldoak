import { getSql } from '@/lib/db/client'
import { ensureSchema } from '@/lib/db/migrate'
import { newId } from '@/lib/ids'
import { runInBackground } from '@/lib/background'

/**
 * What the Super Agent console is built on.
 *
 * Every model call writes one `ai_events` row: which agency it served, which
 * model answered, whether a fallback was needed, how long it took and whether
 * it escalated to a person. Nothing about the question or the answer is
 * stored here — the conversation itself already lives, tenant-scoped, in
 * `conversation_messages` and `consultations`. This table is operational
 * telemetry, so it can be read across agencies without leaking their content.
 */

export interface AiEventInput {
  organizationId: string | null
  userId?: string | null
  kind: 'consult' | 'intent' | 'summary' | 'ocr' | 'vision' | 'extract'
  channel?: 'whatsapp' | 'web' | 'api' | null
  model?: string | null
  vendor?: string | null
  fallbackUsed?: boolean
  ok?: boolean
  escalated?: boolean
  latencyMs?: number | null
  error?: string | null
}

/** Never throws and never delays the caller: telemetry must not break a reply. */
export function recordAiEvent(input: AiEventInput): void {
  runInBackground(async () => {
    try {
      await ensureSchema()
      const sql = getSql()
      await sql`INSERT INTO ai_events (id, organization_id, user_id, kind, channel, model, vendor, fallback_used, ok, escalated, latency_ms, error)
        VALUES (${newId('aie')}, ${input.organizationId}, ${input.userId ?? null}, ${input.kind}, ${input.channel ?? null}, ${input.model ?? null}, ${input.vendor ?? null},
          ${input.fallbackUsed ?? false}, ${input.ok ?? true}, ${input.escalated ?? false}, ${input.latencyMs ?? null}, ${input.error?.slice(0, 300) ?? null})`
    } catch {
      /* telemetry is best-effort */
    }
  })
}

export interface AiOverview {
  answers24h: number
  answers7d: number
  failures24h: number
  escalations24h: number
  fallbacks24h: number
  medianLatencyMs: number | null
  successRate: number
  agenciesServed: number
  conversations7d: number
  byChannel: { channel: string; count: number }[]
  byModel: { model: string; count: number; failures: number }[]
  daily: { day: string; answers: number; failures: number }[]
}

/**
 * A dashboard must never hang because one aggregate is slow. Each query runs on
 * its own with a short deadline; anything that misses it is reported as empty
 * and logged, so the page still renders and the gap is visible rather than
 * silent. (Written after the first version stalled the whole console.)
 */
async function guarded<T>(label: string, run: () => Promise<T>, fallback: T, ms = 6000): Promise<T> {
  try {
    return await Promise.race([
      run(),
      new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timed out')), ms)),
    ])
  } catch (error) {
    console.error(`ai overview: ${label} failed`, error instanceof Error ? error.message : error)
    return fallback
  }
}

const median = (values: number[]): number | null => {
  if (!values.length) return null
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length / 2)]
}

export async function aiOverview(): Promise<AiOverview> {
  await ensureSchema()
  const sql = getSql()

  const totals = await guarded(
    'totals',
    () => sql`SELECT
        count(*) FILTER (WHERE at > now() - interval '1 day') AS a24,
        count(*) FILTER (WHERE at > now() - interval '7 days') AS a7,
        count(*) FILTER (WHERE at > now() - interval '1 day' AND NOT ok) AS f24,
        count(*) FILTER (WHERE at > now() - interval '1 day' AND escalated) AS e24,
        count(*) FILTER (WHERE at > now() - interval '1 day' AND fallback_used) AS fb24,
        count(DISTINCT organization_id) FILTER (WHERE at > now() - interval '30 days') AS orgs
      FROM ai_events`,
    [] as Record<string, unknown>[],
  )
  const latencies = await guarded(
    'latency',
    () => sql`SELECT latency_ms FROM ai_events WHERE at > now() - interval '1 day' AND latency_ms IS NOT NULL ORDER BY at DESC LIMIT 500`,
    [] as Record<string, unknown>[],
  )
  const channels = await guarded(
    'channels',
    () => sql`SELECT coalesce(channel, 'other') AS channel, count(*) AS n FROM ai_events WHERE at > now() - interval '7 days' GROUP BY 1 ORDER BY n DESC`,
    [] as Record<string, unknown>[],
  )
  const models = await guarded(
    'models',
    () => sql`SELECT coalesce(model, 'unknown') AS model, count(*) AS n, count(*) FILTER (WHERE NOT ok) AS failures
        FROM ai_events WHERE at > now() - interval '7 days' GROUP BY 1 ORDER BY n DESC LIMIT 8`,
    [] as Record<string, unknown>[],
  )
  const daily = await guarded(
    'daily',
    () => sql`SELECT to_char(date_trunc('day', at), 'YYYY-MM-DD') AS day, count(*) AS n, count(*) FILTER (WHERE NOT ok) AS failures
        FROM ai_events WHERE at > now() - interval '14 days' GROUP BY 1 ORDER BY 1`,
    [] as Record<string, unknown>[],
  )
  const convos = await guarded(
    'conversations',
    () => sql`SELECT count(DISTINCT phone) AS n FROM conversation_messages WHERE at > now() - interval '7 days'`,
    [] as Record<string, unknown>[],
  )

  const t = totals[0] ?? {}
  const a24 = Number(t.a24 ?? 0)
  const f24 = Number(t.f24 ?? 0)
  return {
    answers24h: a24,
    answers7d: Number(t.a7 ?? 0),
    failures24h: f24,
    escalations24h: Number(t.e24 ?? 0),
    fallbacks24h: Number(t.fb24 ?? 0),
    medianLatencyMs: median(latencies.map((r) => Number(r.latency_ms)).filter((n) => Number.isFinite(n))),
    successRate: a24 === 0 ? 1 : (a24 - f24) / a24,
    agenciesServed: Number(t.orgs ?? 0),
    conversations7d: Number(convos[0]?.n ?? 0),
    byChannel: channels.map((r) => ({ channel: String(r.channel), count: Number(r.n) })),
    byModel: models.map((r) => ({ model: String(r.model), count: Number(r.n), failures: Number(r.failures) })),
    daily: daily.map((r) => ({ day: String(r.day), answers: Number(r.n), failures: Number(r.failures) })),
  }
}

export interface AgencyAiUsage {
  organizationId: string
  name: string
  shortName: string
  status: string
  answers7d: number
  answers30d: number
  escalations7d: number
  failures7d: number
  lastUsed: string | null
  assistantName: string | null
  hasKnowledge: boolean
  channelConnected: boolean
}

/** One row per agency: how much of the AI it uses and how well configured it is. */
export async function agencyAiUsage(): Promise<AgencyAiUsage[]> {
  await ensureSchema()
  const sql = getSql()
  const rows = await sql`SELECT o.id, o.name, o.short_name, o.status, o.ai_settings,
      (SELECT count(*) FROM ai_events e WHERE e.organization_id = o.id AND e.at > now() - interval '7 days') AS a7,
      (SELECT count(*) FROM ai_events e WHERE e.organization_id = o.id AND e.at > now() - interval '30 days') AS a30,
      (SELECT count(*) FROM ai_events e WHERE e.organization_id = o.id AND e.at > now() - interval '7 days' AND e.escalated) AS esc7,
      (SELECT count(*) FROM ai_events e WHERE e.organization_id = o.id AND e.at > now() - interval '7 days' AND NOT e.ok) AS fail7,
      (SELECT max(at) FROM ai_events e WHERE e.organization_id = o.id) AS last_used,
      (SELECT count(*) FROM whatsapp_channels w WHERE w.organization_id = o.id AND w.status = 'ready') AS channels
    FROM organizations o ORDER BY o.created_at`
  return rows.map((r) => {
    const ai = (r.ai_settings as Record<string, string>) ?? {}
    return {
      organizationId: String(r.id),
      name: String(r.name),
      shortName: String(r.short_name),
      status: String(r.status),
      answers7d: Number(r.a7 ?? 0),
      answers30d: Number(r.a30 ?? 0),
      escalations7d: Number(r.esc7 ?? 0),
      failures7d: Number(r.fail7 ?? 0),
      lastUsed: r.last_used ? new Date(r.last_used as string).toISOString() : null,
      assistantName: ai.assistantName ? String(ai.assistantName) : null,
      hasKnowledge: Boolean((ai.services ?? '').toString().trim() || (ai.faqs ?? '').toString().trim()),
      channelConnected: Number(r.channels ?? 0) > 0,
    }
  })
}

export interface AiErrorRow {
  at: string
  organizationId: string | null
  organizationName: string | null
  kind: string
  model: string | null
  error: string | null
}

export async function recentAiErrors(limit = 30): Promise<AiErrorRow[]> {
  await ensureSchema()
  const sql = getSql()
  const rows = await sql`SELECT e.at, e.organization_id, o.name AS org_name, e.kind, e.model, e.error
    FROM ai_events e LEFT JOIN organizations o ON o.id = e.organization_id
    WHERE NOT e.ok OR e.fallback_used ORDER BY e.at DESC LIMIT ${limit}`
  return rows.map((r) => ({
    at: new Date(r.at as string).toISOString(),
    organizationId: r.organization_id ? String(r.organization_id) : null,
    organizationName: r.org_name ? String(r.org_name) : null,
    kind: String(r.kind),
    model: r.model ? String(r.model) : null,
    error: r.error ? String(r.error) : 'answered by a fallback model',
  }))
}

/* ---------- Global AI policy ---------- */

export interface AiPolicy {
  groundRules: string
  knowledge: string
  bannedPhrases: string
  updatedAt: string | null
}

export async function getGlobalPolicy(): Promise<AiPolicy> {
  await ensureSchema()
  const sql = getSql()
  const rows = await sql`SELECT * FROM ai_policies WHERE scope = 'global' LIMIT 1`
  const r = rows[0]
  return {
    groundRules: r?.ground_rules ? String(r.ground_rules) : '',
    knowledge: r?.knowledge ? String(r.knowledge) : '',
    bannedPhrases: r?.banned_phrases ? String(r.banned_phrases) : '',
    updatedAt: r?.updated_at ? new Date(r.updated_at as string).toISOString() : null,
  }
}

export async function saveGlobalPolicy(input: { groundRules: string; knowledge: string; bannedPhrases: string; updatedBy: string }): Promise<void> {
  await ensureSchema()
  const sql = getSql()
  await sql`INSERT INTO ai_policies (id, scope, organization_id, ground_rules, knowledge, banned_phrases, updated_by, updated_at)
    VALUES (${newId('aip')}, 'global', NULL, ${input.groundRules.slice(0, 4000)}, ${input.knowledge.slice(0, 8000)}, ${input.bannedPhrases.slice(0, 2000)}, ${input.updatedBy}, now())
    ON CONFLICT (scope, coalesce(organization_id, '')) DO UPDATE SET
      ground_rules = EXCLUDED.ground_rules, knowledge = EXCLUDED.knowledge, banned_phrases = EXCLUDED.banned_phrases,
      updated_by = EXCLUDED.updated_by, updated_at = now()`
}

/** Cached for a minute: the consultation prompt reads this on every answer. */
let cache: { at: number; policy: AiPolicy } | null = null

export async function cachedGlobalPolicy(): Promise<AiPolicy> {
  if (cache && Date.now() - cache.at < 60_000) return cache.policy
  try {
    const policy = await getGlobalPolicy()
    cache = { at: Date.now(), policy }
    return policy
  } catch {
    return { groundRules: '', knowledge: '', bannedPhrases: '', updatedAt: null }
  }
}

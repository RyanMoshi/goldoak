import { timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'
import { hasDatabase } from '@/lib/db/client'
import { runJobs } from '@/services/jobs'
import { registerJobHandlers } from '@/services/jobs/handlers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300

/**
 * Drains the job queue. Called by Vercel Cron (Authorization: Bearer CRON_SECRET),
 * by the admin (x-admin-token), or by anything that just queued work.
 */
export async function GET(request: Request) {
  if (!authorised(request)) return NextResponse.json({ ok: false, error: 'Unauthorised' }, { status: 401 })
  if (!hasDatabase()) return NextResponse.json({ ok: false, error: 'Database not configured' }, { status: 503 })
  registerJobHandlers()
  const summary = await runJobs(25, 240_000)
  return NextResponse.json({ ok: true, ...summary })
}

export const POST = GET

function authorised(request: Request): boolean {
  const auth = request.headers.get('authorization') ?? ''
  const cron = process.env.CRON_SECRET
  if (cron && auth === `Bearer ${cron}`) return true
  const token = process.env.ADMIN_TOKEN
  const provided = request.headers.get('x-admin-token') ?? ''
  if (token && token.length >= 16 && provided.length === token.length && timingSafeEqual(Buffer.from(provided), Buffer.from(token))) return true
  return false
}

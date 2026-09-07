import { NextResponse } from 'next/server'
import { getSql, hasDatabase } from '@/lib/db/client'
import { ensureSchema } from '@/lib/db/migrate'
import { getProvider } from '@/lib/whatsapp/provider'
import { aiModelLabel } from '@/lib/ai/provider'
import { storageConfigured } from '@/lib/storage/supabase'
import { jobStats } from '@/services/jobs'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Operational check: is the database reachable, is the schema present, is WhatsApp configured. No secrets. */
export async function GET() {
  const database: { status: 'ok' | 'unconfigured' | 'error'; users?: number; clients?: number; organizations?: number; waitingForHuman?: number; failedWhatsApp24h?: number; detail?: string } = {
    status: hasDatabase() ? 'ok' : 'unconfigured',
  }
  if (hasDatabase()) {
    try {
      await ensureSchema()
      const rows = await getSql()`SELECT (SELECT count(*) FROM users) AS users, (SELECT count(*) FROM clients) AS clients, (SELECT count(*) FROM organizations WHERE active) AS organizations,
        (SELECT count(*) FROM whatsapp_contacts WHERE mode = 'human') AS waiting, (SELECT count(*) FROM notifications WHERE whatsapp_status = 'failed' AND created_at > now() - interval '1 day') AS failed`
      database.users = Number(rows[0]?.users ?? 0)
      database.clients = Number(rows[0]?.clients ?? 0)
      database.organizations = Number(rows[0]?.organizations ?? 0)
      database.waitingForHuman = Number(rows[0]?.waiting ?? 0)
      database.failedWhatsApp24h = Number(rows[0]?.failed ?? 0)
    } catch (error) {
      database.status = 'error'
      database.detail = error instanceof Error ? error.message.slice(0, 160) : 'unknown'
    }
  }
  const jobs = hasDatabase() && database.status === 'ok' ? await jobStats().catch(() => null) : null
  return NextResponse.json(
    {
      ok: database.status === 'ok',
      database,
      whatsapp: getProvider()?.name ?? 'not configured',
      ai: aiModelLabel(),
      storage: storageConfigured() ? 'supabase' : 'not configured',
      jobs,
      version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'local',
      cron: process.env.CRON_SECRET ? 'configured' : 'missing',
      auth: process.env.AUTH_SECRET ? 'configured' : 'missing',
      time: new Date().toISOString(),
    },
    { status: database.status === 'error' ? 503 : 200, headers: { 'Cache-Control': 'no-store' } },
  )
}

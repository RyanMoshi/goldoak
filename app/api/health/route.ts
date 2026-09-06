import { NextResponse } from 'next/server'
import { getSql, hasDatabase } from '@/lib/db/client'
import { ensureSchema } from '@/lib/db/migrate'
import { getProvider } from '@/lib/whatsapp/provider'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Operational check: is the database reachable, is the schema present, is WhatsApp configured. No secrets. */
export async function GET() {
  const database: { status: 'ok' | 'unconfigured' | 'error'; users?: number; clients?: number; detail?: string } = {
    status: hasDatabase() ? 'ok' : 'unconfigured',
  }
  if (hasDatabase()) {
    try {
      await ensureSchema()
      const rows = await getSql()`SELECT (SELECT count(*) FROM users) AS users, (SELECT count(*) FROM clients) AS clients`
      database.users = Number(rows[0]?.users ?? 0)
      database.clients = Number(rows[0]?.clients ?? 0)
    } catch (error) {
      database.status = 'error'
      database.detail = error instanceof Error ? error.message.slice(0, 160) : 'unknown'
    }
  }
  return NextResponse.json(
    {
      ok: database.status === 'ok',
      database,
      whatsapp: getProvider()?.name ?? 'not configured',
      cron: process.env.CRON_SECRET ? 'configured' : 'missing',
      auth: process.env.AUTH_SECRET ? 'configured' : 'missing',
      time: new Date().toISOString(),
    },
    { status: database.status === 'error' ? 503 : 200, headers: { 'Cache-Control': 'no-store' } },
  )
}

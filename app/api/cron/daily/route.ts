import { timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'
import { hasDatabase } from '@/lib/db/client'
import { runDailyAutomation } from '@/services/automation'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * Daily automation. Vercel Cron calls this with `Authorization: Bearer ${CRON_SECRET}`
 * (see vercel.json). It can also be triggered by hand with the same header or
 * with x-admin-token.
 */
export async function GET(request: Request) {
  if (!authorised(request)) return NextResponse.json({ ok: false, error: 'Unauthorised' }, { status: 401 })
  if (!hasDatabase()) return NextResponse.json({ ok: false, error: 'Database not configured' }, { status: 503 })
  try {
    const summary = await runDailyAutomation()
    return NextResponse.json({ ok: true, ranAt: new Date().toISOString(), ...summary })
  } catch (error) {
    console.error('daily automation failed', error instanceof Error ? error.message : error)
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'failed' }, { status: 500 })
  }
}

function authorised(request: Request): boolean {
  const bearer = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? ''
  const admin = request.headers.get('x-admin-token') ?? ''
  return (Boolean(process.env.CRON_SECRET) && safeEqual(bearer, process.env.CRON_SECRET ?? '')) || (Boolean(process.env.ADMIN_TOKEN) && safeEqual(admin, process.env.ADMIN_TOKEN ?? ''))
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  return ab.length > 0 && ab.length === bb.length && timingSafeEqual(ab, bb)
}

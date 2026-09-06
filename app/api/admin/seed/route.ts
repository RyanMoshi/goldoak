import { timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'
import { hasDatabase } from '@/lib/db/client'
import { seedDatabase } from '@/lib/db/seed'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Seeds the database from inside the deployment, where the database
 * credentials live. Protected by ADMIN_TOKEN; idempotent.
 *
 *   curl -X POST https://<host>/api/admin/seed -H "x-admin-token: <ADMIN_TOKEN>"
 */
export async function POST(request: Request) {
  const expected = process.env.ADMIN_TOKEN
  const provided = request.headers.get('x-admin-token') ?? ''
  if (!expected || expected.length < 16 || !safeEqual(provided, expected)) {
    return NextResponse.json({ ok: false, error: 'Unauthorised' }, { status: 401 })
  }
  if (!hasDatabase()) {
    return NextResponse.json({ ok: false, error: 'Database not configured' }, { status: 503 })
  }
  try {
    const password = process.env.SEED_PASSWORD
    const summary = await seedDatabase(password && password.length >= 8 ? password : undefined)
    return NextResponse.json({ ok: true, ...summary })
  } catch (error) {
    console.error('seed failed', error instanceof Error ? error.message : error)
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Seed failed' }, { status: 500 })
  }
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  return ab.length === bb.length && timingSafeEqual(ab, bb)
}

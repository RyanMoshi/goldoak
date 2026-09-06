import { timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'
import { hasDatabase } from '@/lib/db/client'
import { bootstrap } from '@/lib/db/seed'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Bootstraps the organisation and the platform admin from inside the deployment.
 * Protected by ADMIN_TOKEN. Body (optional JSON): { purgeDemo, adminEmail, adminPassword, adminName, whatsapp }.
 *
 *   curl -X POST https://<host>/api/admin/seed -H "x-admin-token: <ADMIN_TOKEN>" -H "content-type: application/json" -d '{"purgeDemo":true}'
 */
export async function POST(request: Request) {
  const expected = process.env.ADMIN_TOKEN
  const provided = request.headers.get('x-admin-token') ?? ''
  if (!expected || expected.length < 16 || !safeEqual(provided, expected)) return NextResponse.json({ ok: false, error: 'Unauthorised' }, { status: 401 })
  if (!hasDatabase()) return NextResponse.json({ ok: false, error: 'Database not configured' }, { status: 503 })

  let body: Record<string, unknown> = {}
  try {
    const text = await request.text()
    body = text ? (JSON.parse(text) as Record<string, unknown>) : {}
  } catch {
    body = {}
  }

  try {
    const summary = await bootstrap({
      purgeDemo: body.purgeDemo === true,
      adminEmail: typeof body.adminEmail === 'string' ? body.adminEmail : undefined,
      adminPassword: typeof body.adminPassword === 'string' ? body.adminPassword : undefined,
      adminName: typeof body.adminName === 'string' ? body.adminName : undefined,
      whatsapp: typeof body.whatsapp === 'string' ? body.whatsapp : undefined,
    })
    return NextResponse.json({ ok: true, ...summary })
  } catch (error) {
    console.error('bootstrap failed', error instanceof Error ? error.message : error)
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Bootstrap failed' }, { status: 500 })
  }
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  return ab.length === bb.length && timingSafeEqual(ab, bb)
}

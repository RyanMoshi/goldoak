import { NextResponse } from 'next/server'
import { getSql, hasDatabase } from '@/lib/db/client'
import { ensureSchema } from '@/lib/db/migrate'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * Somewhere for a disposable gateway to keep its WhatsApp pairing.
 *
 * A gateway on a runner is wiped every few hours. Without this it would ask
 * for a new QR every time. It encrypts its session folder before sending it,
 * with a passphrase the platform never sees, so what is stored here is opaque
 * to us and useless to anyone who reads the table.
 *
 * Guarded by ADMIN_TOKEN, which is server-side only.
 *
 *   PUT  /api/admin/gateway/session   x-admin-token: <ADMIN_TOKEN>
 *        body: the encrypted archive, base64
 *   GET  /api/admin/gateway/session   -> { payload } or 404
 */

const ID = 'waha'
const MAX_BYTES = 32 * 1024 * 1024

function authorized(request: Request): boolean {
  const token = process.env.ADMIN_TOKEN
  if (!token || token.length < 16) return false
  return request.headers.get('x-admin-token') === token
}

export async function GET(request: Request) {
  if (!authorized(request)) return new Response('Unauthorized', { status: 401 })
  if (!hasDatabase()) return NextResponse.json({ ok: false, error: 'No database' }, { status: 503 })
  await ensureSchema()
  const sql = getSql()
  const rows = await sql`SELECT payload, size_bytes, updated_at FROM gateway_session_backups WHERE id = ${ID} LIMIT 1`
  if (!rows[0]) return NextResponse.json({ ok: false, error: 'No saved session' }, { status: 404 })
  return NextResponse.json({
    ok: true,
    payload: String(rows[0].payload),
    sizeBytes: rows[0].size_bytes ?? null,
    updatedAt: new Date(String(rows[0].updated_at)).toISOString(),
  })
}

export async function PUT(request: Request) {
  if (!authorized(request)) return new Response('Unauthorized', { status: 401 })
  if (!hasDatabase()) return NextResponse.json({ ok: false, error: 'No database' }, { status: 503 })

  const payload = (await request.text()).trim()
  if (!payload) return NextResponse.json({ ok: false, error: 'Empty body' }, { status: 400 })
  if (payload.length > MAX_BYTES) return NextResponse.json({ ok: false, error: 'Too large' }, { status: 413 })
  if (!/^[A-Za-z0-9+/=\s]+$/.test(payload)) return NextResponse.json({ ok: false, error: 'Expected base64' }, { status: 400 })

  const compact = payload.replace(/\s+/g, '')
  await ensureSchema()
  const sql = getSql()
  await sql`INSERT INTO gateway_session_backups (id, payload, size_bytes, updated_at)
    VALUES (${ID}, ${compact}, ${compact.length}, now())
    ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload, size_bytes = EXCLUDED.size_bytes, updated_at = now()`
  return NextResponse.json({ ok: true, sizeBytes: compact.length })
}

export async function DELETE(request: Request) {
  if (!authorized(request)) return new Response('Unauthorized', { status: 401 })
  if (!hasDatabase()) return NextResponse.json({ ok: false, error: 'No database' }, { status: 503 })
  await ensureSchema()
  const sql = getSql()
  await sql`DELETE FROM gateway_session_backups WHERE id = ${ID}`
  return NextResponse.json({ ok: true, cleared: true })
}

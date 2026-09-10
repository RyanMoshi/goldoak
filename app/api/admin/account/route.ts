import { NextResponse } from 'next/server'
import { getSql, hasDatabase } from '@/lib/db/client'
import { ensureSchema } from '@/lib/db/migrate'
import { audit } from '@/services/audit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Changing the platform administrator's own address.
 *
 * An operator whose email changes has no way to fix it from inside the
 * product: the account is the one thing the account cannot edit. This is that
 * lever, and it is deliberately narrow. It only ever touches accounts whose
 * role is admin, it refuses an address another account already holds, and it
 * clears the email verification so the new address has to prove itself with a
 * code before it is trusted.
 *
 * Guarded by ADMIN_TOKEN, which is server-side only and never reaches a
 * browser.
 *
 *   GET  /api/admin/account   -> the administrators on this platform
 *   POST /api/admin/account   { "email": "new@example.com", "id"?: "usr_..." }
 */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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
  const rows = await sql`SELECT id, name, email, active, email_verified_at, last_seen_at FROM users WHERE role = 'admin' ORDER BY created_at`
  return NextResponse.json({
    ok: true,
    administrators: rows.map((r) => ({
      id: String(r.id),
      name: String(r.name),
      email: String(r.email),
      active: r.active !== false,
      emailVerified: Boolean(r.email_verified_at),
      lastSeenAt: r.last_seen_at ? new Date(String(r.last_seen_at)).toISOString() : null,
    })),
  })
}

export async function POST(request: Request) {
  if (!authorized(request)) return new Response('Unauthorized', { status: 401 })
  if (!hasDatabase()) return NextResponse.json({ ok: false, error: 'No database' }, { status: 503 })

  let body: { email?: unknown; id?: unknown }
  try {
    body = (await request.json()) as { email?: unknown; id?: unknown }
  } catch {
    return NextResponse.json({ ok: false, error: 'Expected JSON' }, { status: 400 })
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  if (!EMAIL.test(email)) return NextResponse.json({ ok: false, error: 'That is not an email address' }, { status: 400 })

  await ensureSchema()
  const sql = getSql()

  const admins = await sql`SELECT id, email FROM users WHERE role = 'admin' ORDER BY created_at`
  if (!admins.length) return NextResponse.json({ ok: false, error: 'This platform has no administrator' }, { status: 404 })

  const wanted = typeof body.id === 'string' ? body.id : null
  const target = wanted ? admins.find((a) => String(a.id) === wanted) : admins[0]
  if (!target) return NextResponse.json({ ok: false, error: 'No administrator with that id' }, { status: 404 })
  if (String(target.email).toLowerCase() === email) return NextResponse.json({ ok: true, unchanged: true, email })

  const clash = await sql`SELECT id, role FROM users WHERE lower(email) = ${email} AND id <> ${String(target.id)} LIMIT 1`
  if (clash[0]) return NextResponse.json({ ok: false, error: 'Another account already uses that address' }, { status: 409 })

  const previous = String(target.email)
  // The new address is unproven until a code has been through it.
  await sql`UPDATE users SET email = ${email}, email_verified_at = NULL WHERE id = ${String(target.id)}`
  await audit({ organizationId: null, actorUserId: String(target.id), action: 'admin.email-changed', target: String(target.id), detail: { from: previous, to: email } })

  return NextResponse.json({ ok: true, id: String(target.id), from: previous, email })
}

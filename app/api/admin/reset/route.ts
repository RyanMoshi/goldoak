import { NextResponse } from 'next/server'
import { getSql } from '@/lib/db/client'
import { ensureSchema } from '@/lib/db/migrate'
import { generateTempPassword, hashPassword } from '@/lib/auth/password'
import { newId } from '@/lib/ids'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 120

/**
 * Clean reset for handover.
 *
 * This removes every tenant and everything under it, leaving only the platform
 * administrator so the system can be handed over empty. It is deliberately
 * awkward to fire: it needs the admin token, an exact confirmation phrase for
 * today's date, and it refuses to run at all unless `ALLOW_DB_RESET=1` is set
 * on the deployment. Without a body it reports what it *would* delete and
 * changes nothing.
 *
 *   Dry run:  curl -X POST .../api/admin/reset -H "x-admin-token: $ADMIN_TOKEN"
 *   For real: ... -d '{"confirm":"RESET 2026-09-08","keepOrganizationIds":["org_goldoak"]}'
 */

const TENANT_TABLES = [
  'campaign_recipients',
  'campaigns',
  'suppressions',
  'billing_lines',
  'billing_documents',
  'number_sequences',
  'conversation_messages',
  'whatsapp_contacts',
  'whatsapp_channels',
  'consultations',
  'ai_events',
  'documents',
  'uploads',
  'business_claims',
  'businesses',
  'enquiries',
  'notifications',
  'tasks',
  'activity',
  'quote_submissions',
  'quote_requests',
  'claims',
  'policies',
  'clients',
  'email_log',
  'email_templates',
  'otps',
  'password_resets',
  'processed_webhooks',
  'jobs',
  'audit_log',
  'memberships',
] as const

export async function POST(request: Request) {
  const expected = process.env.ADMIN_TOKEN
  const provided = request.headers.get('x-admin-token') ?? ''
  if (!expected || provided !== expected) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  let body: { confirm?: string; keepOrganizationIds?: string[]; adminEmail?: string; adminPassword?: string; resetAdminPassword?: boolean } = {}
  try {
    body = (await request.json()) as typeof body
  } catch {
    /* no body: dry run */
  }

  await ensureSchema()
  const sql = getSql()
  const keep = (body.keepOrganizationIds ?? []).filter(Boolean)

  // What is here right now.
  const counts: Record<string, number> = {}
  for (const table of TENANT_TABLES) {
    const rows = await sql.unsafe(`SELECT count(*)::int AS n FROM ${table}`)
    counts[table] = Number(rows[0]?.n ?? 0)
  }
  const orgs = await sql`SELECT id, name, code, status FROM organizations ORDER BY created_at`
  const users = await sql`SELECT id, role, email, name FROM users ORDER BY created_at`
  const admins = users.filter((u) => u.role === 'admin')

  const plan = {
    organizations: orgs.map((o) => ({ id: String(o.id), name: String(o.name), code: o.code ? String(o.code) : null, keep: keep.includes(String(o.id)) })),
    usersToDelete: users.filter((u) => u.role !== 'admin').length,
    adminsKept: admins.map((u) => ({ email: String(u.email), name: String(u.name) })),
    rows: counts,
    totalRows: Object.values(counts).reduce((a, b) => a + b, 0),
  }

  if (!body.confirm) {
    return NextResponse.json({
      mode: 'dry-run',
      willDelete: plan,
      howToRun: `POST again with {"confirm":"RESET ${new Date().toISOString().slice(0, 10)}"} and ALLOW_DB_RESET=1 set on the deployment.`,
      warning: 'This is irreversible. Take a database backup first.',
    })
  }

  if (process.env.ALLOW_DB_RESET !== '1') {
    return NextResponse.json({ error: 'Refused: set ALLOW_DB_RESET=1 on the deployment to permit a reset, then remove it again afterwards.' }, { status: 403 })
  }
  const phrase = `RESET ${new Date().toISOString().slice(0, 10)}`
  if (body.confirm !== phrase) {
    return NextResponse.json({ error: `Refused: the confirmation phrase must be exactly "${phrase}".` }, { status: 400 })
  }

  // Delete tenant data. Order matters only where there is no ON DELETE CASCADE.
  const deleted: Record<string, number> = {}
  let removedUsers: { id: unknown }[] = []
  let removedOrgs: { id: unknown }[] = []
  try {
    // Not every table carries organization_id: line items, one-time codes and
    // webhook receipts hang off a parent that cascades. When an agency is being
    // kept, those tables are left to their parent rather than filtered on a
    // column they do not have.
    const scoped = await sql`SELECT table_name FROM information_schema.columns
      WHERE table_schema = 'public' AND column_name = 'organization_id'`
    const tenantScoped = new Set(scoped.map((r) => String(r.table_name)))

    for (const table of TENANT_TABLES) {
      if (keep.length && !tenantScoped.has(table)) {
        deleted[table] = 0
        continue
      }
      const rows = keep.length
        ? await sql.unsafe(`DELETE FROM ${table} WHERE organization_id IS NULL OR organization_id <> ALL($1) RETURNING 1`, [keep])
        : await sql.unsafe(`DELETE FROM ${table} RETURNING 1`)
      deleted[table] = rows.length
    }
    removedUsers = keep.length
      ? await sql`DELETE FROM users WHERE role <> 'admin' AND (organization_id IS NULL OR NOT (organization_id = ANY(${keep}))) RETURNING id`
      : await sql`DELETE FROM users WHERE role <> 'admin' RETURNING id`
    // The platform administrator belongs to no agency, but the bootstrap gave it
    // one. Detach it, or the organisation it points at cannot be deleted.
    const detachAdmins = keep.length
      ? await sql`UPDATE users SET organization_id = NULL WHERE role = 'admin' AND (organization_id IS NULL OR NOT (organization_id = ANY(${keep}))) RETURNING id`
      : await sql`UPDATE users SET organization_id = NULL WHERE role = 'admin' RETURNING id`
    deleted['admins_detached'] = detachAdmins.length
    removedOrgs = keep.length ? await sql`DELETE FROM organizations WHERE NOT (id = ANY(${keep})) RETURNING id` : await sql`DELETE FROM organizations RETURNING id`
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('reset failed', message)
    return NextResponse.json({ error: 'Reset stopped part-way; nothing further was deleted.', detail: message.slice(0, 400), deletedSoFar: deleted }, { status: 500 })
  }

  // Optionally hand the platform administrator a fresh temporary password, so
  // the person taking the system over sets their own on first sign-in and no
  // password from the build survives the handover. Returned once, here only.
  let temporaryAdminPassword: string | null = null
  if (body.resetAdminPassword) {
    const existing = await sql`SELECT id, email FROM users WHERE role = 'admin' ORDER BY created_at LIMIT 1`
    if (existing[0]) {
      temporaryAdminPassword = generateTempPassword()
      await sql`UPDATE users SET password_hash = ${await hashPassword(temporaryAdminPassword)}, must_change_password = true,
        failed_logins = 0, locked_until = NULL WHERE id = ${String(existing[0].id)}`
    }
  }

  // Make sure a platform administrator still exists to sign in with.
  let adminNote = 'existing platform administrator kept'
  const remaining = await sql`SELECT id FROM users WHERE role = 'admin' LIMIT 1`
  if (!remaining.length) {
    const email = (body.adminEmail ?? process.env.ADMIN_EMAIL ?? 'retrosoft.inc@gmail.com').toLowerCase()
    const password = body.adminPassword ?? process.env.ADMIN_PASSWORD
    if (!password || password.length < 10) {
      adminNote = 'NO ADMIN LEFT: set ADMIN_PASSWORD (10+ characters) or pass adminPassword, then call POST /api/admin/seed.'
    } else {
      await sql`INSERT INTO users (id, role, organization_id, name, email, phone, password_hash, title, must_change_password)
        VALUES (${newId('usr')}, 'admin', NULL, ${body.adminEmail ? 'Platform Admin' : 'Platform Admin'}, ${email}, NULL, ${await hashPassword(password)}, 'Platform administrator', true)`
      adminNote = `platform administrator recreated as ${email} (must change password at first sign-in)`
    }
  }

  return NextResponse.json({
    mode: 'reset',
    deleted,
    usersRemoved: removedUsers.length,
    organizationsRemoved: removedOrgs.length,
    organizationsKept: keep,
    admin: adminNote,
    temporaryAdminPassword,
    next: 'Create each agency at /admin (or POST /api/admin/seed with an organization), then remove ALLOW_DB_RESET from the deployment.',
  })
}

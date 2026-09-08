import { NextResponse } from 'next/server'
import { getSql } from '@/lib/db/client'
import { ensureSchema } from '@/lib/db/migrate'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * Read-only operational snapshot for the platform operator: identities and
 * memberships, agencies, recent email deliveries, jobs and channels.
 * Protected by ADMIN_TOKEN. Never returns password hashes or message bodies.
 *
 *   curl https://<host>/api/admin/inspect -H "x-admin-token: <ADMIN_TOKEN>"
 */
export async function GET(request: Request) {
  const expected = process.env.ADMIN_TOKEN
  const provided = request.headers.get('x-admin-token') ?? ''
  if (!expected || provided !== expected) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  try {
    await ensureSchema()
    const sql = getSql()
    const users = await sql`SELECT u.id, u.role, u.organization_id, u.name, u.email, u.phone, u.active, u.must_change_password, u.last_login_at,
            (SELECT json_agg(json_build_object('org', m.organization_id, 'role', m.role, 'status', m.status)) FROM memberships m WHERE m.user_id = u.id) AS memberships
          FROM users u ORDER BY u.created_at`
    const organizations = await sql`SELECT id, name, code, status, whatsapp, (SELECT count(*) FROM clients c WHERE c.organization_id = o.id) AS clients FROM organizations o ORDER BY created_at`
    const emails = await sql`SELECT id, organization_id, template, to_email, status, attempts, error, created_at, sent_at FROM email_log ORDER BY created_at DESC LIMIT 25`
    const jobs = await sql`SELECT id, type, status, attempts, last_error, created_at FROM jobs ORDER BY created_at DESC LIMIT 15`
    const channels = await sql`SELECT id, organization_id, session_id, phone, status, last_error FROM whatsapp_channels ORDER BY created_at`
    const conversations =
      await sql`SELECT c.phone, c.organization_id, c.mode, c.workflow, c.step, c.last_inbound_at, c.updated_at, (SELECT count(*) FROM conversation_messages m WHERE m.phone = c.phone) AS messages FROM whatsapp_contacts c ORDER BY c.updated_at DESC LIMIT 15`
    const counts = await sql`SELECT (SELECT count(*) FROM clients) AS clients, (SELECT count(*) FROM conversation_messages) AS messages, (SELECT count(*) FROM audit_log WHERE at > now() - interval '1 day') AS audit_24h`
    const audit = await sql`SELECT at, organization_id, actor_user_id, action, target, detail FROM audit_log ORDER BY at DESC LIMIT 20`
    return NextResponse.json({
      audit,
      users,
      organizations,
      emails,
      jobs,
      channels,
      conversations,
      counts: counts[0],
    })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'failed' }, { status: 500 })
  }
}

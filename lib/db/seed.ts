import { hashPassword } from '@/lib/auth/password'
import { getSql } from '@/lib/db/client'
import { ensureSchema } from '@/lib/db/migrate'
import { newId } from '@/lib/ids'

/**
 * Bootstraps the platform: the GoldOak organisation and the platform admin.
 * No demo data. Agencies are invited by the admin; clients sign up themselves.
 */

export const ORG_ID = 'org_goldoak'

export interface BootstrapSummary {
  organization: 'created' | 'exists'
  admin: 'created' | 'exists' | 'skipped'
  adminEmail: string
  purged?: number
  createdOrganization?: { id: string; code: string; adminUserId: string }
}

interface BootstrapInput {
  adminEmail?: string
  adminPassword?: string
  adminName?: string
  whatsapp?: string
  purgeDemo?: boolean
  /** Remove accounts created for testing (emails ending in @example.com). */
  purgeExampleAccounts?: boolean
  /** Remove organisations whose join code starts with TEST, with everything under them. */
  purgeTestOrganizations?: boolean
  /** Start afresh: remove every client, conversation, request and document across all organisations; keep organisations and staff accounts. */
  purgeAllData?: boolean
  /** Create an agency (tenant) and its first agency admin in one call. */
  organization?: { name: string; shortName?: string; code: string; phone?: string; email?: string; greeting?: string; adminName: string; adminEmail: string; adminPassword: string; adminPhone?: string }
}

const DEMO_IDS = {
  users: ['usr_agency_alex', 'usr_client_mwangi', 'usr_client_wanjiru', 'usr_client_apex'],
  clients: ['cli_mwangi', 'cli_wanjiru', 'cli_apex', 'cli_karanja', 'cli_heights', 'cli_kamau'],
}

export async function bootstrap(input: BootstrapInput = {}): Promise<BootstrapSummary> {
  await ensureSchema()
  const sql = getSql()

  const whatsapp = (input.whatsapp ?? process.env.WHATSAPP_BOT_NUMBER ?? '255742473493').replace(/\D/g, '')
  const orgRows = await sql`INSERT INTO organizations (id, name, short_name, phone, email, whatsapp)
    VALUES (${ORG_ID}, 'GoldOak Insurance Agency', 'GoldOak', '+254 729 911 311', 'info@goldoak.co.ke', ${whatsapp})
    ON CONFLICT (id) DO UPDATE SET whatsapp = EXCLUDED.whatsapp, status = 'active', active = true
    RETURNING (xmax = 0) AS inserted`
  const organization = orgRows[0]?.inserted ? 'created' : 'exists'

  let purged = 0
  if (input.purgeDemo) {
    const c = await sql`DELETE FROM clients WHERE id = ANY(${DEMO_IDS.clients}) RETURNING id`
    const u = await sql`DELETE FROM users WHERE id = ANY(${DEMO_IDS.users}) RETURNING id`
    await sql`DELETE FROM tasks WHERE id LIKE 'tsk_00%' AND client_id IS NULL`
    await sql`DELETE FROM activity WHERE id LIKE 'act_00%' AND client_id IS NULL`
    purged = c.length + u.length
  }

  if (input.purgeExampleAccounts) {
    const c = await sql`DELETE FROM clients WHERE email LIKE '%@example.com' OR user_id IN (SELECT id FROM users WHERE email LIKE '%@example.com') RETURNING id`
    const u = await sql`DELETE FROM users WHERE role = 'client' AND email LIKE '%@example.com' RETURNING id`
    await sql`DELETE FROM notifications WHERE user_id IS NULL AND client_id IS NULL AND created_at > now() - interval '1 day' AND kind IN ('new-client')`
    purged += c.length + u.length
  }

  const adminEmail = (input.adminEmail ?? process.env.ADMIN_EMAIL ?? 'retrosoft.inc@gmail.com').toLowerCase()
  const adminPassword = input.adminPassword ?? process.env.ADMIN_PASSWORD
  const existing = await sql`SELECT id FROM users WHERE role = 'admin' AND lower(email) = ${adminEmail} LIMIT 1`
  let admin: BootstrapSummary['admin'] = 'exists'
  if (!existing.length) {
    if (!adminPassword || adminPassword.length < 8) {
      admin = 'skipped'
    } else {
      const hash = await hashPassword(adminPassword)
      await sql`INSERT INTO users (id, role, organization_id, name, email, phone, password_hash, title)
        VALUES (${newId('usr')}, 'admin', ${ORG_ID}, ${input.adminName ?? 'Platform Admin'}, ${adminEmail}, NULL, ${hash}, 'Platform administrator')
        ON CONFLICT (email) DO UPDATE SET role = 'admin', password_hash = EXCLUDED.password_hash, active = true`
      admin = 'created'
    }
  }

  if (input.purgeAllData) {
    for (const table of ['conversation_messages', 'whatsapp_contacts', 'consultations', 'documents', 'uploads', 'business_claims', 'businesses', 'enquiries', 'jobs', 'notifications', 'tasks', 'activity', 'quote_submissions', 'quote_requests', 'claims', 'policies', 'clients', 'processed_webhooks', 'password_resets']) {
      await sql.unsafe(`DELETE FROM ${table}`)
    }
    const u = await sql`DELETE FROM users WHERE role = 'client' RETURNING id`
    purged += u.length
  }

  if (input.purgeTestOrganizations) {
    const orgs = await sql`SELECT id FROM organizations WHERE code LIKE 'TEST%'`
    for (const o of orgs) {
      const id = String(o.id)
      await sql`DELETE FROM uploads WHERE organization_id = ${id}`
      await sql`DELETE FROM business_claims WHERE organization_id = ${id}`
      await sql`DELETE FROM businesses WHERE organization_id = ${id}`
      await sql`DELETE FROM enquiries WHERE organization_id = ${id}`
      await sql`DELETE FROM jobs WHERE organization_id = ${id}`
      await sql`DELETE FROM conversation_messages WHERE organization_id = ${id}`
      await sql`DELETE FROM whatsapp_contacts WHERE organization_id = ${id}`
      await sql`DELETE FROM consultations WHERE organization_id = ${id}`
      await sql`DELETE FROM documents WHERE organization_id = ${id}`
      await sql`DELETE FROM notifications WHERE organization_id = ${id}`
      await sql`DELETE FROM tasks WHERE organization_id = ${id}`
      await sql`DELETE FROM activity WHERE organization_id = ${id}`
      await sql`DELETE FROM clients WHERE organization_id = ${id}`
      await sql`DELETE FROM users WHERE organization_id = ${id}`
      await sql`DELETE FROM audit_log WHERE organization_id = ${id}`
      await sql`DELETE FROM organizations WHERE id = ${id}`
      purged++
    }
    await sql`DELETE FROM whatsapp_contacts WHERE organization_id IS NULL AND phone LIKE '2557000%'`
    await sql`DELETE FROM conversation_messages WHERE phone LIKE '2557000%'`
  }

  let createdOrganization: BootstrapSummary['createdOrganization']
  if (input.organization) {
    const o = input.organization
    const code = o.code.toUpperCase().replace(/[^A-Z0-9-]/g, '')
    const existing = await sql`SELECT id FROM organizations WHERE lower(code) = lower(${code}) LIMIT 1`
    if (existing.length) throw new Error(`Organisation code ${code} already exists`)
    const orgId = newId('org')
    await sql`INSERT INTO organizations (id, name, short_name, phone, email, whatsapp, code, greeting)
      VALUES (${orgId}, ${o.name}, ${o.shortName ?? o.name.split(' ')[0]}, ${o.phone ?? ''}, ${o.email ?? ''}, ${whatsapp}, ${code}, ${o.greeting ?? null})`
    const userId = newId('usr')
    await sql`INSERT INTO users (id, role, organization_id, name, email, phone, password_hash, title, must_change_password)
      VALUES (${userId}, 'agency_admin', ${orgId}, ${o.adminName}, ${o.adminEmail.toLowerCase()}, ${o.adminPhone ?? null}, ${await hashPassword(o.adminPassword)}, 'Agency admin', false)`
    await sql`INSERT INTO memberships (id, user_id, organization_id, role) VALUES (${newId('mem')}, ${userId}, ${orgId}, 'agency_admin') ON CONFLICT DO NOTHING`
    createdOrganization = { id: orgId, code, adminUserId: userId }
  }

  return { organization, admin, adminEmail, purged: input.purgeDemo || input.purgeExampleAccounts || input.purgeTestOrganizations ? purged : undefined, createdOrganization }
}

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
}

interface BootstrapInput {
  adminEmail?: string
  adminPassword?: string
  adminName?: string
  whatsapp?: string
  purgeDemo?: boolean
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
    ON CONFLICT (id) DO UPDATE SET whatsapp = EXCLUDED.whatsapp
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

  const adminEmail = (input.adminEmail ?? process.env.ADMIN_EMAIL ?? 'admin@goldoak.co.ke').toLowerCase()
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

  return { organization, admin, adminEmail, purged: input.purgeDemo ? purged : undefined }
}

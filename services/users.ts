import { getSql } from '@/lib/db/client'
import { ensureSchema } from '@/lib/db/migrate'
import { toOrganization, toPublicUser } from '@/lib/db/mappers'
import { newId } from '@/lib/ids'
import type { Organization, PublicUser } from '@/types/platform'

/** The organisation new client sign-ups are attached to. GoldOak today; configurable per deployment. */
export const DEFAULT_ORGANIZATION_ID = process.env.DEFAULT_ORGANIZATION_ID ?? 'org_goldoak'

export interface UserWithSecret extends PublicUser {
  passwordHash: string
}

/** The sign-in "agency" tab admits agency and admin accounts; the "client" tab admits clients. */
export async function findUserForSignIn(email: string, tab: 'agency' | 'client'): Promise<UserWithSecret | null> {
  await ensureSchema()
  const sql = getSql()
  const rows =
    tab === 'agency'
      ? await sql`SELECT * FROM users WHERE lower(email) = lower(${email}) AND role IN ('agency','admin') LIMIT 1`
      : await sql`SELECT * FROM users WHERE lower(email) = lower(${email}) AND role = 'client' LIMIT 1`
  const row = rows[0]
  if (!row) return null
  return { ...toPublicUser(row), passwordHash: String(row.password_hash) }
}

export async function findUserByPhone(phone: string): Promise<PublicUser | null> {
  await ensureSchema()
  const sql = getSql()
  const rows = await sql`SELECT * FROM users WHERE phone = ${phone} AND active LIMIT 1`
  return rows[0] ? toPublicUser(rows[0]) : null
}

export async function getUser(id: string): Promise<PublicUser | null> {
  const sql = getSql()
  const rows = await sql`SELECT * FROM users WHERE id = ${id} LIMIT 1`
  return rows[0] ? toPublicUser(rows[0]) : null
}

export async function getOrganization(id: string): Promise<Organization | null> {
  const sql = getSql()
  const rows = await sql`SELECT * FROM organizations WHERE id = ${id} LIMIT 1`
  return rows[0] ? toOrganization(rows[0]) : null
}

export async function listOrganizations(): Promise<Organization[]> {
  await ensureSchema()
  const sql = getSql()
  const rows = await sql`SELECT * FROM organizations ORDER BY name`
  return rows.map(toOrganization)
}

export async function emailOrPhoneTaken(email: string, phone: string | null): Promise<'email' | 'phone' | null> {
  const sql = getSql()
  const byEmail = await sql`SELECT 1 FROM users WHERE lower(email) = lower(${email}) LIMIT 1`
  if (byEmail.length) return 'email'
  if (phone) {
    const byPhone = await sql`SELECT 1 FROM users WHERE phone = ${phone} LIMIT 1`
    if (byPhone.length) return 'phone'
  }
  return null
}

interface CreateClientUserInput {
  name: string
  email: string
  phone: string | null
  passwordHash: string
  businessName: string | null
  clientType: 'individual' | 'sme' | 'corporate'
  notes: string | null
}

/** Creates a client user and their client record under the default organisation. */
export async function createClientUser(input: CreateClientUserInput): Promise<{ user: PublicUser; clientId: string }> {
  await ensureSchema()
  const sql = getSql()
  const userId = newId('usr')
  const clientId = newId('cli')
  const clientName = input.businessName?.trim() || input.name

  await sql`INSERT INTO users (id, role, organization_id, name, email, phone, password_hash)
    VALUES (${userId}, 'client', ${DEFAULT_ORGANIZATION_ID}, ${input.name}, ${input.email}, ${input.phone}, ${input.passwordHash})`
  await sql`INSERT INTO clients (id, organization_id, user_id, name, type, phone, email, stage, notes)
    VALUES (${clientId}, ${DEFAULT_ORGANIZATION_ID}, ${userId}, ${clientName}, ${input.clientType}, ${input.phone}, ${input.email}, 'understand', ${input.notes})`

  const user = await getUser(userId)
  if (!user) throw new Error('User was not created')
  return { user, clientId }
}

export async function touchLastSeen(userId: string): Promise<void> {
  const sql = getSql()
  await sql`UPDATE users SET last_seen_at = now() WHERE id = ${userId}`
}

/* ---------- Admin: agency and admin accounts ---------- */

export async function listStaffUsers(): Promise<PublicUser[]> {
  await ensureSchema()
  const sql = getSql()
  const rows = await sql`SELECT * FROM users WHERE role IN ('agency','admin') ORDER BY role, name`
  return rows.map(toPublicUser)
}

export async function listAgencyUsers(organizationId: string): Promise<PublicUser[]> {
  const sql = getSql()
  const rows = await sql`SELECT * FROM users WHERE role IN ('agency','admin') AND organization_id = ${organizationId} AND active ORDER BY name`
  return rows.map(toPublicUser)
}

interface CreateStaffInput {
  role: 'agency' | 'admin'
  organizationId: string
  name: string
  email: string
  phone: string | null
  title: string | null
  passwordHash: string
  createdBy: string
}

export async function createStaffUser(input: CreateStaffInput): Promise<PublicUser> {
  await ensureSchema()
  const sql = getSql()
  const id = newId('usr')
  await sql`INSERT INTO users (id, role, organization_id, name, email, phone, password_hash, title, created_by)
    VALUES (${id}, ${input.role}, ${input.organizationId}, ${input.name}, ${input.email}, ${input.phone}, ${input.passwordHash}, ${input.title}, ${input.createdBy})`
  const user = await getUser(id)
  if (!user) throw new Error('User was not created')
  return user
}

export async function setUserActive(userId: string, active: boolean): Promise<void> {
  const sql = getSql()
  await sql`UPDATE users SET active = ${active} WHERE id = ${userId}`
}

export async function setUserPassword(userId: string, passwordHash: string): Promise<void> {
  const sql = getSql()
  await sql`UPDATE users SET password_hash = ${passwordHash} WHERE id = ${userId}`
}

export async function setUserPhone(userId: string, phone: string | null): Promise<void> {
  const sql = getSql()
  await sql`UPDATE users SET phone = ${phone} WHERE id = ${userId}`
  await sql`UPDATE clients SET phone = ${phone}, updated_at = now() WHERE user_id = ${userId}`
}

export async function countPlatform(): Promise<{ organizations: number; staff: number; clients: number; policies: number; openClaims: number }> {
  await ensureSchema()
  const sql = getSql()
  const rows = await sql`SELECT
    (SELECT count(*) FROM organizations) AS organizations,
    (SELECT count(*) FROM users WHERE role IN ('agency','admin') AND active) AS staff,
    (SELECT count(*) FROM clients) AS clients,
    (SELECT count(*) FROM policies WHERE status IN ('live','renewal-due')) AS policies,
    (SELECT count(*) FROM claims WHERE stage NOT IN ('settled','closed')) AS open_claims`
  const r = rows[0] ?? {}
  return { organizations: Number(r.organizations ?? 0), staff: Number(r.staff ?? 0), clients: Number(r.clients ?? 0), policies: Number(r.policies ?? 0), openClaims: Number(r.open_claims ?? 0) }
}

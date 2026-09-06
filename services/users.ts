import { getSql } from '@/lib/db/client'
import { ensureSchema } from '@/lib/db/migrate'
import { toOrganization, toPublicUser } from '@/lib/db/mappers'
import { newId } from '@/lib/ids'
import type { Organization, PublicUser, Role } from '@/types/platform'

/** The organisation new client sign-ups are attached to. GoldOak today; configurable per deployment. */
export const DEFAULT_ORGANIZATION_ID = process.env.DEFAULT_ORGANIZATION_ID ?? 'org_goldoak'

export interface UserWithSecret extends PublicUser {
  passwordHash: string
}

export async function findUserForSignIn(email: string, role: Role): Promise<UserWithSecret | null> {
  await ensureSchema()
  const sql = getSql()
  const rows = await sql`SELECT * FROM users WHERE lower(email) = lower(${email}) AND role = ${role} LIMIT 1`
  const row = rows[0]
  if (!row) return null
  return { ...toPublicUser(row), passwordHash: String(row.password_hash) }
}

export async function findUserByPhone(phone: string): Promise<PublicUser | null> {
  await ensureSchema()
  const sql = getSql()
  const rows = await sql`SELECT * FROM users WHERE phone = ${phone} LIMIT 1`
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
}

/**
 * Creates a client user, their client record under the default organisation,
 * and the lead task and activity the agency sees on Today.
 */
export async function createClientUser(input: CreateClientUserInput): Promise<PublicUser> {
  await ensureSchema()
  const sql = getSql()
  const userId = newId('usr')
  const clientId = newId('cli')
  const clientName = input.businessName?.trim() || input.name

  await sql`INSERT INTO users (id, role, organization_id, name, email, phone, password_hash)
    VALUES (${userId}, 'client', ${DEFAULT_ORGANIZATION_ID}, ${input.name}, ${input.email}, ${input.phone}, ${input.passwordHash})`

  await sql`INSERT INTO clients (id, organization_id, user_id, name, type, phone, email, stage)
    VALUES (${clientId}, ${DEFAULT_ORGANIZATION_ID}, ${userId}, ${clientName}, ${input.clientType}, ${input.phone}, ${input.email}, 'understand')`

  await sql`INSERT INTO tasks (id, organization_id, client_id, client_name, type, product, summary, timing, sla, priority, due_today, action_kind, action_label)
    VALUES (${newId('tsk')}, ${DEFAULT_ORGANIZATION_ID}, ${clientId}, ${clientName}, 'lead-contact', 'Risk review',
      ${`${input.name} signed up on the website${input.businessName ? ` for ${input.businessName}` : ''}. Book the fact-find.`},
      'Signed up just now', 'on-track', 85, true, 'call', 'Book fact-find')`

  await sql`INSERT INTO activity (id, organization_id, client_id, client_name, kind, title)
    VALUES (${newId('act')}, ${DEFAULT_ORGANIZATION_ID}, ${clientId}, ${clientName}, 'signup', 'New client signed up')`

  const user = await getUser(userId)
  if (!user) throw new Error('User was not created')
  return user
}

export async function touchLastSeen(userId: string): Promise<void> {
  const sql = getSql()
  await sql`UPDATE users SET last_seen_at = now() WHERE id = ${userId}`
}

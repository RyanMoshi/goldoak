import { getSql } from '@/lib/db/client'
import { ensureSchema } from '@/lib/db/migrate'
import { toOrganization, toOrganizationSummary, toPublicUser } from '@/lib/db/mappers'
import { newId } from '@/lib/ids'
import { ensureMembership } from '@/services/memberships'
import type { Organization, OrganizationSummary, PublicUser, Role } from '@/types/platform'

/** The organisation web sign-ups are attached to when no agency was chosen. GoldOak by default. */
export const DEFAULT_ORGANIZATION_ID = process.env.DEFAULT_ORGANIZATION_ID ?? 'org_goldoak'

const STAFF_ROLES = ['admin', 'agency_admin', 'agency'] as const

export interface UserWithSecret extends PublicUser {
  passwordHash: string
}

/** The sign-in "agency" tab admits agency staff, agency admins and the super admin; the "client" tab admits clients. */
export async function findUserForSignIn(email: string, tab: 'agency' | 'client'): Promise<UserWithSecret | null> {
  await ensureSchema()
  const sql = getSql()
  const rows =
    tab === 'agency'
      ? await sql`SELECT * FROM users WHERE lower(email) = lower(${email}) AND role IN ('agency','agency_admin','admin') LIMIT 1`
      : await sql`SELECT * FROM users WHERE lower(email) = lower(${email}) AND role = 'client' LIMIT 1`
  const row = rows[0]
  if (!row) return null
  return { ...toPublicUser(row), passwordHash: String(row.password_hash) }
}

/** One identity per email, whatever the role. Sign-in uses this and then picks a membership. */
export async function findUserWithSecret(email: string): Promise<UserWithSecret | null> {
  await ensureSchema()
  const sql = getSql()
  const rows = await sql`SELECT * FROM users WHERE lower(email) = lower(${email}) LIMIT 1`
  const row = rows[0]
  if (!row) return null
  return { ...toPublicUser(row), passwordHash: String(row.password_hash) }
}

export async function isLocked(userId: string): Promise<boolean> {
  const sql = getSql()
  const rows = await sql`SELECT locked_until FROM users WHERE id = ${userId} AND locked_until > now() LIMIT 1`
  return rows.length > 0
}

/** Counts a failed sign-in; five in a row lock the account for 15 minutes. */
export async function recordFailedLogin(userId: string): Promise<void> {
  const sql = getSql()
  await sql`UPDATE users SET failed_logins = failed_logins + 1, locked_until = CASE WHEN failed_logins + 1 >= 5 THEN now() + interval '15 minutes' ELSE locked_until END WHERE id = ${userId}`
}

export async function recordLogin(userId: string): Promise<void> {
  const sql = getSql()
  await sql`UPDATE users SET failed_logins = 0, locked_until = NULL, last_login_at = now(), last_seen_at = now() WHERE id = ${userId}`
}

export async function markPasswordChanged(userId: string, passwordHash: string): Promise<void> {
  const sql = getSql()
  await sql`UPDATE users SET password_hash = ${passwordHash}, must_change_password = false, password_changed_at = now(), updated_at = now() WHERE id = ${userId}`
}

/** Sets a temporary password that must be replaced at the next sign-in. */
export async function setTemporaryPassword(userId: string, passwordHash: string): Promise<void> {
  const sql = getSql()
  await sql`UPDATE users SET password_hash = ${passwordHash}, must_change_password = true, updated_at = now() WHERE id = ${userId}`
}

export async function findUserByPhone(phone: string): Promise<PublicUser | null> {
  await ensureSchema()
  const sql = getSql()
  const rows = await sql`SELECT * FROM users WHERE phone = ${phone} AND active LIMIT 1`
  return rows[0] ? toPublicUser(rows[0]) : null
}

export async function findUserByEmail(email: string): Promise<PublicUser | null> {
  const sql = getSql()
  const rows = await sql`SELECT * FROM users WHERE lower(email) = lower(${email}) LIMIT 1`
  return rows[0] ? toPublicUser(rows[0]) : null
}

export async function getUser(id: string): Promise<PublicUser | null> {
  const sql = getSql()
  const rows = await sql`SELECT * FROM users WHERE id = ${id} LIMIT 1`
  return rows[0] ? toPublicUser(rows[0]) : null
}

/* ---------- Organisations (tenants) ---------- */

/** A safe stand-in when an organisation row is missing (never persisted). */
export function placeholderOrganization(id: string, name = 'Agency'): Organization {
  return { id, name, shortName: name, phone: '', email: '', whatsapp: '', code: null, active: true, greeting: null, licenceLabel: null, status: 'active', type: null, address: null, description: null, logoPath: null, contactName: null, website: null, branding: {}, aiSettings: {}, reminderDays: [30, 14, 7, 1] }
}

export async function getOrganization(id: string): Promise<Organization | null> {
  const sql = getSql()
  const rows = await sql`SELECT * FROM organizations WHERE id = ${id} LIMIT 1`
  return rows[0] ? toOrganization(rows[0]) : null
}

export async function getOrganizationByCode(code: string): Promise<Organization | null> {
  await ensureSchema()
  const sql = getSql()
  const rows = await sql`SELECT * FROM organizations WHERE lower(code) = lower(${code.trim()}) AND active AND status = 'active' LIMIT 1`
  return rows[0] ? toOrganization(rows[0]) : null
}

export async function listOrganizations(activeOnly = false): Promise<Organization[]> {
  await ensureSchema()
  const sql = getSql()
  const rows = activeOnly ? await sql`SELECT * FROM organizations WHERE active AND status = 'active' ORDER BY name` : await sql`SELECT * FROM organizations ORDER BY name`
  return rows.map(toOrganization)
}

export async function listOrganizationSummaries(): Promise<OrganizationSummary[]> {
  await ensureSchema()
  const sql = getSql()
  const rows = await sql`SELECT o.*,
      (SELECT count(*) FROM users u WHERE u.organization_id = o.id AND u.role IN ('agency','agency_admin') AND u.active) AS staff_count,
      (SELECT count(*) FROM clients c WHERE c.organization_id = o.id) AS client_count,
      (SELECT count(*) FROM whatsapp_contacts w WHERE w.organization_id = o.id AND w.mode = 'human') AS open_conversations
    FROM organizations o ORDER BY (o.status = 'pending') DESC, o.name`
  return rows.map(toOrganizationSummary)
}

export interface OrganizationInput {
  name: string
  shortName: string
  code: string
  phone: string
  email: string
  greeting?: string | null
  licenceLabel?: string | null
  status?: 'pending' | 'active' | 'suspended'
  type?: string | null
  address?: string | null
  description?: string | null
  contactName?: string | null
  logoPath?: string | null
}

export async function codeTaken(code: string, exceptId?: string): Promise<boolean> {
  const sql = getSql()
  const rows = exceptId
    ? await sql`SELECT 1 FROM organizations WHERE lower(code) = lower(${code}) AND id <> ${exceptId} LIMIT 1`
    : await sql`SELECT 1 FROM organizations WHERE lower(code) = lower(${code}) LIMIT 1`
  return rows.length > 0
}

export async function createOrganization(input: OrganizationInput): Promise<Organization> {
  await ensureSchema()
  const sql = getSql()
  const id = newId('org')
  const whatsapp = (process.env.WHATSAPP_BOT_NUMBER ?? '').replace(/\D/g, '')
  const status = input.status ?? 'active'
  await sql`INSERT INTO organizations (id, name, short_name, phone, email, whatsapp, code, greeting, licence_label, status, active, type, address, description, contact_name)
    VALUES (${id}, ${input.name}, ${input.shortName}, ${input.phone}, ${input.email}, ${whatsapp}, ${input.code.toUpperCase()}, ${input.greeting ?? null}, ${input.licenceLabel ?? null}, ${status}, ${status === 'active'}, ${input.type ?? null}, ${input.address ?? null}, ${input.description ?? null}, ${input.contactName ?? null})`
  const org = await getOrganization(id)
  if (!org) throw new Error('Organisation was not created')
  return org
}

export async function updateOrganization(id: string, input: Partial<OrganizationInput> & { active?: boolean }): Promise<void> {
  const sql = getSql()
  const current = await getOrganization(id)
  if (!current) throw new Error('Organisation not found')
  await sql`UPDATE organizations SET
      name = ${input.name ?? current.name},
      short_name = ${input.shortName ?? current.shortName},
      phone = ${input.phone ?? current.phone},
      email = ${input.email ?? current.email},
      code = ${input.code !== undefined ? input.code.toUpperCase() : current.code},
      greeting = ${input.greeting !== undefined ? input.greeting : current.greeting},
      licence_label = ${input.licenceLabel !== undefined ? input.licenceLabel : current.licenceLabel},
      active = ${input.active ?? current.active},
      status = ${input.status ?? (input.active === undefined ? current.status : input.active ? 'active' : 'suspended')},
      type = ${input.type !== undefined ? input.type : current.type},
      address = ${input.address !== undefined ? input.address : current.address},
      description = ${input.description !== undefined ? input.description : current.description},
      contact_name = ${input.contactName !== undefined ? input.contactName : current.contactName},
      logo_path = ${input.logoPath !== undefined ? input.logoPath : current.logoPath},
      approved_at = CASE WHEN ${input.status ?? ''} = 'active' AND approved_at IS NULL THEN now() ELSE approved_at END,
      updated_at = now()
    WHERE id = ${id}`
}

export async function updateBranding(id: string, branding: Record<string, string>, reminderDays: number[]): Promise<void> {
  const sql = getSql()
  const clean: Record<string, string> = {}
  for (const [k, v] of Object.entries(branding)) if (v) clean[k] = v
  await sql`UPDATE organizations SET branding = ${sql.json(clean as never)}, reminder_days = ${sql.json(reminderDays as never)}, website = COALESCE(${clean.website ?? null}, website), updated_at = now() WHERE id = ${id}`
}

export async function updateAiSettings(id: string, settings: Organization['aiSettings']): Promise<void> {
  const sql = getSql()
  await sql`UPDATE organizations SET ai_settings = ${sql.json(settings as never)}, updated_at = now() WHERE id = ${id}`
}

/* ---------- Clients ---------- */

export async function emailOrPhoneTaken(email: string | null, phone: string | null): Promise<'email' | 'phone' | null> {
  const sql = getSql()
  if (email) {
    const byEmail = await sql`SELECT 1 FROM users WHERE lower(email) = lower(${email}) LIMIT 1`
    if (byEmail.length) return 'email'
  }
  if (phone) {
    const byPhone = await sql`SELECT 1 FROM users WHERE phone = ${phone} LIMIT 1`
    if (byPhone.length) return 'phone'
  }
  return null
}

interface CreateClientUserInput {
  organizationId?: string
  name: string
  email: string
  phone: string | null
  passwordHash: string
  businessName: string | null
  clientType: 'individual' | 'sme' | 'corporate'
  notes: string | null
  /** True when the password was generated for them (invitation, WhatsApp sign-up). */
  temporaryPassword?: boolean
  invitedBy?: string | null
}

/** Creates a client user and their client record under an organisation (the default one unless given). */
export async function createClientUser(input: CreateClientUserInput): Promise<{ user: PublicUser; clientId: string }> {
  await ensureSchema()
  const sql = getSql()
  const orgId = input.organizationId ?? DEFAULT_ORGANIZATION_ID
  const userId = newId('usr')
  const clientId = newId('cli')
  const clientName = input.businessName?.trim() || input.name

  await sql`INSERT INTO users (id, role, organization_id, name, email, phone, password_hash, must_change_password)
    VALUES (${userId}, 'client', ${orgId}, ${input.name}, ${input.email}, ${input.phone}, ${input.passwordHash}, ${input.temporaryPassword ?? false})`
  await sql`INSERT INTO clients (id, organization_id, user_id, name, type, phone, email, stage, notes)
    VALUES (${clientId}, ${orgId}, ${userId}, ${clientName}, ${input.clientType}, ${input.phone}, ${input.email}, 'understand', ${input.notes})`
  await ensureMembership({ userId, organizationId: orgId, role: 'client', clientId, invitedBy: input.invitedBy ?? null })

  const user = await getUser(userId)
  if (!user) throw new Error('User was not created')
  return { user, clientId }
}

/**
 * Adds an existing platform identity to another agency as a client, creating
 * the agency's own client record. The person's other agencies never see it.
 */
export async function attachExistingUserAsClient(input: { userId: string; organizationId: string; name: string; clientType: 'individual' | 'sme' | 'corporate'; phone: string | null; email: string | null; notes: string | null; invitedBy: string | null }): Promise<string> {
  await ensureSchema()
  const sql = getSql()
  const existing = await sql`SELECT id FROM clients WHERE user_id = ${input.userId} AND organization_id = ${input.organizationId} LIMIT 1`
  if (existing[0]) return String(existing[0].id)
  const clientId = newId('cli')
  await sql`INSERT INTO clients (id, organization_id, user_id, name, type, phone, email, stage, notes)
    VALUES (${clientId}, ${input.organizationId}, ${input.userId}, ${input.name}, ${input.clientType}, ${input.phone}, ${input.email}, 'understand', ${input.notes})`
  await ensureMembership({ userId: input.userId, organizationId: input.organizationId, role: 'client', clientId, invitedBy: input.invitedBy, status: 'invited' })
  return clientId
}

export async function touchLastSeen(userId: string): Promise<void> {
  const sql = getSql()
  await sql`UPDATE users SET last_seen_at = now() WHERE id = ${userId}`
}

/* ---------- Staff accounts (super admin and agency admins) ---------- */

/** All agency-side accounts, optionally for one organisation. */
export async function listStaffUsers(organizationId?: string): Promise<PublicUser[]> {
  await ensureSchema()
  const sql = getSql()
  const rows = organizationId
    ? await sql`SELECT * FROM users WHERE role IN ('agency','agency_admin') AND organization_id = ${organizationId} ORDER BY role, name`
    : await sql`SELECT * FROM users WHERE role IN ('agency','agency_admin','admin') ORDER BY organization_id, role, name`
  return rows.map(toPublicUser)
}

export async function listAgencyUsers(organizationId: string): Promise<PublicUser[]> {
  const sql = getSql()
  const rows = await sql`SELECT * FROM users WHERE role IN ('agency','agency_admin','admin') AND organization_id = ${organizationId} AND active ORDER BY name`
  return rows.map(toPublicUser)
}

interface CreateStaffInput {
  role: Extract<Role, 'agency' | 'agency_admin' | 'admin'>
  organizationId: string
  name: string
  email: string
  phone: string | null
  title: string | null
  passwordHash: string
  createdBy: string | null
  temporaryPassword?: boolean
}

export async function createStaffUser(input: CreateStaffInput): Promise<PublicUser> {
  await ensureSchema()
  if (!STAFF_ROLES.includes(input.role)) throw new Error('Invalid staff role')
  const sql = getSql()
  const id = newId('usr')
  await sql`INSERT INTO users (id, role, organization_id, name, email, phone, password_hash, title, created_by, must_change_password)
    VALUES (${id}, ${input.role}, ${input.organizationId}, ${input.name}, ${input.email}, ${input.phone}, ${input.passwordHash}, ${input.title}, ${input.createdBy}, ${input.temporaryPassword ?? false})`
  if (input.role !== 'admin') await ensureMembership({ userId: id, organizationId: input.organizationId, role: input.role, invitedBy: input.createdBy })
  const user = await getUser(id)
  if (!user) throw new Error('User was not created')
  return user
}

/** True when the user belongs to the organisation (used to scope every staff mutation). */
export async function userInOrganization(userId: string, organizationId: string): Promise<boolean> {
  const sql = getSql()
  const rows = await sql`SELECT 1 FROM users WHERE id = ${userId} AND organization_id = ${organizationId} LIMIT 1`
  return rows.length > 0
}

export async function setUserActive(userId: string, active: boolean): Promise<void> {
  const sql = getSql()
  await sql`UPDATE users SET active = ${active} WHERE id = ${userId}`
}

export async function setUserRole(userId: string, role: Extract<Role, 'agency' | 'agency_admin'>): Promise<void> {
  const sql = getSql()
  await sql`UPDATE users SET role = ${role} WHERE id = ${userId} AND role IN ('agency','agency_admin')`
}

export async function setUserPassword(userId: string, passwordHash: string): Promise<void> {
  const sql = getSql()
  await sql`UPDATE users SET password_hash = ${passwordHash} WHERE id = ${userId}`
}

/** Renames the account and, for individuals, the client record that carries the same name. */
export async function updateUserName(userId: string, name: string): Promise<void> {
  const sql = getSql()
  const rows = await sql`UPDATE users SET name = ${name}, updated_at = now() WHERE id = ${userId} RETURNING (SELECT name FROM users WHERE id = ${userId}) AS old_name`
  await sql`UPDATE clients SET name = ${name}, updated_at = now() WHERE user_id = ${userId} AND type = 'individual'`
  void rows
}

export async function updateUserEmail(userId: string, email: string): Promise<void> {
  const sql = getSql()
  await sql`UPDATE users SET email = ${email.toLowerCase()}, updated_at = now() WHERE id = ${userId}`
  await sql`UPDATE clients SET email = ${email.toLowerCase()}, updated_at = now() WHERE user_id = ${userId}`
}

export async function setUserPhone(userId: string, phone: string | null): Promise<void> {
  const sql = getSql()
  await sql`UPDATE users SET phone = ${phone} WHERE id = ${userId}`
  await sql`UPDATE clients SET phone = ${phone}, updated_at = now() WHERE user_id = ${userId}`
}

export async function countPlatform(): Promise<{ organizations: number; staff: number; clients: number; policies: number; openClaims: number; handoffs: number }> {
  await ensureSchema()
  const sql = getSql()
  const rows = await sql`SELECT
    (SELECT count(*) FROM organizations WHERE active) AS organizations,
    (SELECT count(*) FROM users WHERE role IN ('agency','agency_admin') AND active) AS staff,
    (SELECT count(*) FROM clients) AS clients,
    (SELECT count(*) FROM policies WHERE status IN ('live','renewal-due')) AS policies,
    (SELECT count(*) FROM claims WHERE stage NOT IN ('settled','closed')) AS open_claims,
    (SELECT count(*) FROM whatsapp_contacts WHERE mode = 'human') AS handoffs`
  const r = rows[0] ?? {}
  return {
    organizations: Number(r.organizations ?? 0),
    staff: Number(r.staff ?? 0),
    clients: Number(r.clients ?? 0),
    policies: Number(r.policies ?? 0),
    openClaims: Number(r.open_claims ?? 0),
    handoffs: Number(r.handoffs ?? 0),
  }
}

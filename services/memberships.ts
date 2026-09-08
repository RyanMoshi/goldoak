import { getSql } from '@/lib/db/client'
import { ensureSchema } from '@/lib/db/migrate'
import { toMembership } from '@/lib/db/mappers'
import { newId } from '@/lib/ids'
import type { Membership } from '@/types/platform'

/**
 * Platform identity vs agency relationship. `users` is who a person is;
 * `memberships` is which agencies they belong to and as what. Sign-in picks
 * the membership (or asks), and the session carries that organisation id.
 */

export async function listMemberships(userId: string): Promise<Membership[]> {
  await ensureSchema()
  const sql = getSql()
  const rows = await sql`SELECT m.*, o.name AS organization_name, o.short_name AS organization_short_name
    FROM memberships m JOIN organizations o ON o.id = m.organization_id
    WHERE m.user_id = ${userId} AND m.status <> 'suspended' AND o.status <> 'suspended' ORDER BY m.created_at ASC`
  return rows.map(toMembership)
}

export async function getMembership(userId: string, organizationId: string): Promise<Membership | null> {
  await ensureSchema()
  const sql = getSql()
  const rows = await sql`SELECT m.*, o.name AS organization_name, o.short_name AS organization_short_name
    FROM memberships m JOIN organizations o ON o.id = m.organization_id WHERE m.user_id = ${userId} AND m.organization_id = ${organizationId} LIMIT 1`
  return rows[0] ? toMembership(rows[0]) : null
}

interface EnsureInput {
  userId: string
  organizationId: string
  role: Membership['role']
  clientId?: string | null
  invitedBy?: string | null
  status?: Membership['status']
}

/** Creates the relationship if missing; never downgrades an existing one. */
export async function ensureMembership(input: EnsureInput): Promise<Membership> {
  await ensureSchema()
  const sql = getSql()
  await sql`INSERT INTO memberships (id, user_id, organization_id, role, client_id, status, invited_by)
    VALUES (${newId('mem')}, ${input.userId}, ${input.organizationId}, ${input.role}, ${input.clientId ?? null}, ${input.status ?? 'active'}, ${input.invitedBy ?? null})
    ON CONFLICT (user_id, organization_id) DO UPDATE SET
      client_id = COALESCE(EXCLUDED.client_id, memberships.client_id),
      status = CASE WHEN memberships.status = 'suspended' THEN memberships.status ELSE 'active' END`
  // Keep the legacy column pointing at a valid primary agency for older code paths.
  await sql`UPDATE users SET organization_id = COALESCE(organization_id, ${input.organizationId}) WHERE id = ${input.userId}`
  const m = await getMembership(input.userId, input.organizationId)
  if (!m) throw new Error('Membership was not created')
  return m
}

export async function setMembershipStatus(userId: string, organizationId: string, status: Membership['status']): Promise<void> {
  const sql = getSql()
  await sql`UPDATE memberships SET status = ${status} WHERE user_id = ${userId} AND organization_id = ${organizationId}`
}

export async function setMembershipRole(userId: string, organizationId: string, role: Membership['role']): Promise<void> {
  const sql = getSql()
  await sql`UPDATE memberships SET role = ${role} WHERE user_id = ${userId} AND organization_id = ${organizationId}`
  await sql`UPDATE users SET role = ${role} WHERE id = ${userId} AND organization_id = ${organizationId} AND role <> 'admin'`
}

/** Staff of one agency, by membership (the source of truth for who works where). */
export async function listStaffMemberships(organizationId: string): Promise<Membership[]> {
  await ensureSchema()
  const sql = getSql()
  const rows = await sql`SELECT m.*, o.name AS organization_name, o.short_name AS organization_short_name
    FROM memberships m JOIN organizations o ON o.id = m.organization_id WHERE m.organization_id = ${organizationId} AND m.role IN ('agency_admin','agency') ORDER BY m.role, m.created_at`
  return rows.map(toMembership)
}

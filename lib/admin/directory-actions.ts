'use server'

import { revalidatePath } from 'next/cache'
import { requireSession } from '@/lib/auth/server'
import { getSql } from '@/lib/db/client'
import { ensureSchema } from '@/lib/db/migrate'
import { audit } from '@/services/audit'

/**
 * What Super Admin can do to an account.
 *
 * "Every super power" still runs through checks rather than around them: the
 * session is re-read from the cookie on every call, the target is re-read from
 * the database, and two rules hold no matter who is asking. An administrator
 * cannot act on their own account, and the last active administrator cannot be
 * removed. Locking every operator out of the platform is not a power worth
 * having.
 */

export interface AdminActionState {
  error?: string
  success?: string
}

async function operator(): Promise<{ uid: string; name: string }> {
  const session = await requireSession('admin')
  return { uid: session.uid, name: session.name }
}

async function assertNotLastAdmin(userId: string): Promise<string | null> {
  const sql = getSql()
  const rows = await sql`SELECT count(*)::int AS n FROM users WHERE role = 'admin' AND active = true AND id <> ${userId}`
  return Number(rows[0]?.n ?? 0) > 0 ? null : 'That is the last active administrator. Promote somebody else first.'
}

export async function setUserActiveAction(userId: string, active: boolean): Promise<AdminActionState> {
  const me = await operator()
  if (userId === me.uid) return { error: 'You cannot deactivate your own account.' }
  await ensureSchema()
  const sql = getSql()

  const rows = await sql`SELECT id, name, role FROM users WHERE id = ${userId} LIMIT 1`
  const target = rows[0]
  if (!target) return { error: 'That account no longer exists.' }
  if (!active && String(target.role) === 'admin') {
    const blocked = await assertNotLastAdmin(userId)
    if (blocked) return { error: blocked }
  }

  await sql`UPDATE users SET active = ${active} WHERE id = ${userId}`
  await audit({
    organizationId: null,
    actorUserId: me.uid,
    action: active ? 'admin.user-reactivated' : 'admin.user-deactivated',
    target: userId,
    detail: { name: String(target.name) },
  })
  revalidatePath('/super-admin/users')
  return { success: active ? `${String(target.name)} can sign in again.` : `${String(target.name)} can no longer sign in.` }
}

export async function setUserRoleAction(userId: string, role: 'admin' | 'agency_admin' | 'agency' | 'client'): Promise<AdminActionState> {
  const me = await operator()
  if (userId === me.uid) return { error: 'You cannot change your own role.' }
  await ensureSchema()
  const sql = getSql()

  const rows = await sql`SELECT id, name, role FROM users WHERE id = ${userId} LIMIT 1`
  const target = rows[0]
  if (!target) return { error: 'That account no longer exists.' }
  if (String(target.role) === 'admin' && role !== 'admin') {
    const blocked = await assertNotLastAdmin(userId)
    if (blocked) return { error: blocked }
  }

  await sql`UPDATE users SET role = ${role} WHERE id = ${userId}`
  await audit({ organizationId: null, actorUserId: me.uid, action: 'admin.user-role-changed', target: userId, detail: { from: String(target.role), to: role } })
  revalidatePath('/super-admin/users')
  return { success: `${String(target.name)} is now ${role.replace('_', ' ')}.` }
}

/**
 * Deleting a person. Their history is not theirs alone: a conversation, an
 * invoice or an audit entry belongs to the agency too, so those keep pointing
 * at a record that says the account was removed rather than vanishing with it.
 */
export async function deleteUserAction(userId: string): Promise<AdminActionState> {
  const me = await operator()
  if (userId === me.uid) return { error: 'You cannot delete your own account.' }
  await ensureSchema()
  const sql = getSql()

  const rows = await sql`SELECT id, name, email, role FROM users WHERE id = ${userId} LIMIT 1`
  const target = rows[0]
  if (!target) return { error: 'That account no longer exists.' }
  if (String(target.role) === 'admin') {
    const blocked = await assertNotLastAdmin(userId)
    if (blocked) return { error: blocked }
  }

  try {
    await sql`DELETE FROM memberships WHERE user_id = ${userId}`
    await sql`UPDATE clients SET user_id = NULL WHERE user_id = ${userId}`
    await sql`DELETE FROM users WHERE id = ${userId}`
  } catch (error) {
    console.error('user delete failed', error instanceof Error ? error.message : error)
    return { error: 'That account is still referenced elsewhere. Deactivate it instead, or remove its records first.' }
  }

  await audit({ organizationId: null, actorUserId: me.uid, action: 'admin.user-deleted', target: userId, detail: { name: String(target.name), email: String(target.email) } })
  revalidatePath('/super-admin/users')
  return { success: `${String(target.name)} has been deleted.` }
}

export async function setAgencyActiveAction(organizationId: string, active: boolean): Promise<AdminActionState> {
  const me = await operator()
  await ensureSchema()
  const sql = getSql()
  const rows = await sql`UPDATE organizations SET active = ${active}, status = ${active ? 'active' : 'suspended'} WHERE id = ${organizationId} RETURNING name`
  if (!rows[0]) return { error: 'That agency no longer exists.' }
  await audit({ organizationId, actorUserId: me.uid, action: active ? 'admin.agency-reactivated' : 'admin.agency-suspended', target: organizationId })
  revalidatePath('/super-admin/users')
  revalidatePath('/super-admin')
  return { success: `${String(rows[0].name)} is now ${active ? 'active' : 'suspended'}.` }
}

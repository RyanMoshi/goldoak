import { homeFor, signSession, type Role } from '@/lib/auth/session'
import type { PendingLogin } from '@/lib/auth/pending'
import { listMemberships } from '@/services/memberships'
import { DEFAULT_ORGANIZATION_ID, findUserByEmail, recordLogin } from '@/services/users'

/**
 * Turning an accepted code into a real session.
 *
 * Everything is re-read from the database here rather than carried in the
 * challenge: if the account was deactivated, or its memberships changed, in the
 * minute between typing a password and typing a code, this is where that is
 * caught. The challenge is only proof that the password was right.
 */

export interface CompletedLogin {
  token: string
  role: Role
  mustChangePassword: boolean
  /** More than one agency to choose between. */
  multipleAgencies: boolean
}

export type CompleteResult = { ok: true; login: CompletedLogin } | { ok: false; error: string }

export async function completeLogin(pending: PendingLogin): Promise<CompleteResult> {
  const user = await findUserByEmail(pending.email)
  if (!user || user.id !== pending.uid) return { ok: false, error: 'That account is no longer available. Please sign in again.' }
  if (!user.active) return { ok: false, error: 'This account has been deactivated. Contact your agency.' }

  if (pending.door === 'super-admin') {
    if (user.role !== 'admin') return { ok: false, error: 'That account is not a platform administrator.' }
    const token = await signSession({
      uid: user.id,
      role: 'admin',
      oid: user.organizationId ?? DEFAULT_ORGANIZATION_ID,
      name: user.name,
      mcp: user.mustChangePassword || undefined,
    })
    await recordLogin(user.id)
    return { ok: true, login: { token, role: 'admin', mustChangePassword: user.mustChangePassword, multipleAgencies: false } }
  }

  const memberships = (await listMemberships(user.id)).filter(
    (m) => m.status !== 'suspended' && (pending.tab === 'agency' ? m.role !== 'client' : m.role === 'client'),
  )
  if (user.role !== 'admin' && memberships.length === 0) {
    return { ok: false, error: 'That account has no access here any more. Please sign in again.' }
  }

  const role: Role = user.role === 'admin' ? 'admin' : memberships[0].role
  const membership = user.role === 'admin' ? null : memberships[0]
  const token = await signSession({
    uid: user.id,
    role,
    oid: membership?.organizationId ?? user.organizationId ?? DEFAULT_ORGANIZATION_ID,
    name: user.name,
    mcp: user.mustChangePassword || undefined,
  })
  await recordLogin(user.id)
  return {
    ok: true,
    login: {
      token,
      role,
      mustChangePassword: user.mustChangePassword,
      multipleAgencies: user.role !== 'admin' && memberships.length > 1,
    },
  }
}

/** Where an accepted code lands you. */
export function destinationFor(login: CompletedLogin, next: string): string {
  if (login.mustChangePassword) return '/account/password?first=1'
  if (login.multipleAgencies) return '/choose-agency'
  return next.startsWith('/') ? next : homeFor(login.role)
}

'use server'

import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { hashPassword, verifyPassword } from '@/lib/auth/password'
import { SESSION_COOKIE, SESSION_DAYS, homeFor, signSession, type Role, type SessionPayload } from '@/lib/auth/session'
import { getSession } from '@/lib/auth/server'
import { DatabaseNotConfiguredError } from '@/lib/db/client'
import { normalizePhone } from '@/lib/format'
import { onClientSignedUp } from '@/services/automation'
import { audit } from '@/services/audit'
import { sendTemplateEmail } from '@/services/emails'
import { getMembership, listMemberships } from '@/services/memberships'
import { notify } from '@/services/notifications'
import { codeTaken, createClientUser, createOrganization, createStaffUser, emailOrPhoneTaken, findUserByEmail, findUserWithSecret, getOrganizationByCode, isLocked, markPasswordChanged, recordFailedLogin, recordLogin, setUserPassword, DEFAULT_ORGANIZATION_ID } from '@/services/users'
import type { Membership } from '@/types/platform'

export interface AuthState {
  error?: string
  field?: 'email' | 'password' | 'name' | 'phone' | 'confirm'
}

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://goldoak.vercel.app'
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function setSessionCookie(token: string) {
  cookies().set(SESSION_COOKIE, token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: SESSION_DAYS * 86400 })
}

function safeNext(value: FormDataEntryValue | null, role: Role): string {
  const next = typeof value === 'string' ? value : ''
  const prefixes = role === 'admin' ? ['/super-admin', '/agency'] : role === 'agency' || role === 'agency_admin' ? ['/agency'] : ['/portal']
  return prefixes.some((p) => next.startsWith(p)) ? next : homeFor(role)
}

function friendly(error: unknown): AuthState {
  if (error instanceof DatabaseNotConfiguredError) return { error: 'Accounts are not available yet: the database has not been connected. Please try again shortly.' }
  const detail = error instanceof Error ? error.message : String(error)
  console.error('auth action failed', detail)
  if (process.env.DEBUG_AUTH_ERRORS === '1') return { error: `Something went wrong on our side: ${detail.slice(0, 300)}` }
  return { error: 'Something went wrong on our side. Please try again.' }
}

function requestMeta(): { ip: string; agent: string } {
  const h = headers()
  return { ip: h.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown', agent: (h.get('user-agent') ?? '').slice(0, 160) }
}

/** Builds the session for one membership (or the platform admin). */
async function sessionFor(user: { id: string; name: string; role: Role; organizationId: string | null; mustChangePassword: boolean }, membership: Membership | null): Promise<string> {
  const role: Role = user.role === 'admin' ? 'admin' : (membership?.role ?? user.role)
  const oid = user.role === 'admin' ? (user.organizationId ?? DEFAULT_ORGANIZATION_ID) : (membership?.organizationId ?? user.organizationId ?? DEFAULT_ORGANIZATION_ID)
  return signSession({ uid: user.id, role, oid, name: user.name, mcp: user.mustChangePassword || undefined })
}

/**
 * Sign in. One identity per email; the tab only decides which memberships
 * count (staff or client). With several agencies the person chooses one.
 * Five failed attempts lock the account for 15 minutes. A temporary password
 * lands on the mandatory change-password screen before anything else.
 */
export async function signInAction(formData: FormData): Promise<AuthState> {
  const tab: 'agency' | 'client' = formData.get('role') === 'agency' ? 'agency' : 'client'
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')
  if (!EMAIL.test(email)) return { error: 'Enter the email address on your account.', field: 'email' }
  if (!password) return { error: 'Enter your password.', field: 'password' }

  let token: string
  let role: Role
  let mustChange = false
  let multi = false
  try {
    const user = await findUserWithSecret(email)
    const meta = requestMeta()
    if (user && (await isLocked(user.id))) {
      await audit({ organizationId: user.organizationId, actorUserId: user.id, action: 'auth.locked-attempt', target: user.id, detail: meta })
      return { error: 'Too many failed attempts. This account is locked for 15 minutes. Use "Forgot your password?" if you need to reset it.', field: 'password' }
    }
    const ok = user ? await verifyPassword(password, user.passwordHash) : false
    if (!user || !ok) {
      if (user) {
        await recordFailedLogin(user.id)
        await audit({ organizationId: user.organizationId, actorUserId: user.id, action: 'auth.failed', target: user.id, detail: meta })
      } else {
        await audit({ organizationId: null, actorUserId: null, action: 'auth.failed', target: email, detail: meta })
      }
      return { error: 'That email and password do not match.', field: 'password' }
    }
    if (!user.active) return { error: 'This account has been deactivated. Contact your agency.', field: 'email' }

    const memberships = (await listMemberships(user.id)).filter((m) => m.status !== 'suspended' && (tab === 'agency' ? m.role !== 'client' : m.role === 'client'))
    if (user.role !== 'admin' && memberships.length === 0) {
      return { error: tab === 'agency' ? 'This email is a client account. Use the Client tab.' : 'This email is a staff account. Use the Agency tab.', field: 'email' }
    }
    multi = user.role !== 'admin' && memberships.length > 1
    role = user.role === 'admin' ? 'admin' : memberships[0].role
    mustChange = user.mustChangePassword
    token = await sessionFor(user, user.role === 'admin' ? null : memberships[0])
    await recordLogin(user.id)
    await audit({ organizationId: user.organizationId, actorUserId: user.id, action: 'auth.signed-in', target: user.id, detail: { ...meta, tab, memberships: memberships.length } })
    void sendTemplateEmail({ key: 'security-login', to: user.email, organizationId: user.organizationId, userId: user.id, vars: { first_name: user.name.split(' ')[0], login_time: new Date().toUTCString(), ip: meta.ip, device: meta.agent }, category: 'security' }).catch(() => null)
  } catch (error) {
    return friendly(error)
  }

  setSessionCookie(token)
  if (mustChange) redirect('/account/password?first=1')
  if (multi) redirect('/choose-agency')
  redirect(safeNext(formData.get('next'), role))
}

/** After sign-in with several agencies: pick one. Only memberships the person actually holds are accepted. */
export async function chooseAgencyAction(organizationId: string): Promise<AuthState> {
  const session = await getSession()
  if (!session) redirect('/signin')
  try {
    const membership = await getMembership(session.uid, organizationId)
    if (!membership || membership.status === 'suspended') return { error: 'You do not belong to that agency.' }
    const token = await signSession({ uid: session.uid, role: membership.role, oid: membership.organizationId, name: session.name, mcp: session.mcp, imp: session.imp })
    setSessionCookie(token)
    await audit({ organizationId, actorUserId: session.uid, action: 'auth.agency-selected', target: organizationId })
  } catch (error) {
    return friendly(error)
  }
  redirect(homeFor((await getMembership(session.uid, organizationId))?.role ?? 'client'))
}

export interface PasswordState {
  error?: string
  success?: string
}

/** Mandatory on first login with a temporary password; also used from Profile. */
export async function changePasswordAction(formData: FormData): Promise<PasswordState> {
  const session = await getSession()
  if (!session) redirect('/signin')
  const current = String(formData.get('current') ?? '')
  const password = String(formData.get('password') ?? '')
  const confirm = String(formData.get('confirm') ?? '')
  if (password.length < 10) return { error: 'Use at least 10 characters. A short sentence works well.' }
  if (!/[a-z]/i.test(password) || !/\d/.test(password)) return { error: 'Include at least one letter and one number.' }
  if (password !== confirm) return { error: 'The two passwords do not match.' }
  let next: string
  try {
    const user = await findUserWithSecret(await emailFor(session))
    if (!user) return { error: 'Account not found.' }
    if (!(await verifyPassword(current, user.passwordHash))) return { error: 'The current password is not right.' }
    if (await verifyPassword(password, user.passwordHash)) return { error: 'Choose a password you have not used here before.' }
    await markPasswordChanged(user.id, await hashPassword(password))
    await audit({ organizationId: user.organizationId, actorUserId: user.id, action: 'user.password-changed', target: user.id, detail: requestMeta() })
    void sendTemplateEmail({ key: 'security-password-changed', to: user.email, organizationId: user.organizationId, userId: user.id, vars: { first_name: user.name.split(' ')[0] }, category: 'security' }).catch(() => null)
    const memberships = user.role === 'admin' ? [] : await listMemberships(user.id)
    const token = await signSession({ uid: user.id, role: session.role, oid: session.oid, name: user.name, imp: session.imp })
    setSessionCookie(token)
    next = user.role !== 'admin' && memberships.length > 1 && session.mcp ? '/choose-agency' : homeFor(session.role)
  } catch (error) {
    return friendly(error) as PasswordState
  }
  redirect(next)
}

async function emailFor(session: SessionPayload): Promise<string> {
  const { getUser } = await import('@/services/users')
  const user = await getUser(session.uid)
  return user?.email ?? ''
}

/** Clients only. Agency and admin accounts are created by the platform admin. */
export async function signUpAction(formData: FormData): Promise<AuthState> {
  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const phoneInput = String(formData.get('phone') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const confirm = String(formData.get('confirm') ?? '')
  const businessName = String(formData.get('businessName') ?? '').trim() || null
  const clientTypeRaw = String(formData.get('clientType') ?? 'individual')
  const clientType = clientTypeRaw === 'sme' || clientTypeRaw === 'corporate' ? clientTypeRaw : 'individual'
  const protect = String(formData.get('protect') ?? '').trim().slice(0, 500) || null
  const agencyCode = String(formData.get('agency') ?? '').trim()

  if (name.length < 2) return { error: 'Enter your full name.', field: 'name' }
  if (!EMAIL.test(email)) return { error: 'Enter a valid email address.', field: 'email' }
  const phone = phoneInput ? normalizePhone(phoneInput) : null
  if (!phoneInput) return { error: 'Enter your WhatsApp number so we can reach you.', field: 'phone' }
  if (!phone) return { error: 'Enter a valid mobile number, e.g. 0712 345 678 or +255 7xx xxx xxx.', field: 'phone' }
  if (password.length < 10) return { error: 'Use at least 10 characters for your password.', field: 'password' }
  if (password !== confirm) return { error: 'The two passwords do not match.', field: 'confirm' }

  let token: string
  try {
    const taken = await emailOrPhoneTaken(email, phone)
    if (taken === 'email') return { error: 'An account with that email already exists. Sign in instead.', field: 'email' }
    if (taken === 'phone') return { error: 'That phone number is already registered. Sign in instead.', field: 'phone' }
    const passwordHash = await hashPassword(password)
    const agency = agencyCode ? await getOrganizationByCode(agencyCode) : null
    const { user, clientId } = await createClientUser({ organizationId: agency?.id, name, email, phone, passwordHash, businessName, clientType, notes: protect })
    token = await signSession({ uid: user.id, role: 'client', oid: user.organizationId ?? DEFAULT_ORGANIZATION_ID, name: user.name })
    await onClientSignedUp({ user, clientId, clientName: businessName ?? name, protect })
    await audit({ organizationId: user.organizationId, actorUserId: user.id, action: 'auth.signed-up', target: user.id, detail: requestMeta() })
  } catch (error) {
    return friendly(error)
  }
  setSessionCookie(token)
  redirect('/verify-email?next=/portal?welcome=1')
}

export async function signOutAction(): Promise<void> {
  const session = await getSession()
  if (session) await audit({ organizationId: session.oid, actorUserId: session.uid, action: 'auth.signed-out', target: session.uid }).catch(() => null)
  cookies().delete(SESSION_COOKIE)
  redirect('/')
}

/* ---------- Agency self sign-up ---------- */

export interface AgencySignUpState {
  error?: string
  field?: 'name' | 'code' | 'email' | 'phone' | 'adminName' | 'adminEmail' | 'password' | 'confirm'
}

/**
 * An agency registers itself. The organisation starts as `pending`; the platform
 * admin approves it before it receives WhatsApp contacts. The agency admin can
 * sign in straight away to set up settings and team.
 */
export async function agencySignUpAction(formData: FormData): Promise<AgencySignUpState> {
  const name = String(formData.get('name') ?? '').trim()
  const shortName = String(formData.get('shortName') ?? '').trim() || name.split(' ')[0]
  const type = String(formData.get('type') ?? '').trim().slice(0, 60) || null
  const code = String(formData.get('code') ?? '').trim().toUpperCase().replace(/[^A-Z0-9-]/g, '')
  const phone = String(formData.get('phone') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const address = String(formData.get('address') ?? '').trim().slice(0, 200) || null
  const description = String(formData.get('description') ?? '').trim().slice(0, 600) || null
  const adminName = String(formData.get('adminName') ?? '').trim()
  const adminEmail = String(formData.get('adminEmail') ?? '').trim().toLowerCase()
  const adminPhoneInput = String(formData.get('adminPhone') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const confirm = String(formData.get('confirm') ?? '')

  if (name.length < 2) return { error: 'Enter the agency name.', field: 'name' }
  if (code.length < 3 || code.length > 12) return { error: 'Choose a join code of 3 to 12 letters or digits, for example ACME.', field: 'code' }
  if (!EMAIL.test(email)) return { error: 'Enter the agency contact email.', field: 'email' }
  if (adminName.length < 2) return { error: 'Enter your full name.', field: 'adminName' }
  if (!EMAIL.test(adminEmail)) return { error: 'Enter a valid email for your login.', field: 'adminEmail' }
  const adminPhone = adminPhoneInput ? normalizePhone(adminPhoneInput) : null
  if (adminPhoneInput && !adminPhone) return { error: 'Enter a valid mobile number.', field: 'phone' }
  if (password.length < 10) return { error: 'Use at least 10 characters for your password.', field: 'password' }
  if (password !== confirm) return { error: 'The two passwords do not match.', field: 'confirm' }

  let token: string
  try {
    if (await codeTaken(code)) return { error: 'That join code is taken. Try another.', field: 'code' }
    const taken = await emailOrPhoneTaken(adminEmail, adminPhone)
    if (taken === 'email') return { error: 'An account with that email already exists. Sign in instead.', field: 'adminEmail' }
    if (taken === 'phone') return { error: 'That phone number is already on another account.', field: 'phone' }
    const org = await createOrganization({ name, shortName, code, phone, email, status: 'pending', type, address, description, contactName: adminName })
    const admin = await createStaffUser({ role: 'agency_admin', organizationId: org.id, name: adminName, email: adminEmail, phone: adminPhone, title: 'Agency admin', passwordHash: await hashPassword(password), createdBy: null })
    await audit({ organizationId: org.id, actorUserId: admin.id, action: 'organization.self-registered', target: org.id, detail: { name, code } })
    await notifyPlatformAdmins(`New agency awaiting approval: ${name}`, `${adminName} (${adminEmail}) registered ${name} with join code ${code}. Approve it under Platform → Agencies.`)
    void sendTemplateEmail({ key: 'agency-registered', to: adminEmail, organizationId: org.id, userId: admin.id, vars: { first_name: adminName.split(' ')[0], agency_name: name, join_code: code, login_url: `${SITE}/signin?as=agency` }, category: 'account' }).catch(() => null)
    token = await signSession({ uid: admin.id, role: 'agency_admin', oid: org.id, name: admin.name })
    await recordLogin(admin.id)
  } catch (error) {
    return friendly(error) as AgencySignUpState
  }
  setSessionCookie(token)
  redirect('/verify-email?next=/agency/today?welcome=agency')
}

async function notifyPlatformAdmins(title: string, body: string): Promise<void> {
  try {
    const { getSql } = await import('@/lib/db/client')
    const admins = await getSql()`SELECT id, email, name FROM users WHERE role = 'admin' AND active`
    for (const a of admins) {
      await notify({ organizationId: DEFAULT_ORGANIZATION_ID, userId: String(a.id), kind: 'task', title, body, inAppOnly: true })
      await sendTemplateEmail({ key: 'admin-alert', to: String(a.email), organizationId: null, userId: String(a.id), vars: { first_name: String(a.name).split(' ')[0], title, body, action_url: `${SITE}/admin` }, category: 'system' })
    }
  } catch (error) {
    console.error('notify admins failed', error instanceof Error ? error.message : error)
  }
}

/* ---------- Forgot / reset password ---------- */

export interface ResetState {
  error?: string
  success?: string
}

export async function requestPasswordResetAction(formData: FormData): Promise<ResetState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  if (!EMAIL.test(email)) return { error: 'Enter the email on your account.' }
  const generic = { success: 'If that email has an account, a reset link is on its way. It is valid for one hour.' }
  try {
    const user = await findUserByEmail(email)
    if (!user || !user.active) return generic
    const { randomBytes, createHash } = await import('node:crypto')
    const raw = randomBytes(32).toString('base64url')
    const hash = createHash('sha256').update(raw).digest('hex')
    const { getSql } = await import('@/lib/db/client')
    await getSql()`INSERT INTO password_resets (token_hash, user_id, expires_at) VALUES (${hash}, ${user.id}, now() + interval '1 hour')`
    const link = `${SITE}/reset-password?token=${raw}`
    const result = await sendTemplateEmail({ key: 'password-reset', to: user.email, organizationId: user.organizationId, userId: user.id, vars: { first_name: user.name.split(' ')[0], reset_url: link, expires_in: '1 hour' }, category: 'security', immediate: true })
    if (result === 'unconfigured') return { error: 'Password reset by email is not switched on yet. Message us on WhatsApp and an adviser will reset it.' }
    await audit({ organizationId: user.organizationId, actorUserId: user.id, action: 'user.password-reset-requested', target: user.id, detail: requestMeta() })
    return generic
  } catch (error) {
    console.error('requestPasswordReset failed', error instanceof Error ? error.message : error)
    return generic
  }
}

export async function resetPasswordAction(formData: FormData): Promise<ResetState> {
  const token = String(formData.get('token') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const confirm = String(formData.get('confirm') ?? '')
  if (!token) return { error: 'This reset link is missing its token. Request a new one.' }
  if (password.length < 10) return { error: 'Use at least 10 characters.' }
  if (password !== confirm) return { error: 'The two passwords do not match.' }
  try {
    const { createHash } = await import('node:crypto')
    const hash = createHash('sha256').update(token).digest('hex')
    const { getSql } = await import('@/lib/db/client')
    const sql = getSql()
    const rows = await sql`SELECT user_id FROM password_resets WHERE token_hash = ${hash} AND used_at IS NULL AND expires_at > now() LIMIT 1`
    if (!rows[0]) return { error: 'This reset link is invalid or has expired. Request a new one.' }
    const userId = String(rows[0].user_id)
    await markPasswordChanged(userId, await hashPassword(password))
    await sql`UPDATE password_resets SET used_at = now() WHERE token_hash = ${hash}`
    await audit({ organizationId: null, actorUserId: userId, action: 'user.password-reset', target: userId, detail: requestMeta() })
    const user = await findUserByEmail((await sql`SELECT email FROM users WHERE id = ${userId}`)[0]?.email as string)
    if (user) void sendTemplateEmail({ key: 'security-password-changed', to: user.email, organizationId: user.organizationId, userId: user.id, vars: { first_name: user.name.split(' ')[0] }, category: 'security' }).catch(() => null)
    return { success: 'Password updated. You can sign in now.' }
  } catch (error) {
    console.error('resetPassword failed', error instanceof Error ? error.message : error)
    return { error: 'Could not reset the password. Please try again.' }
  }
}

export { setUserPassword }

/**
 * Sign-in for the platform operator only.
 *
 * Separate from the tenant sign-in so the two consoles share no entry
 * point. An agency or client password typed here fails with the same
 * message as a wrong one — the form never reveals that the account exists
 * elsewhere — and the attempt is written to the audit log either way.
 */
export async function superAdminSignInAction(formData: FormData): Promise<AuthState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')
  if (!EMAIL.test(email)) return { error: 'Enter the email address on your account.', field: 'email' }
  if (!password) return { error: 'Enter your password.', field: 'password' }

  let token: string
  let mustChange = false
  try {
    const user = await findUserWithSecret(email)
    const meta = requestMeta()
    if (user && (await isLocked(user.id))) {
      await audit({ organizationId: null, actorUserId: user.id, action: 'auth.locked-attempt', target: user.id, detail: { ...meta, console: 'super-admin' } })
      return { error: 'Too many failed attempts. This account is locked for 15 minutes.', field: 'password' }
    }
    const ok = user ? await verifyPassword(password, user.passwordHash) : false
    // A non-admin who guesses correctly is refused here and told nothing.
    if (!user || !ok || user.role !== 'admin' || !user.active) {
      if (user) await recordFailedLogin(user.id)
      await audit({ organizationId: null, actorUserId: user?.id ?? null, action: 'auth.failed', target: email, detail: { ...meta, console: 'super-admin' } })
      return { error: 'That email and password do not match a platform administrator.', field: 'password' }
    }
    mustChange = user.mustChangePassword
    token = await signSession({ uid: user.id, role: 'admin', oid: user.organizationId ?? DEFAULT_ORGANIZATION_ID, name: user.name, mcp: mustChange || undefined })
    await recordLogin(user.id)
    await audit({ organizationId: null, actorUserId: user.id, action: 'auth.signed-in', target: user.id, detail: { ...meta, console: 'super-admin' } })
    void sendTemplateEmail({ key: 'security-login', to: user.email, organizationId: null, userId: user.id, vars: { first_name: user.name.split(' ')[0], login_time: new Date().toUTCString(), ip: meta.ip, device: meta.agent }, category: 'security' }).catch(() => null)
  } catch (error) {
    return friendly(error)
  }

  setSessionCookie(token)
  if (mustChange) redirect('/account/password?first=1')
  const next = String(formData.get('next') ?? '')
  redirect(next.startsWith('/super-admin') || next.startsWith('/superagent') ? next : '/super-admin')
}

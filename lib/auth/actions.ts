'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { hashPassword, verifyPassword } from '@/lib/auth/password'
import { SESSION_COOKIE, SESSION_DAYS, homeFor, signSession, type Role } from '@/lib/auth/session'
import { DatabaseNotConfiguredError } from '@/lib/db/client'
import { normalizePhone } from '@/lib/format'
import { onClientSignedUp } from '@/services/automation'
import { audit } from '@/services/audit'
import { notify } from '@/services/notifications'
import { codeTaken, createClientUser, createOrganization, createStaffUser, emailOrPhoneTaken, findUserByEmail, findUserForSignIn, getOrganizationByCode, setUserPassword, touchLastSeen, DEFAULT_ORGANIZATION_ID } from '@/services/users'

export interface AuthState {
  error?: string
  field?: 'email' | 'password' | 'name' | 'phone' | 'confirm'
}

function setSessionCookie(token: string) {
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_DAYS * 86400,
  })
}

function safeNext(value: FormDataEntryValue | null, role: Role): string {
  const next = typeof value === 'string' ? value : ''
  const prefixes = role === 'admin' ? ['/admin', '/agency'] : role === 'agency' || role === 'agency_admin' ? ['/agency'] : ['/portal']
  return prefixes.some((p) => next.startsWith(p)) ? next : homeFor(role)
}

function friendly(error: unknown): AuthState {
  if (error instanceof DatabaseNotConfiguredError) return { error: 'Accounts are not available yet: the database has not been connected. Please try again shortly.' }
  const detail = error instanceof Error ? error.message : String(error)
  console.error('auth action failed', detail)
  if (process.env.DEBUG_AUTH_ERRORS === '1') return { error: `Something went wrong on our side: ${detail.slice(0, 300)}` }
  return { error: 'Something went wrong on our side. Please try again.' }
}

/** Sign in. The "agency" tab accepts agency and admin accounts; the "client" tab accepts clients. */
export async function signInAction(formData: FormData): Promise<AuthState> {
  const tab: 'agency' | 'client' = formData.get('role') === 'agency' ? 'agency' : 'client'
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Enter the email address on your account.', field: 'email' }
  if (!password) return { error: 'Enter your password.', field: 'password' }

  let token: string
  let role: Role
  try {
    const user = await findUserForSignIn(email, tab)
    const ok = user ? await verifyPassword(password, user.passwordHash) : false
    if (!user || !ok) {
      return {
        error: tab === 'agency' ? 'No agency account matches that email and password.' : 'No client account matches that email and password. New here? Create an account.',
        field: 'password',
      }
    }
    if (!user.active) return { error: 'This account has been deactivated. Contact GoldOak.', field: 'email' }
    role = user.role
    token = await signSession({ uid: user.id, role, oid: user.organizationId ?? DEFAULT_ORGANIZATION_ID, name: user.name })
    await touchLastSeen(user.id)
  } catch (error) {
    return friendly(error)
  }

  setSessionCookie(token)
  redirect(safeNext(formData.get('next'), role))
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
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Enter a valid email address.', field: 'email' }
  const phone = phoneInput ? normalizePhone(phoneInput) : null
  if (!phoneInput) return { error: 'Enter your WhatsApp number so we can reach you.', field: 'phone' }
  if (!phone) return { error: 'Enter a valid mobile number, e.g. 0712 345 678 or +255 7xx xxx xxx.', field: 'phone' }
  if (password.length < 8) return { error: 'Use at least 8 characters for your password.', field: 'password' }
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
  } catch (error) {
    return friendly(error)
  }

  setSessionCookie(token)
  redirect('/portal?welcome=1')
}

export async function signOutAction(): Promise<void> {
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
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Enter the agency contact email.', field: 'email' }
  if (adminName.length < 2) return { error: 'Enter your full name.', field: 'adminName' }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail)) return { error: 'Enter a valid email for your login.', field: 'adminEmail' }
  const adminPhone = adminPhoneInput ? normalizePhone(adminPhoneInput) : null
  if (adminPhoneInput && !adminPhone) return { error: 'Enter a valid mobile number.', field: 'phone' }
  if (password.length < 8) return { error: 'Use at least 8 characters for your password.', field: 'password' }
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
    token = await signSession({ uid: admin.id, role: 'agency_admin', oid: org.id, name: admin.name })
    await touchLastSeen(admin.id)
  } catch (error) {
    return friendly(error) as AgencySignUpState
  }
  setSessionCookie(token)
  redirect('/agency/today?welcome=agency')
}

async function notifyPlatformAdmins(title: string, body: string): Promise<void> {
  try {
    const { getSql } = await import('@/lib/db/client')
    const admins = await getSql()`SELECT id, email FROM users WHERE role = 'admin' AND active`
    for (const a of admins) {
      await notify({ organizationId: DEFAULT_ORGANIZATION_ID, userId: String(a.id), kind: 'task', title, body, inAppOnly: true })
      const { sendEmail } = await import('@/lib/email')
      await sendEmail({ to: String(a.email), subject: title, text: `${body}\n\n${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://goldoak.vercel.app'}/admin` })
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
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Enter the email on your account.' }
  const generic = { success: 'If that email has an account, a reset link is on its way. It is valid for one hour.' }
  try {
    const user = await findUserByEmail(email)
    if (!user || !user.active) return generic
    const { randomBytes, createHash } = await import('node:crypto')
    const raw = randomBytes(32).toString('base64url')
    const hash = createHash('sha256').update(raw).digest('hex')
    const { getSql } = await import('@/lib/db/client')
    await getSql()`INSERT INTO password_resets (token_hash, user_id, expires_at) VALUES (${hash}, ${user.id}, now() + interval '1 hour')`
    const link = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://goldoak.vercel.app'}/reset-password?token=${raw}`
    const { sendEmail, emailConfigured } = await import('@/lib/email')
    if (!emailConfigured()) return { error: 'Password reset by email is not switched on yet. Message us on WhatsApp and an adviser will reset it.' }
    const sent = await sendEmail({ to: user.email, subject: 'Reset your Super Agent password', text: `Hello ${user.name.split(' ')[0]},\n\nSomeone asked to reset the password for this account. If it was you, open the link below within one hour:\n\n${link}\n\nIf it was not you, ignore this email; nothing changes.` })
    if (!sent) return { error: 'We could not send the email right now. Please try again shortly.' }
    await audit({ organizationId: user.organizationId, actorUserId: user.id, action: 'user.password-reset-requested', target: user.id })
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
  if (password.length < 8) return { error: 'Use at least 8 characters.' }
  if (password !== confirm) return { error: 'The two passwords do not match.' }
  try {
    const { createHash } = await import('node:crypto')
    const hash = createHash('sha256').update(token).digest('hex')
    const { getSql } = await import('@/lib/db/client')
    const sql = getSql()
    const rows = await sql`SELECT user_id FROM password_resets WHERE token_hash = ${hash} AND used_at IS NULL AND expires_at > now() LIMIT 1`
    if (!rows[0]) return { error: 'This reset link is invalid or has expired. Request a new one.' }
    const userId = String(rows[0].user_id)
    await setUserPassword(userId, await hashPassword(password))
    await sql`UPDATE password_resets SET used_at = now() WHERE token_hash = ${hash}`
    await audit({ organizationId: null, actorUserId: userId, action: 'user.password-reset', target: userId })
    return { success: 'Password updated. You can sign in now.' }
  } catch (error) {
    console.error('resetPassword failed', error instanceof Error ? error.message : error)
    return { error: 'Could not reset the password. Please try again.' }
  }
}

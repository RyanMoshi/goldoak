'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { hashPassword, verifyPassword } from '@/lib/auth/password'
import { SESSION_COOKIE, SESSION_DAYS, homeFor, signSession, type Role } from '@/lib/auth/session'
import { DatabaseNotConfiguredError } from '@/lib/db/client'
import { normalizePhone } from '@/lib/format'
import { onClientSignedUp } from '@/services/automation'
import { createClientUser, emailOrPhoneTaken, findUserForSignIn, touchLastSeen, DEFAULT_ORGANIZATION_ID } from '@/services/users'

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
  const prefixes = role === 'admin' ? ['/admin', '/agency'] : role === 'agency' ? ['/agency'] : ['/portal']
  return prefixes.some((p) => next.startsWith(p)) ? next : homeFor(role)
}

function friendly(error: unknown): AuthState {
  if (error instanceof DatabaseNotConfiguredError) return { error: 'Accounts are not available yet: the database has not been connected. Please try again shortly.' }
  console.error('auth action failed', error instanceof Error ? error.message : error)
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

  if (name.length < 2) return { error: 'Enter your full name.', field: 'name' }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Enter a valid email address.', field: 'email' }
  const phone = phoneInput ? normalizePhone(phoneInput) : null
  if (!phoneInput) return { error: 'Enter your WhatsApp number so we can reach you.', field: 'phone' }
  if (!phone) return { error: 'Enter a valid mobile number, e.g. 0712 345 678 or +255 742 473 493.', field: 'phone' }
  if (password.length < 8) return { error: 'Use at least 8 characters for your password.', field: 'password' }
  if (password !== confirm) return { error: 'The two passwords do not match.', field: 'confirm' }

  let token: string
  try {
    const taken = await emailOrPhoneTaken(email, phone)
    if (taken === 'email') return { error: 'An account with that email already exists. Sign in instead.', field: 'email' }
    if (taken === 'phone') return { error: 'That phone number is already registered. Sign in instead.', field: 'phone' }

    const passwordHash = await hashPassword(password)
    const { user, clientId } = await createClientUser({ name, email, phone, passwordHash, businessName, clientType, notes: protect })
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

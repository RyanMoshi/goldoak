'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { hashPassword, verifyPassword } from '@/lib/auth/password'
import { SESSION_COOKIE, SESSION_DAYS, homeFor, signSession, type Role } from '@/lib/auth/session'
import { DatabaseNotConfiguredError } from '@/lib/db/client'
import { normalizePhone } from '@/lib/format'
import { createClientUser, emailOrPhoneTaken, findUserForSignIn, touchLastSeen, DEFAULT_ORGANIZATION_ID } from '@/services/users'

export interface AuthState {
  error?: string
  /** Field the error belongs to, for inline display. */
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
  const allowedPrefix = role === 'agency' ? '/agency' : '/portal'
  return next.startsWith(allowedPrefix) ? next : homeFor(role)
}

function friendly(error: unknown): AuthState {
  if (error instanceof DatabaseNotConfiguredError) {
    return { error: 'Accounts are not available yet: the database has not been connected. Please try again shortly.' }
  }
  console.error('auth action failed', error instanceof Error ? error.message : error)
  return { error: 'Something went wrong on our side. Please try again.' }
}

export async function signInAction(formData: FormData): Promise<AuthState> {
  const role: Role = formData.get('role') === 'agency' ? 'agency' : 'client'
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Enter the email address on your account.', field: 'email' }
  if (!password) return { error: 'Enter your password.', field: 'password' }

  let token: string
  try {
    const user = await findUserForSignIn(email, role)
    const ok = user ? await verifyPassword(password, user.passwordHash) : false
    if (!user || !ok) {
      return {
        error:
          role === 'agency'
            ? 'No agency account matches that email and password.'
            : 'No client account matches that email and password. New here? Create an account.',
        field: 'password',
      }
    }
    token = await signSession({
      uid: user.id,
      role: user.role,
      oid: user.organizationId ?? DEFAULT_ORGANIZATION_ID,
      name: user.name,
    })
    await touchLastSeen(user.id)
  } catch (error) {
    return friendly(error)
  }

  setSessionCookie(token)
  redirect(safeNext(formData.get('next'), role))
}

export async function signUpAction(formData: FormData): Promise<AuthState> {
  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const phoneInput = String(formData.get('phone') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const confirm = String(formData.get('confirm') ?? '')
  const businessName = String(formData.get('businessName') ?? '').trim() || null
  const clientTypeRaw = String(formData.get('clientType') ?? 'individual')
  const clientType = clientTypeRaw === 'sme' || clientTypeRaw === 'corporate' ? clientTypeRaw : 'individual'

  if (name.length < 2) return { error: 'Enter your full name.', field: 'name' }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Enter a valid email address.', field: 'email' }
  const phone = phoneInput ? normalizePhone(phoneInput) : null
  if (phoneInput && !phone) return { error: 'Enter a valid Kenyan mobile number, e.g. 0712 345 678.', field: 'phone' }
  if (password.length < 8) return { error: 'Use at least 8 characters for your password.', field: 'password' }
  if (password !== confirm) return { error: 'The two passwords do not match.', field: 'confirm' }

  let token: string
  try {
    const taken = await emailOrPhoneTaken(email, phone)
    if (taken === 'email') return { error: 'An account with that email already exists. Sign in instead.', field: 'email' }
    if (taken === 'phone') return { error: 'That phone number is already registered. Sign in instead.', field: 'phone' }

    const passwordHash = await hashPassword(password)
    const user = await createClientUser({ name, email, phone, passwordHash, businessName, clientType })
    token = await signSession({
      uid: user.id,
      role: 'client',
      oid: user.organizationId ?? DEFAULT_ORGANIZATION_ID,
      name: user.name,
    })
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


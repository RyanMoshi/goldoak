'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { completeLogin, destinationFor } from '@/lib/auth/login-finish'
import { clearPendingCookie, readPending } from '@/lib/auth/pending'
import { SESSION_COOKIE, SESSION_DAYS } from '@/lib/auth/session'
import { audit } from '@/services/audit'
import { issueOtp, verifyOtp } from '@/services/otp'
import { findUserByEmail } from '@/services/users'

/**
 * The second half of signing in: the emailed code.
 *
 * The password step leaves a short signed note in a separate cookie; these two
 * actions are the only way to turn it into a session. A wrong code never
 * reveals whether the account exists, and the note is thrown away as soon as it
 * is used or found to be stale.
 */

export interface LoginOtpState {
  error?: string
  success?: string
  expiresAt?: string
}

export async function resendLoginOtpAction(): Promise<LoginOtpState> {
  const pending = readPending()
  if (!pending) return { error: 'That sign-in has expired. Please enter your password again.' }
  const user = await findUserByEmail(pending.email)
  if (!user) return { error: 'That sign-in has expired. Please enter your password again.' }

  const result = await issueOtp({
    email: pending.email,
    purpose: 'login',
    userId: pending.uid,
    organizationId: user.organizationId,
    firstName: user.name.split(' ')[0],
  })
  if (result.ok) return { success: 'Code sent. Check your inbox, and your spam folder.', expiresAt: result.expiresAt }
  if (result.reason === 'rate-limited') return { error: 'Too many codes requested. Wait ten minutes, or use the last code we sent.' }
  if (result.reason === 'email-unconfigured') return { error: 'Email is not set up on the server, so a code cannot be sent.' }
  return { error: 'We could not send the code. Please try again.' }
}

export async function verifyLoginAction(code: string): Promise<LoginOtpState> {
  const pending = readPending()
  if (!pending) return { error: 'That sign-in has expired. Please enter your password again.' }

  const result = await verifyOtp(pending.email, 'login', code)
  if (result === 'expired') return { error: 'That code has expired. Send a new one.' }
  if (result === 'too-many') return { error: 'Too many wrong attempts. Send a new code.' }
  if (result !== 'ok') {
    await audit({ organizationId: null, actorUserId: pending.uid, action: 'auth.otp-failed', target: pending.uid })
    return { error: 'That code is not right. Check it and try again.' }
  }

  const completed = await completeLogin(pending)
  if (!completed.ok) {
    clearPendingCookie()
    return { error: completed.error }
  }

  clearPendingCookie()
  cookies().set(SESSION_COOKIE, completed.login.token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_DAYS * 86400,
  })
  await audit({ organizationId: null, actorUserId: pending.uid, action: 'auth.otp-verified', target: pending.uid, detail: { door: pending.door } })
  redirect(destinationFor(completed.login, pending.next))
}

/** Abandon the half-finished sign-in and start over. */
export async function cancelLoginAction(): Promise<void> {
  clearPendingCookie()
  redirect('/signin')
}

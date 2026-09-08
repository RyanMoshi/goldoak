'use server'

import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/server'
import { getSql } from '@/lib/db/client'
import { audit } from '@/services/audit'
import { issueOtp, verifyOtp } from '@/services/otp'
import { getUser } from '@/services/users'

export interface OtpState {
  error?: string
  success?: string
  expiresAt?: string
}

export async function resendOtpAction(): Promise<OtpState> {
  const session = await getSession()
  if (!session) redirect('/signin')
  const user = await getUser(session.uid)
  if (!user) return { error: 'Account not found.' }
  if (user.emailVerifiedAt) return { success: 'Your email is already verified.' }
  const result = await issueOtp({ email: user.email, purpose: 'verify-email', userId: user.id, organizationId: session.oid, firstName: user.name.split(' ')[0] })
  if (result.ok) return { success: 'Code sent. Check your inbox (and spam folder).', expiresAt: result.expiresAt }
  if (result.reason === 'rate-limited') return { error: 'Too many codes requested. Wait ten minutes and try again.' }
  if (result.reason === 'email-unconfigured') return { error: 'Email is not set up on the server yet. Ask your agency to verify you.' }
  return { error: 'We could not send the code. Please try again.' }
}

export async function verifyEmailAction(code: string, next: string): Promise<OtpState> {
  const session = await getSession()
  if (!session) redirect('/signin')
  const user = await getUser(session.uid)
  if (!user) return { error: 'Account not found.' }
  const result = await verifyOtp(user.email, 'verify-email', code)
  if (result === 'ok') {
    await getSql()`UPDATE users SET email_verified_at = now() WHERE id = ${user.id}`
    await audit({ organizationId: session.oid, actorUserId: user.id, action: 'user.email-verified', target: user.id })
    redirect(next.startsWith('/') ? next : '/')
  }
  if (result === 'expired') return { error: 'That code has expired. Send a new one.' }
  if (result === 'too-many') return { error: 'Too many wrong attempts. Send a new code.' }
  return { error: 'That code is not right. Check it and try again.' }
}

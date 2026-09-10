import { createHmac, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'
import type { Role } from '@/lib/auth/session'

/**
 * The half-finished sign-in.
 *
 * A password alone no longer produces a session. It produces this: a short,
 * signed note saying "this person proved the password, and is now owed a code".
 * It is deliberately a different cookie from the real session, so nothing that
 * reads a session can be fooled by one of these.
 *
 * It carries no privileges. Everything in it is re-checked when the code is
 * accepted and the real session is minted.
 */

export const PENDING_COOKIE = 'goldoak_login'
const TTL_SECONDS = 15 * 60

export interface PendingLogin {
  uid: string
  email: string
  /** Which door was used, so the right one is finished. */
  door: 'signin' | 'super-admin'
  /** Sign-in tab, which decides which memberships count. */
  tab: 'agency' | 'client'
  next: string
  exp: number
}

function secret(): string {
  const value = process.env.AUTH_SECRET
  if (!value || value.length < 16) throw new Error('AUTH_SECRET is not configured.')
  return value
}

function sign(body: string): string {
  return createHmac('sha256', secret()).update(body).digest('base64url')
}

export function signPending(payload: Omit<PendingLogin, 'exp'>): string {
  const full: PendingLogin = { ...payload, exp: Math.floor(Date.now() / 1000) + TTL_SECONDS }
  const body = Buffer.from(JSON.stringify(full)).toString('base64url')
  return `${body}.${sign(body)}`
}

export function verifyPending(token: string | undefined | null): PendingLogin | null {
  if (!token) return null
  const [body, signature] = token.split('.')
  if (!body || !signature) return null
  try {
    const expected = Buffer.from(sign(body))
    const given = Buffer.from(signature)
    if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString()) as PendingLogin
    if (typeof payload.exp !== 'number' || payload.exp < Math.floor(Date.now() / 1000)) return null
    if (!payload.uid || !payload.email) return null
    return payload
  } catch {
    return null
  }
}

export function setPendingCookie(token: string): void {
  cookies().set(PENDING_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: TTL_SECONDS,
  })
}

export function clearPendingCookie(): void {
  cookies().delete(PENDING_COOKIE)
}

export function readPending(): PendingLogin | null {
  return verifyPending(cookies().get(PENDING_COOKIE)?.value)
}

/** Where to send someone once the code is accepted. */
export function homeAfter(role: Role, next: string): string {
  if (next.startsWith('/')) return next
  if (role === 'admin') return '/super-admin'
  if (role === 'agency_admin' || role === 'agency') return '/agency/today'
  return '/portal'
}

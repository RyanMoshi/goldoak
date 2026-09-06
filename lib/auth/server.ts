import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { SESSION_COOKIE, homeFor, verifySession, type Role, type SessionPayload } from '@/lib/auth/session'

/** Current session from the request cookie, or null. Server components and actions only. */
export async function getSession(): Promise<SessionPayload | null> {
  return verifySession(cookies().get(SESSION_COOKIE)?.value)
}

/** Redirects to sign-in when absent, or to the right home when the role does not match. */
export async function requireSession(role: Role): Promise<SessionPayload> {
  const session = await getSession()
  if (!session) redirect(`/signin?as=${role}`)
  if (session.role !== role) redirect(homeFor(session.role))
  return session
}

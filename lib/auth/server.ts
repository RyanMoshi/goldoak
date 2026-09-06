import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { SESSION_COOKIE, canAccess, homeFor, verifySession, type Role, type SessionPayload } from '@/lib/auth/session'

/** Current session from the request cookie, or null. Server components and actions only. */
export async function getSession(): Promise<SessionPayload | null> {
  return verifySession(cookies().get(SESSION_COOKIE)?.value)
}

/** Redirects to sign-in when absent, or to the right home when the role may not enter this area. */
export async function requireSession(area: Role): Promise<SessionPayload> {
  const session = await getSession()
  if (!session) redirect(`/signin?as=${area === 'client' ? 'client' : 'agency'}`)
  if (!canAccess(session.role, area)) redirect(homeFor(session.role))
  return session
}

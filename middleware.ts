import { NextResponse, type NextRequest } from 'next/server'
import { SESSION_COOKIE, canAccess, homeFor, verifySession, type Role } from '@/lib/auth/session'

/** Gate the platform routes by role. Signed cookie, verified with Web Crypto; no database call on the edge. */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value)

  const area: Role | null = pathname.startsWith('/admin') ? 'admin' : pathname.startsWith('/agency') ? 'agency' : pathname.startsWith('/portal') ? 'client' : null

  if (area) {
    if (!session) return redirectToSignIn(request, area === 'client' ? 'client' : 'agency')
    if (!canAccess(session.role, area)) return NextResponse.redirect(new URL(homeFor(session.role), request.url))
  }

  if ((pathname === '/signin' || pathname === '/signup') && session) {
    return NextResponse.redirect(new URL(homeFor(session.role), request.url))
  }

  return NextResponse.next()
}

function redirectToSignIn(request: NextRequest, as: 'agency' | 'client') {
  const url = new URL('/signin', request.url)
  url.searchParams.set('as', as)
  url.searchParams.set('next', request.nextUrl.pathname)
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/admin/:path*', '/agency/:path*', '/portal/:path*', '/signin', '/signup'],
}

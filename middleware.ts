import { NextResponse, type NextRequest } from 'next/server'
import { SESSION_COOKIE, canAccess, homeFor, verifySession, type Area } from '@/lib/auth/session'

/** Gate the platform routes by role. Signed cookie, verified with Web Crypto; no database call on the edge. */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value)

  // /superagent is the AI product console: platform-level, so it sits in the admin area.
  const area: Area | null = pathname.startsWith('/admin') || pathname.startsWith('/superagent') ? 'admin' : pathname.startsWith('/agency') ? 'agency' : pathname.startsWith('/portal') ? 'client' : null

  if (pathname.startsWith('/account') || pathname === '/choose-agency') {
    if (!session) return redirectToSignIn(request, 'client')
    return NextResponse.next()
  }

  if (area) {
    if (!session) return redirectToSignIn(request, area === 'client' ? 'client' : 'agency')
    if (session.mcp) return NextResponse.redirect(new URL('/account/password', request.url))
    if (!canAccess(session.role, area)) return NextResponse.redirect(new URL(homeFor(session.role), request.url))
  }

  if ((pathname === '/signin' || pathname === '/signup' || pathname === '/agencies/signup') && session) {
    return NextResponse.redirect(new URL(session.mcp ? '/account/password' : homeFor(session.role), request.url))
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
  matcher: ['/admin/:path*', '/superagent/:path*', '/agency/:path*', '/portal/:path*', '/account/:path*', '/choose-agency', '/signin', '/signup', '/agencies/signup'],
}

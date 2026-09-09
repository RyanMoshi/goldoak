import { NextResponse, type NextRequest } from 'next/server'
import { SESSION_COOKIE, canAccess, homeFor, verifySession, type Area } from '@/lib/auth/session'

/** Gate the platform routes by role. Signed cookie, verified with Web Crypto; no database call on the edge. */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value)

  // /superagent is the AI product console: platform-level, so it sits in the admin area.
  // The platform console has its own door; it must stay reachable signed out.
  if (pathname === '/super-admin/login') {
    if (session?.role === 'admin' && !session.mcp) return NextResponse.redirect(new URL('/super-admin', request.url))
    return NextResponse.next()
  }

  const area: Area | null = pathname.startsWith('/super-admin') || pathname.startsWith('/superagent') ? 'admin' : pathname.startsWith('/agency') ? 'agency' : pathname.startsWith('/portal') ? 'client' : null

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
  // A signed-out visit to the platform console goes to the console's own login.
  if (request.nextUrl.pathname.startsWith('/super-admin') || request.nextUrl.pathname.startsWith('/superagent')) {
    const admin = new URL('/super-admin/login', request.url)
    admin.searchParams.set('next', request.nextUrl.pathname)
    return NextResponse.redirect(admin)
  }
  const url = new URL('/signin', request.url)
  url.searchParams.set('as', as)
  url.searchParams.set('next', request.nextUrl.pathname)
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/super-admin/:path*', '/superagent/:path*', '/agency/:path*', '/portal/:path*', '/account/:path*', '/choose-agency', '/signin', '/signup', '/agencies/signup', '/agent/:path*'],
}

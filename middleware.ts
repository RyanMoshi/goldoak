import { NextResponse, type NextRequest } from 'next/server'
import { SESSION_COOKIE, homeFor, verifySession } from '@/lib/auth/session'

/**
 * Gate the platform routes by role. The session is a signed cookie, verified
 * here with Web Crypto; no database call on the edge.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value)

  if (pathname.startsWith('/agency')) {
    if (!session) return redirectToSignIn(request, 'agency')
    if (session.role !== 'agency') return NextResponse.redirect(new URL(homeFor(session.role), request.url))
  }

  if (pathname.startsWith('/portal')) {
    if (!session) return redirectToSignIn(request, 'client')
    if (session.role !== 'client') return NextResponse.redirect(new URL(homeFor(session.role), request.url))
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
  matcher: ['/agency/:path*', '/portal/:path*', '/signin', '/signup'],
}

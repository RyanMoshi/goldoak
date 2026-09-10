import { NextResponse } from 'next/server'
import { GATEWAY_URL_KEY, getSetting, setSetting } from '@/lib/platform/settings'
import { resolveWahaBase, wahaBase } from '@/lib/whatsapp/providers/waha'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Where the WhatsApp gateway is answering.
 *
 * A gateway behind a tunnel gets a new address every time it restarts. Rather
 * than rebuild the deployment to follow it, the gateway announces itself here
 * on startup and the platform reads the value from the database.
 *
 * Guarded by ADMIN_TOKEN, which is server-side only. Whoever can call this can
 * redirect every outgoing WhatsApp message, so the token is as sensitive as
 * the gateway key itself.
 *
 *   POST /api/admin/gateway   x-admin-token: <ADMIN_TOKEN>
 *   { "url": "https://something.trycloudflare.com" }
 */

function authorized(request: Request): boolean {
  const token = process.env.ADMIN_TOKEN
  if (!token || token.length < 16) return false
  return request.headers.get('x-admin-token') === token
}

export async function POST(request: Request) {
  if (!authorized(request)) return new Response('Unauthorized', { status: 401 })

  let body: { url?: unknown }
  try {
    body = (await request.json()) as { url?: unknown }
  } catch {
    return NextResponse.json({ ok: false, error: 'Expected JSON' }, { status: 400 })
  }

  const raw = typeof body.url === 'string' ? body.url.trim().replace(/\/$/, '') : ''
  if (!raw) {
    await setSetting(GATEWAY_URL_KEY, null)
    return NextResponse.json({ ok: true, cleared: true })
  }

  // Only an https address, and only a hostname: no paths, no credentials, no
  // ports pointing somewhere unexpected.
  let parsed: URL
  try {
    parsed = new URL(raw)
  } catch {
    return NextResponse.json({ ok: false, error: 'Not a URL' }, { status: 400 })
  }
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password || (parsed.pathname !== '/' && parsed.pathname !== '')) {
    return NextResponse.json({ ok: false, error: 'Expected a plain https origin' }, { status: 400 })
  }

  await setSetting(GATEWAY_URL_KEY, parsed.origin)
  return NextResponse.json({ ok: true, url: parsed.origin })
}

/** What the platform currently believes, for checking after a handover. */
export async function GET(request: Request) {
  if (!authorized(request)) return new Response('Unauthorized', { status: 401 })
  return NextResponse.json({
    ok: true,
    pinned: wahaBase() || null,
    published: await getSetting(GATEWAY_URL_KEY),
    inUse: (await resolveWahaBase()) || null,
  })
}

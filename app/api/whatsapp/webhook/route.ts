import { NextResponse } from 'next/server'
import { getSql, hasDatabase } from '@/lib/db/client'
import { ensureSchema } from '@/lib/db/migrate'
import { handleInbound, logMessage } from '@/lib/whatsapp/bot'
import { sendWhatsApp } from '@/lib/whatsapp/provider'
import { parseMetaPayload, verifyMetaSignature } from '@/lib/whatsapp/providers/meta'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Meta WhatsApp Cloud API webhook (alternative to OpenWA). GET verifies, POST receives. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  if (searchParams.get('hub.mode') === 'subscribe' && searchParams.get('hub.verify_token') === process.env.WHATSAPP_VERIFY_TOKEN && searchParams.get('hub.challenge')) {
    return new Response(searchParams.get('hub.challenge') ?? '', { status: 200, headers: { 'Content-Type': 'text/plain' } })
  }
  return new Response('Forbidden', { status: 403 })
}

export async function POST(request: Request) {
  const raw = await request.text()
  if (!verifyMetaSignature(raw, request.headers.get('x-hub-signature-256'))) return new Response('Invalid signature', { status: 401 })

  let payload: unknown
  try {
    payload = JSON.parse(raw)
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const messages = parseMetaPayload(payload)
  if (!messages.length || !hasDatabase()) return NextResponse.json({ ok: true })

  await ensureSchema()
  const sql = getSql()
  for (const message of messages) {
    try {
      const inserted = await sql`INSERT INTO processed_webhooks (key) VALUES (${`meta:${message.messageId}`}) ON CONFLICT DO NOTHING RETURNING key`
      if (!inserted.length) continue
      const { reply, userId } = await handleInbound(message.phone, message.text)
      await logMessage(message.phone, userId, 'in', message.text)
      await sendWhatsApp(message.phone, reply)
      await logMessage(message.phone, userId, 'out', reply)
    } catch (error) {
      console.error('meta webhook failed', error instanceof Error ? error.message : error)
    }
  }
  return NextResponse.json({ ok: true })
}

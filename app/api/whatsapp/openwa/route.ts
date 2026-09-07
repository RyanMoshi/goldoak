import { NextResponse } from 'next/server'
import { getSql, hasDatabase } from '@/lib/db/client'
import { ensureSchema } from '@/lib/db/migrate'
import { handleInbound } from '@/lib/whatsapp/bot'
import { sendWhatsApp, whatsappConfigured } from '@/lib/whatsapp/provider'
import { parseOpenWAEvent, verifyOpenWASignature } from '@/lib/whatsapp/providers/openwa'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * OpenWA webhook. Register it on the session with events ["message.received"]
 * and the secret in OPENWA_WEBHOOK_SECRET:
 *   POST {OPENWA_BASE_URL}/api/sessions/{id}/webhooks
 *   { "url": "https://goldoak.vercel.app/api/whatsapp/openwa", "events": ["message.received"], "secret": "..." }
 */
export async function POST(request: Request) {
  const raw = await request.text()
  if (!verifyOpenWASignature(raw, request.headers.get('x-openwa-signature'))) {
    return new Response('Invalid signature', { status: 401 })
  }

  let payload: unknown
  try {
    payload = JSON.parse(raw)
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const { key, message } = parseOpenWAEvent(payload)
  if (!message) return NextResponse.json({ ok: true, ignored: true })
  if (!hasDatabase()) return NextResponse.json({ ok: true, ignored: 'no database' })

  await ensureSchema()
  const idempotencyKey = request.headers.get('x-openwa-idempotency-key') ?? key ?? message.messageId
  if (idempotencyKey) {
    const sql = getSql()
    const inserted = await sql`INSERT INTO processed_webhooks (key) VALUES (${`openwa:${idempotencyKey}`}) ON CONFLICT DO NOTHING RETURNING key`
    if (!inserted.length) return NextResponse.json({ ok: true, duplicate: true })
  }

  try {
    const result = await handleInbound(message.phone, message.text, message.name ?? null)
    let sent = true
    for (const reply of result.replies) {
      if (!(await sendWhatsApp(message.phone, reply))) sent = false
    }
    // Until a gateway is configured, echo the reply so the conversation can be tested end to end.
    return NextResponse.json(whatsappConfigured() ? { ok: true, sent, answered: result.answered } : { ok: true, sent, answered: result.answered, reply: result.replies.join('\n\n') })
  } catch (error) {
    console.error('openwa webhook failed', error instanceof Error ? error.message : error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, provider: 'openwa', expects: 'POST message.received events' })
}

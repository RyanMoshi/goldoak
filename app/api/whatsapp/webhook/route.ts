import { createHmac, timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'
import { hasDatabase, getSql } from '@/lib/db/client'
import { newId } from '@/lib/ids'
import { markRead, sendText, whatsappConfigured } from '@/lib/whatsapp/client'
import { replyFor } from '@/lib/whatsapp/replies'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Meta WhatsApp Cloud API webhook.
 * GET  — verification handshake (hub.mode / hub.verify_token / hub.challenge).
 * POST — inbound messages. Registered clients get their status; others get a sign-up link.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')
  if (mode === 'subscribe' && token && token === process.env.WHATSAPP_VERIFY_TOKEN && challenge) {
    return new Response(challenge, { status: 200, headers: { 'Content-Type': 'text/plain' } })
  }
  return new Response('Forbidden', { status: 403 })
}

interface InboundMessage {
  id: string
  from: string
  type: string
  text?: { body: string }
  button?: { text: string }
  interactive?: { button_reply?: { title: string }; list_reply?: { title: string } }
}

export async function POST(request: Request) {
  const raw = await request.text()

  if (!verifySignature(raw, request.headers.get('x-hub-signature-256'))) {
    return new Response('Invalid signature', { status: 401 })
  }

  let payload: unknown
  try {
    payload = JSON.parse(raw)
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const messages = extractMessages(payload)
  // Meta expects a fast 200. Work is small, so we do it inline and always ack.
  await Promise.all(messages.map((message) => handle(message).catch((error) => console.error('whatsapp handle failed', error))))
  return NextResponse.json({ ok: true })
}

function verifySignature(raw: string, header: string | null): boolean {
  const secret = process.env.WHATSAPP_APP_SECRET
  if (!secret) return true // Signature checking is enabled once the app secret is configured.
  if (!header?.startsWith('sha256=')) return false
  const expected = createHmac('sha256', secret).update(raw).digest('hex')
  const provided = header.slice('sha256='.length)
  if (expected.length !== provided.length) return false
  return timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(provided, 'hex'))
}

function extractMessages(payload: unknown): InboundMessage[] {
  const out: InboundMessage[] = []
  const entries = (payload as { entry?: unknown[] })?.entry ?? []
  for (const entry of entries) {
    const changes = (entry as { changes?: unknown[] })?.changes ?? []
    for (const change of changes) {
      const value = (change as { value?: { messages?: InboundMessage[] } })?.value
      for (const message of value?.messages ?? []) {
        if (message?.from && message?.id) out.push(message)
      }
    }
  }
  return out
}

function textOf(message: InboundMessage): string {
  return (
    message.text?.body ??
    message.button?.text ??
    message.interactive?.button_reply?.title ??
    message.interactive?.list_reply?.title ??
    ''
  )
}

async function handle(message: InboundMessage): Promise<void> {
  const from = message.from.replace(/\D/g, '')
  const text = textOf(message)
  if (!text) return

  await markRead(message.id)

  let reply: string
  if (!hasDatabase()) {
    reply = 'GoldOak Insurance here. Our client system is being connected; please call +254 729 911 311 for now.'
  } else {
    reply = await replyFor(from, text)
    await log(from, 'in', text)
  }

  if (whatsappConfigured()) {
    await sendText(from, reply)
    if (hasDatabase()) await log(from, 'out', reply)
  } else {
    console.warn('WhatsApp not configured; would reply:', reply.slice(0, 120))
  }
}

async function log(phone: string, direction: 'in' | 'out', body: string): Promise<void> {
  try {
    const sql = getSql()
    const users = await sql`SELECT id FROM users WHERE phone = ${phone} LIMIT 1`
    const userId = users[0] ? String(users[0].id) : null
    await sql`INSERT INTO whatsapp_messages (id, phone, user_id, direction, body) VALUES (${newId('wam')}, ${phone}, ${userId}, ${direction}, ${body.slice(0, 4000)})`
  } catch (error) {
    console.error('whatsapp log failed', error instanceof Error ? error.message : error)
  }
}

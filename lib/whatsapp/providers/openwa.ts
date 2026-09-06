import { createHmac, timingSafeEqual } from 'node:crypto'
import type { InboundMessage, WhatsAppProvider } from '@/lib/whatsapp/provider'

/**
 * OpenWA — self-hosted WhatsApp gateway (github.com/rmyndharis/OpenWA).
 *   send:    POST {OPENWA_BASE_URL}/api/sessions/{OPENWA_SESSION_ID}/messages/send-text
 *            headers X-API-Key, body { chatId: "<phone>@c.us", text }
 *   webhook: POST { event, timestamp, sessionId, idempotencyKey, deliveryId, data }
 *            signed with X-OpenWA-Signature: sha256=<hmac hex of raw body>
 */
export class OpenWAProvider implements WhatsAppProvider {
  readonly name = 'openwa' as const

  private base = (process.env.OPENWA_BASE_URL ?? '').replace(/\/$/, '')
  private apiKey = process.env.OPENWA_API_KEY ?? ''
  private session = process.env.OPENWA_SESSION_ID ?? ''

  async sendText(toPhone: string, body: string): Promise<void> {
    const response = await fetch(`${this.base}/api/sessions/${encodeURIComponent(this.session)}/messages/send-text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': this.apiKey },
      body: JSON.stringify({ chatId: `${toPhone.replace(/\D/g, '')}@c.us`, text: body }),
    })
    if (!response.ok) {
      const text = await response.text().catch(() => '')
      throw new Error(`OpenWA ${response.status}: ${text.slice(0, 300)}`)
    }
  }
}

export function verifyOpenWASignature(rawBody: string, header: string | null): boolean {
  const secret = process.env.OPENWA_WEBHOOK_SECRET
  if (!secret) return true // Signature checking starts once the secret is configured on both sides.
  if (!header) return false
  const expected = `sha256=${createHmac('sha256', secret).update(rawBody).digest('hex')}`
  const a = Buffer.from(header)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

interface OpenWAEvent {
  event?: string
  sessionId?: string
  idempotencyKey?: string
  data?: {
    id?: string
    from?: string
    to?: string
    body?: string | null
    type?: string
    fromMe?: boolean
    isGroup?: boolean
    kind?: string
    senderPhone?: string | null
  }
}

/** Turns an OpenWA `message.received` event into an inbound message, or null when it should be ignored. */
export function parseOpenWAEvent(payload: unknown): { key: string | null; message: InboundMessage | null } {
  const event = payload as OpenWAEvent
  const key = event?.idempotencyKey ?? null
  if (event?.event !== 'message.received' || !event.data) return { key, message: null }
  const d = event.data
  if (d.fromMe || d.isGroup || (d.kind && d.kind !== 'individual')) return { key, message: null }
  if (d.type && d.type !== 'text') return { key, message: null }
  const from = d.senderPhone ? String(d.senderPhone) : String(d.from ?? '')
  const phone = from.replace(/@.*$/, '').replace(/\D/g, '')
  const text = (d.body ?? '').trim()
  if (!phone || !text || from.endsWith('@lid')) return { key, message: null }
  return { key, message: { phone, text, messageId: String(d.id ?? key ?? '') } }
}

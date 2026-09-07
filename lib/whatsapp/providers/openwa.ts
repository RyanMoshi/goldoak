import { createHmac, timingSafeEqual } from 'node:crypto'
import type { InboundMedia, InboundMediaKind, InboundMessage, OutboundDocument, WhatsAppProvider } from '@/lib/whatsapp/provider'

/**
 * OpenWA — self-hosted WhatsApp gateway (github.com/rmyndharis/OpenWA).
 *   send:    POST {OPENWA_BASE_URL}/api/sessions/{OPENWA_SESSION_ID}/messages/send-text|send-document|send-image
 *            headers X-API-Key, body { chatId: "<phone>@c.us", ... }
 *   webhook: POST { event, timestamp, sessionId, idempotencyKey, deliveryId, data }
 *            signed with X-OpenWA-Signature: sha256=<hmac hex of raw body>
 *   media:   inline base64 in data.media.data up to 1 MiB, else { omitted: true } and
 *            GET .../messages/:chatId/:messageId/media
 */
export class OpenWAProvider implements WhatsAppProvider {
  readonly name = 'openwa' as const

  private base = (process.env.OPENWA_BASE_URL ?? '').replace(/\/$/, '')
  private apiKey = process.env.OPENWA_API_KEY ?? ''
  private session = process.env.OPENWA_SESSION_ID ?? ''

  private url(path: string): string {
    return `${this.base}/api/sessions/${encodeURIComponent(this.session)}${path}`
  }

  private async post(path: string, body: unknown, timeoutMs = 20_000): Promise<Response> {
    const controller = new AbortController()
    const t = setTimeout(() => controller.abort(), timeoutMs)
    try {
      const response = await fetch(this.url(path), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-Key': this.apiKey },
        body: JSON.stringify(body),
        signal: controller.signal,
      })
      if (!response.ok) {
        const text = await response.text().catch(() => '')
        throw new Error(`OpenWA ${response.status}: ${text.slice(0, 300)}`)
      }
      return response
    } finally {
      clearTimeout(t)
    }
  }

  async sendText(toPhone: string, body: string): Promise<void> {
    await this.post('/messages/send-text', { chatId: `${toPhone.replace(/\D/g, '')}@c.us`, text: body })
  }

  async sendDocument(toPhone: string, doc: OutboundDocument): Promise<void> {
    await this.post('/messages/send-document', { chatId: `${toPhone.replace(/\D/g, '')}@c.us`, ...(doc.url ? { url: doc.url } : { base64: doc.base64, mimetype: doc.mimetype }), filename: doc.filename, caption: doc.caption }, 60_000)
  }

  async sendImage(toPhone: string, doc: OutboundDocument): Promise<void> {
    await this.post('/messages/send-image', { chatId: `${toPhone.replace(/\D/g, '')}@c.us`, ...(doc.url ? { url: doc.url } : { base64: doc.base64, mimetype: doc.mimetype }), filename: doc.filename, caption: doc.caption }, 60_000)
  }

  async downloadMedia(chatId: string, messageId: string): Promise<{ bytes: Uint8Array; mimetype: string } | null> {
    const response = await fetch(this.url(`/messages/${encodeURIComponent(chatId)}/${encodeURIComponent(messageId)}/media`), { headers: { 'X-API-Key': this.apiKey } })
    if (response.status === 404) return null
    if (!response.ok) throw new Error(`OpenWA media ${response.status}`)
    return { bytes: new Uint8Array(await response.arrayBuffer()), mimetype: response.headers.get('content-type') ?? 'application/octet-stream' }
  }

  async markRead(chatId: string): Promise<void> {
    await this.post('/chats/read', { chatId }, 8_000)
  }

  async typing(chatId: string): Promise<void> {
    await this.post('/chats/typing', { chatId, state: 'typing' }, 8_000)
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
    hasMedia?: boolean
    senderPhone?: string | null
    pushName?: string | null
    notifyName?: string | null
    senderName?: string | null
    contact?: { name?: string | null; pushName?: string | null } | null
    media?: { mimetype?: string; filename?: string | null; data?: string | null; omitted?: boolean; sizeBytes?: number | null } | null
    caption?: string | null
  }
}

const MEDIA_TYPES: Record<string, InboundMediaKind> = { image: 'image', document: 'document', audio: 'audio', voice: 'audio', ptt: 'audio', video: 'video', sticker: 'sticker' }

/** Turns an OpenWA `message.received` event into an inbound message, or null when it should be ignored. */
export function parseOpenWAEvent(payload: unknown): { key: string | null; message: InboundMessage | null } {
  const event = payload as OpenWAEvent
  const key = event?.idempotencyKey ?? null
  if (event?.event !== 'message.received' || !event.data) return { key, message: null }
  const d = event.data
  if (d.fromMe || d.isGroup || (d.kind && d.kind !== 'individual')) return { key, message: null }
  const from = d.senderPhone ? String(d.senderPhone) : String(d.from ?? '')
  const phone = from.replace(/@.*$/, '').replace(/\D/g, '')
  if (!phone || from.endsWith('@lid')) return { key, message: null }
  const name = d.pushName ?? d.notifyName ?? d.senderName ?? d.contact?.pushName ?? d.contact?.name ?? null
  const type = d.type ?? 'text'
  const text = (d.body ?? d.caption ?? '').trim()

  let media: InboundMedia | null = null
  if (type !== 'text' && (d.hasMedia || d.media)) {
    const kind = MEDIA_TYPES[type] ?? 'other'
    const mimetype = d.media?.mimetype ?? (kind === 'image' ? 'image/jpeg' : 'application/octet-stream')
    media = { kind, mimetype, filename: d.media?.filename ?? null, base64: d.media?.data ?? null, omitted: Boolean(d.media?.omitted) || !d.media?.data, sizeBytes: d.media?.sizeBytes ?? null, chatId: String(d.from ?? `${phone}@c.us`) }
  } else if (type !== 'text' && !text) {
    // Location, contact, poll, call…: nothing we can act on.
    return { key, message: null }
  }
  if (!text && !media) return { key, message: null }
  return { key, message: { phone, text, messageId: String(d.id ?? key ?? ''), name: name ? String(name).slice(0, 80) : null, media } }
}

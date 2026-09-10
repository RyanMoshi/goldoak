import { createHmac, timingSafeEqual } from 'node:crypto'
import type { InboundMedia, InboundMediaKind, InboundMessage, OutboundDocument, WhatsAppProvider } from '@/lib/whatsapp/provider'

/**
 * WAHA - the self-hosted WhatsApp HTTP API (waha.devlike.pro).
 *
 * One container holds many sessions, which is what lets every agency pair its
 * own number instead of sharing GoldOak's. Every call names the session, so a
 * single set of credentials serves the whole platform.
 *
 *   send:    POST {base}/api/sendText   { session, chatId, text }
 *            POST {base}/api/sendImage  { session, chatId, file: {...}, caption }
 *            POST {base}/api/sendFile   { session, chatId, file: {...}, caption }
 *   presence POST {base}/api/sendSeen | /api/startTyping | /api/stopTyping
 *   auth:    header X-Api-Key
 *   webhook: { id, timestamp, event: 'message', session, payload: {...} }
 *            signed with X-Webhook-Hmac: hex sha512 of the raw body
 *
 * Media arrives as a URL on the gateway rather than inline bytes, so it is
 * fetched back with the same API key.
 */

export function wahaBase(): string {
  return (process.env.WAHA_BASE_URL ?? process.env.OPENWA_BASE_URL ?? '').replace(/\/$/, '')
}

export function wahaApiKey(): string {
  return process.env.WAHA_API_KEY ?? process.env.OPENWA_API_KEY ?? ''
}

/** The shared GoldOak line. An agency's own number is a different session name. */
export function wahaDefaultSession(): string {
  return process.env.WAHA_SESSION ?? process.env.OPENWA_SESSION_ID ?? 'default'
}

export function wahaConfigured(): boolean {
  return Boolean(wahaBase() && wahaApiKey())
}

function chatId(phone: string): string {
  return `${phone.replace(/\D/g, '')}@c.us`
}

/** WAHA takes a file either by URL or as base64 under `data`, both alongside the mimetype. */
function filePayload(doc: OutboundDocument): Record<string, unknown> {
  return doc.url
    ? { mimetype: doc.mimetype, url: doc.url, filename: doc.filename }
    : { mimetype: doc.mimetype, data: doc.base64, filename: doc.filename }
}

export class WahaProvider implements WhatsAppProvider {
  readonly name = 'waha' as const

  private base = wahaBase()
  private apiKey = wahaApiKey()
  private session: string

  /** Bound to one session: the shared number by default, or an agency's own. */
  constructor(sessionId?: string) {
    this.session = sessionId ?? wahaDefaultSession()
  }

  get sessionId(): string {
    return this.session
  }

  private async post(path: string, body: Record<string, unknown>, timeoutMs = 20_000): Promise<Response> {
    const controller = new AbortController()
    const t = setTimeout(() => controller.abort(), timeoutMs)
    try {
      const response = await fetch(`${this.base}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Api-Key': this.apiKey },
        body: JSON.stringify({ session: this.session, ...body }),
        signal: controller.signal,
      })
      if (!response.ok) {
        const text = await response.text().catch(() => '')
        throw new Error(`WAHA ${response.status}: ${text.slice(0, 300)}`)
      }
      return response
    } finally {
      clearTimeout(t)
    }
  }

  async sendText(toPhone: string, body: string): Promise<void> {
    await this.post('/api/sendText', { chatId: chatId(toPhone), text: body })
  }

  async sendImage(toPhone: string, doc: OutboundDocument): Promise<void> {
    await this.post('/api/sendImage', { chatId: chatId(toPhone), file: filePayload(doc), caption: doc.caption }, 60_000)
  }

  async sendDocument(toPhone: string, doc: OutboundDocument): Promise<void> {
    await this.post('/api/sendFile', { chatId: chatId(toPhone), file: filePayload(doc), caption: doc.caption }, 60_000)
  }

  async markRead(chat: string): Promise<void> {
    await this.post('/api/sendSeen', { chatId: chat }, 8_000)
  }

  async typing(chat: string): Promise<void> {
    await this.post('/api/startTyping', { chatId: chat }, 8_000)
  }

  /**
   * Fetches media the gateway is holding. The URL comes from the inbound
   * event; it is only accepted when it points at our own gateway, so a forged
   * webhook cannot make the server fetch an arbitrary address.
   */
  async downloadMediaUrl(url: string): Promise<{ bytes: Uint8Array; mimetype: string } | null> {
    if (!this.base || !url.startsWith(this.base)) return null
    const response = await fetch(url, { headers: { 'X-Api-Key': this.apiKey } })
    if (response.status === 404) return null
    if (!response.ok) throw new Error(`WAHA media ${response.status}`)
    return { bytes: new Uint8Array(await response.arrayBuffer()), mimetype: response.headers.get('content-type') ?? 'application/octet-stream' }
  }
}

/**
 * WAHA signs the raw body with HMAC SHA-512 and sends it as plain hex.
 * Checking starts once the secret is configured on both sides.
 */
export function verifyWahaSignature(rawBody: string, header: string | null): boolean {
  const secret = process.env.WAHA_HMAC_KEY ?? process.env.OPENWA_WEBHOOK_SECRET
  if (!secret) return true
  if (!header) return false
  const expected = createHmac('sha512', secret).update(rawBody).digest('hex')
  const a = Buffer.from(header.trim().toLowerCase())
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

interface WahaEvent {
  id?: string
  event?: string
  session?: string
  payload?: {
    id?: string
    from?: string
    to?: string
    body?: string | null
    caption?: string | null
    fromMe?: boolean
    hasMedia?: boolean
    notifyName?: string | null
    participant?: string | null
    media?: { url?: string | null; mimetype?: string | null; filename?: string | null } | null
    _data?: { notifyName?: string | null; pushName?: string | null } | null
  }
}

const MEDIA_TYPES: Record<string, InboundMediaKind> = {
  image: 'image',
  video: 'video',
  audio: 'audio',
  document: 'document',
  application: 'document',
  text: 'document',
}

/** Groups end in @g.us; @lid is the privacy-preserving id we cannot reply to. */
function individualPhone(from: string): string | null {
  if (!from || from.endsWith('@g.us') || from.endsWith('@lid') || from.endsWith('@broadcast')) return null
  const digits = from.replace(/@.*$/, '').replace(/\D/g, '')
  return digits || null
}

/** Turns a WAHA `message` event into an inbound message, or null when it should be ignored. */
export function parseWahaEvent(payload: unknown): { key: string | null; sessionId: string | null; message: InboundMessage | null } {
  const event = payload as WahaEvent
  const key = event?.id ?? null
  const sessionId = event?.session ? String(event.session) : null
  if (event?.event !== 'message' || !event.payload) return { key, sessionId, message: null }

  const d = event.payload
  if (d.fromMe || d.participant) return { key, sessionId, message: null }

  const phone = individualPhone(String(d.from ?? ''))
  if (!phone) return { key, sessionId, message: null }

  const name = d.notifyName ?? d._data?.notifyName ?? d._data?.pushName ?? null
  const text = (d.body ?? d.caption ?? '').trim()

  let media: InboundMedia | null = null
  if (d.hasMedia && d.media) {
    const mimetype = d.media.mimetype ?? 'application/octet-stream'
    const kind = MEDIA_TYPES[mimetype.split('/')[0] ?? ''] ?? 'other'
    media = {
      kind: mimetype.startsWith('application/pdf') ? 'document' : kind,
      mimetype,
      filename: d.media.filename ?? null,
      base64: null,
      url: d.media.url ?? null,
      omitted: !d.media.url,
      sizeBytes: null,
      chatId: String(d.from ?? `${phone}@c.us`),
    }
  } else if (d.hasMedia) {
    // Media we were told about but given no handle on: nothing to act on.
    return { key, sessionId, message: null }
  }

  if (!text && !media) return { key, sessionId, message: null }
  return { key, sessionId, message: { phone, text, messageId: String(d.id ?? key ?? ''), name: name ? String(name).slice(0, 80) : null, media } }
}

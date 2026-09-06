import { createHmac, timingSafeEqual } from 'node:crypto'
import type { InboundMessage, WhatsAppProvider } from '@/lib/whatsapp/provider'

const GRAPH_VERSION = 'v21.0'

/** Meta WhatsApp Cloud API adapter. */
export class MetaProvider implements WhatsAppProvider {
  readonly name = 'meta' as const

  private endpoint(path: string): string {
    return `https://graph.facebook.com/${GRAPH_VERSION}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/${path}`
  }

  async sendText(toPhone: string, body: string): Promise<void> {
    const response = await fetch(this.endpoint('messages'), {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messaging_product: 'whatsapp', recipient_type: 'individual', to: toPhone, type: 'text', text: { preview_url: false, body } }),
    })
    if (!response.ok) {
      const text = await response.text().catch(() => '')
      throw new Error(`Meta ${response.status}: ${text.slice(0, 300)}`)
    }
  }
}

export function verifyMetaSignature(rawBody: string, header: string | null): boolean {
  const secret = process.env.WHATSAPP_APP_SECRET
  if (!secret) return true
  if (!header?.startsWith('sha256=')) return false
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex')
  const provided = header.slice('sha256='.length)
  if (expected.length !== provided.length) return false
  return timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(provided, 'hex'))
}

interface MetaMessage {
  id: string
  from: string
  type: string
  text?: { body: string }
  button?: { text: string }
  interactive?: { button_reply?: { title: string }; list_reply?: { title: string } }
}

export function parseMetaPayload(payload: unknown): InboundMessage[] {
  const out: InboundMessage[] = []
  const entries = (payload as { entry?: unknown[] })?.entry ?? []
  for (const entry of entries) {
    for (const change of (entry as { changes?: unknown[] })?.changes ?? []) {
      const value = (change as { value?: { messages?: MetaMessage[] } })?.value
      for (const m of value?.messages ?? []) {
        const text = m.text?.body ?? m.button?.text ?? m.interactive?.button_reply?.title ?? m.interactive?.list_reply?.title ?? ''
        if (m?.from && m?.id && text.trim()) out.push({ phone: m.from.replace(/\D/g, ''), text: text.trim(), messageId: m.id })
      }
    }
  }
  return out
}

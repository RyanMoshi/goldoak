import { MetaProvider } from '@/lib/whatsapp/providers/meta'
import { OpenWAProvider } from '@/lib/whatsapp/providers/openwa'

/**
 * WhatsApp is a channel, not the system. Providers only send messages and
 * describe inbound ones; everything else (who the person is, what they can
 * do) lives in services shared with the web dashboard.
 *
 * Selection order: OpenWA (self-hosted gateway) when OPENWA_* is set, else the
 * Meta Cloud API when WHATSAPP_* is set, else no provider (in-app only).
 */

export type InboundMediaKind = 'image' | 'document' | 'audio' | 'video' | 'sticker' | 'other'

export interface InboundMedia {
  kind: InboundMediaKind
  mimetype: string
  filename: string | null
  /** Inline bytes when the gateway included them. */
  base64?: string | null
  /** True when the gateway kept the bytes and they must be fetched. */
  omitted?: boolean
  sizeBytes?: number | null
  chatId?: string
}

export interface InboundMessage {
  /** Sender's phone, E.164 digits without plus. */
  phone: string
  text: string
  /** Provider message id, for read receipts and de-duplication. */
  messageId: string
  /** WhatsApp profile name of the sender, when the provider gives it. */
  name?: string | null
  media?: InboundMedia | null
}

export interface OutboundDocument {
  url?: string
  base64?: string
  mimetype: string
  filename: string
  caption?: string
}

export interface WhatsAppProvider {
  readonly name: 'openwa' | 'meta'
  sendText(toPhone: string, body: string): Promise<void>
  sendDocument?(toPhone: string, doc: OutboundDocument): Promise<void>
  sendImage?(toPhone: string, doc: OutboundDocument): Promise<void>
  downloadMedia?(chatId: string, messageId: string): Promise<{ bytes: Uint8Array; mimetype: string } | null>
  markRead?(chatId: string): Promise<void>
  typing?(chatId: string): Promise<void>
}

export function getProvider(): WhatsAppProvider | null {
  if (process.env.OPENWA_BASE_URL && process.env.OPENWA_API_KEY && process.env.OPENWA_SESSION_ID) return new OpenWAProvider()
  if (process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID) return new MetaProvider()
  return null
}

export function whatsappConfigured(): boolean {
  return getProvider() !== null
}

/** The number people message. Never shown as digits on the site; used only to build wa.me links. */
export function botNumber(): string | undefined {
  return process.env.WHATSAPP_BOT_NUMBER?.replace(/\D/g, '') || undefined
}

/** Sends a WhatsApp text if a provider is configured. Never throws; returns whether it was sent. */
export async function sendWhatsApp(toPhone: string, body: string): Promise<boolean> {
  const provider = getProvider()
  if (!provider) return false
  try {
    await provider.sendText(toPhone, body.slice(0, 4000))
    return true
  } catch (error) {
    console.error(`whatsapp send failed (${provider.name})`, error instanceof Error ? error.message : error)
    return false
  }
}

export async function sendWhatsAppDocument(toPhone: string, doc: OutboundDocument): Promise<boolean> {
  const provider = getProvider()
  if (!provider?.sendDocument) return false
  try {
    await provider.sendDocument(toPhone, doc)
    return true
  } catch (error) {
    console.error(`whatsapp document failed (${provider.name})`, error instanceof Error ? error.message : error)
    return false
  }
}

/** Best-effort presence: mark the chat read and show typing while we work. */
export async function acknowledgeChat(toPhone: string): Promise<void> {
  const provider = getProvider()
  if (!provider) return
  const chatId = `${toPhone.replace(/\D/g, '')}@c.us`
  try {
    await provider.markRead?.(chatId)
    await provider.typing?.(chatId)
  } catch {
    /* presence is cosmetic */
  }
}

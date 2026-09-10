import { MetaProvider } from '@/lib/whatsapp/providers/meta'
import { OpenWAProvider } from '@/lib/whatsapp/providers/openwa'
import { WahaProvider, wahaConfigured, wahaProvider, wahaReady } from '@/lib/whatsapp/providers/waha'

/**
 * WhatsApp is a channel, not the system. Providers only send messages and
 * describe inbound ones; everything else (who the person is, what they can
 * do) lives in services shared with the web dashboard.
 *
 * Selection order: WAHA (the self-hosted gateway that holds one session per
 * agency) when WAHA_* is set, then the older single-session OpenWA gateway,
 * then the Meta Cloud API when WHATSAPP_* is set, else no provider (in-app
 * only, which is how local development runs).
 */

export type InboundMediaKind = 'image' | 'document' | 'audio' | 'video' | 'sticker' | 'other'

export interface InboundMedia {
  kind: InboundMediaKind
  mimetype: string
  filename: string | null
  /** Inline bytes when the gateway included them. */
  base64?: string | null
  /** Where the gateway is holding the bytes, when it sends a handle instead. */
  url?: string | null
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
  readonly name: 'waha' | 'openwa' | 'meta'
  sendText(toPhone: string, body: string): Promise<void>
  sendDocument?(toPhone: string, doc: OutboundDocument): Promise<void>
  sendImage?(toPhone: string, doc: OutboundDocument): Promise<void>
  downloadMedia?(chatId: string, messageId: string): Promise<{ bytes: Uint8Array; mimetype: string } | null>
  /** Fetches media the gateway is holding at a URL it gave us. */
  downloadMediaUrl?(url: string): Promise<{ bytes: Uint8Array; mimetype: string } | null>
  markRead?(chatId: string): Promise<void>
  typing?(chatId: string): Promise<void>
}

export function getProvider(): WhatsAppProvider | null {
  if (wahaConfigured()) return new WahaProvider()
  if (process.env.OPENWA_BASE_URL && process.env.OPENWA_API_KEY && process.env.OPENWA_SESSION_ID) return new OpenWAProvider()
  if (process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID) return new MetaProvider()
  return null
}

export function whatsappConfigured(): boolean {
  return getProvider() !== null
}

/**
 * Whether a message can actually be sent right now. Unlike whatsappConfigured
 * this also counts a gateway that published its address at runtime, which is
 * the normal case behind a tunnel.
 */
export async function whatsappReady(): Promise<boolean> {
  if (await wahaReady()) return true
  return getProvider() !== null
}

/** The provider bound to an agency's own channel, or the shared gateway. */
export async function providerForOrganization(organizationId?: string | null): Promise<WhatsAppProvider | null> {
  if (organizationId) {
    try {
      const { channelForOrganization } = await import('@/lib/whatsapp/channels')
      const channel = await channelForOrganization(organizationId)
      if (channel?.sessionId && channel.status === 'ready') {
        if (channel.provider === 'waha') {
          const provider = await wahaProvider(channel.sessionId)
          if (provider) return provider
        }
        if (channel.provider === 'openwa' && process.env.OPENWA_BASE_URL && process.env.OPENWA_API_KEY) return new OpenWAProvider(channel.sessionId)
      }
    } catch (error) {
      console.error('channel lookup failed', error instanceof Error ? error.message : error)
    }
  }
  // The shared line, wherever the gateway currently is.
  return (await wahaProvider()) ?? getProvider()
}

/** The number people message. Never shown as digits on the site; used only to build wa.me links. */
export function botNumber(): string | undefined {
  return process.env.WHATSAPP_BOT_NUMBER?.replace(/\D/g, '') || undefined
}

/**
 * Sends a WhatsApp text from the agency's own number when it has one, else
 * from the shared Super Agent number. Never throws; returns whether it was sent.
 */
export async function sendWhatsApp(toPhone: string, body: string, organizationId?: string | null): Promise<boolean> {
  const provider = await providerForOrganization(organizationId)
  if (!provider) return false
  try {
    await provider.sendText(toPhone, body.slice(0, 4000))
    return true
  } catch (error) {
    console.error(`whatsapp send failed (${provider.name})`, error instanceof Error ? error.message : error)
    return false
  }
}

export async function sendWhatsAppDocument(toPhone: string, doc: OutboundDocument, organizationId?: string | null): Promise<boolean> {
  const provider = await providerForOrganization(organizationId)
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
export async function acknowledgeChat(toPhone: string, organizationId?: string | null): Promise<void> {
  const provider = await providerForOrganization(organizationId)
  if (!provider) return
  const chatId = `${toPhone.replace(/\D/g, '')}@c.us`
  try {
    await provider.markRead?.(chatId)
    await provider.typing?.(chatId)
  } catch {
    /* presence is cosmetic */
  }
}

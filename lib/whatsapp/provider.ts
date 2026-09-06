import { MetaProvider } from '@/lib/whatsapp/providers/meta'
import { OpenWAProvider } from '@/lib/whatsapp/providers/openwa'

/**
 * WhatsApp is a channel, not the system. Providers only send text and describe
 * inbound messages; everything else (who the person is, what they can do)
 * lives in services shared with the web dashboard.
 *
 * Selection order: OpenWA (self-hosted gateway) when OPENWA_* is set, else the
 * Meta Cloud API when WHATSAPP_* is set, else no provider (in-app only).
 */

export interface InboundMessage {
  /** Sender's phone, E.164 digits without plus. */
  phone: string
  text: string
  /** Provider message id, for read receipts and de-duplication. */
  messageId: string
}

export interface WhatsAppProvider {
  readonly name: 'openwa' | 'meta'
  sendText(toPhone: string, body: string): Promise<void>
}

export function getProvider(): WhatsAppProvider | null {
  if (process.env.OPENWA_BASE_URL && process.env.OPENWA_API_KEY && process.env.OPENWA_SESSION_ID) return new OpenWAProvider()
  if (process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID) return new MetaProvider()
  return null
}

export function whatsappConfigured(): boolean {
  return getProvider() !== null
}

/** The number people message. Falls back to the organisation record when unset. */
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

/**
 * Thin client for the Meta WhatsApp Cloud API. Server-only; reads secrets
 * from the environment and never exposes them to the browser.
 */

const GRAPH_VERSION = 'v21.0'

export function whatsappConfigured(): boolean {
  return Boolean(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID)
}

function endpoint(path: string): string {
  return `https://graph.facebook.com/${GRAPH_VERSION}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/${path}`
}

async function post(path: string, body: unknown): Promise<void> {
  const response = await fetch(endpoint(path), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`WhatsApp API ${response.status}: ${text.slice(0, 300)}`)
  }
}

/** Sends a plain text message. `to` is E.164 digits without the plus. */
export async function sendText(to: string, body: string): Promise<void> {
  if (!whatsappConfigured()) throw new Error('WhatsApp is not configured')
  await post('messages', {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'text',
    text: { preview_url: false, body },
  })
}

/** Shows the blue ticks on the sender's side. Best effort. */
export async function markRead(messageId: string): Promise<void> {
  if (!whatsappConfigured()) return
  try {
    await post('messages', { messaging_product: 'whatsapp', status: 'read', message_id: messageId })
  } catch {
    // Read receipts are cosmetic.
  }
}

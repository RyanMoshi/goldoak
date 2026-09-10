import { getSql } from '@/lib/db/client'
import { ensureSchema } from '@/lib/db/migrate'
import { toContact, toConversationMessage } from '@/lib/db/mappers'
import { newId } from '@/lib/ids'
import { consult } from '@/services/consult'
import { requestHandoff } from '@/services/handoff'
import { clientForUser, policiesForClient } from '@/services/journey'
import { memoryContext, noteInbound } from '@/services/memory'
import { getOrganization, getUser } from '@/services/users'
import type { ConversationMessage, WhatsAppContact } from '@/types/platform'

/**
 * The web chat (portal "Ask the assistant") on the same persistence as WhatsApp.
 *
 * Every message is written to `conversation_messages` before anything else
 * happens, under the key `web:<userId>` scoped to the agency. The answer is
 * produced on the server regardless of whether the browser is still there,
 * and the page simply reads the thread back. So a refresh, a closed tab, a
 * lost connection or a reply days later all land on the same conversation.
 */

export function webKey(userId: string): string {
  return `web:${userId}`
}

/**
 * Whether a conversation key belongs to the web portal rather than a phone.
 * A web thread has no gateway behind it: the reply is delivered by being
 * written down, because the portal reads the same thread back.
 */
export function isWebKey(key: string): boolean {
  return key.startsWith('web:')
}

async function contactFor(userId: string, organizationId: string): Promise<WhatsAppContact> {
  const sql = getSql()
  const key = webKey(userId)
  const rows = await sql`INSERT INTO whatsapp_contacts (phone, organization_id, user_id, display_name, last_inbound_at, consented_at)
    VALUES (${key}, ${organizationId}, ${userId}, 'Web chat', now(), now())
    ON CONFLICT (phone) DO UPDATE SET organization_id = EXCLUDED.organization_id, user_id = EXCLUDED.user_id, updated_at = now()
    RETURNING *`
  return toContact(rows[0])
}

export async function listWebMessages(userId: string, organizationId: string, limit = 100): Promise<ConversationMessage[]> {
  await ensureSchema()
  const sql = getSql()
  const rows = await sql`SELECT * FROM (SELECT * FROM conversation_messages WHERE phone = ${webKey(userId)} AND organization_id = ${organizationId} ORDER BY at DESC LIMIT ${limit}) m ORDER BY at ASC`
  return rows.map(toConversationMessage)
}

/** True when the newest message is from the person and no answer has landed yet. */
export function awaitingAnswer(messages: ConversationMessage[]): boolean {
  const last = messages[messages.length - 1]
  return Boolean(last && last.role === 'user')
}

/** Persists the question and returns its id. The answer is produced by `answerWebMessage`. */
export async function postWebMessage(userId: string, organizationId: string, text: string): Promise<string> {
  await ensureSchema()
  const sql = getSql()
  const id = newId('msg')
  await contactFor(userId, organizationId)
  await sql`INSERT INTO conversation_messages (id, phone, organization_id, user_id, direction, role, body, channel)
    VALUES (${id}, ${webKey(userId)}, ${organizationId}, ${userId}, 'in', 'user', ${text.slice(0, 4000)}, 'web')`
  await noteInbound(webKey(userId), organizationId)
  return id
}

/** Produces and stores the assistant's reply for the latest unanswered question. Idempotent per question. */
export async function answerWebMessage(userId: string, organizationId: string, questionId: string): Promise<ConversationMessage | null> {
  await ensureSchema()
  const sql = getSql()
  const already = await sql`SELECT 1 FROM conversation_messages WHERE phone = ${webKey(userId)} AND role = 'assistant' AND at > (SELECT at FROM conversation_messages WHERE id = ${questionId}) LIMIT 1`
  if (already.length) return null
  const qRows = await sql`SELECT body FROM conversation_messages WHERE id = ${questionId} AND user_id = ${userId} LIMIT 1`
  if (!qRows[0]) return null
  const question = String(qRows[0].body)

  const [user, organization, client, contact] = await Promise.all([getUser(userId), getOrganization(organizationId), clientForUser(userId), contactFor(userId, organizationId)])
  const policies = client ? await policiesForClient(client.id) : []
  const history = (await listWebMessages(userId, organizationId, 14)).filter((m) => m.id !== questionId)
  let answer: string
  let escalate = false
  try {
    const result = await consult({ question, organization, user, client, policies, history, memory: memoryContext(contact, history), phone: user?.phone ?? null, channel: 'web' })
    answer = result.answer
    escalate = result.escalate
  } catch (error) {
    console.error('web answer failed', error instanceof Error ? error.message : error)
    answer = "I couldn't put together an answer just now. Please try again in a moment, or ask your adviser."
  }
  if (escalate && organization && user?.phone) {
    await requestHandoff({ phone: user.phone, organization, user, client, reason: `Assistant escalated a web question: "${question.slice(0, 120)}"` }).catch(() => null)
    answer += '\n\nAn adviser has been asked to follow up with you.'
  }
  const id = newId('msg')
  const rows = await sql`INSERT INTO conversation_messages (id, phone, organization_id, user_id, direction, role, body, channel)
    VALUES (${id}, ${webKey(userId)}, ${organizationId}, ${userId}, 'out', 'assistant', ${answer.slice(0, 6000)}, 'web') RETURNING *`
  return toConversationMessage(rows[0])
}

import { getSql } from '@/lib/db/client'
import { ensureSchema } from '@/lib/db/migrate'
import { newId } from '@/lib/ids'
import { sendWhatsApp } from '@/lib/whatsapp/provider'
import { audit } from '@/services/audit'
import { appendMessage, assignContact, getContact, setMode } from '@/services/conversations'
import { notifyOrganization } from '@/services/notifications'
import type { Client, Organization, PublicUser } from '@/types/platform'

/**
 * Human handoff. When a person asks for an adviser (or the assistant decides
 * one is needed) the contact switches to human mode: the assistant stops
 * replying, the agency is notified and a task appears on Today. Advisers reply
 * from the Conversations page; "Resume assistant" hands the chat back.
 */

interface HandoffInput {
  phone: string
  organization: Organization
  user: PublicUser | null
  client: Client | null
  reason: string
  displayName?: string | null
}

export async function requestHandoff(input: HandoffInput): Promise<void> {
  await ensureSchema()
  const sql = getSql()
  const who = input.client?.name ?? input.user?.name ?? input.displayName ?? `+${input.phone}`
  await setMode(input.phone, 'human')

  const ref = `handoff:${input.phone}:${new Date().toISOString().slice(0, 13)}`
  const existing = await sql`SELECT 1 FROM tasks WHERE reference = ${ref} LIMIT 1`
  if (!existing.length) {
    await sql`INSERT INTO tasks (id, organization_id, client_id, client_name, type, product, summary, timing, sla, priority, due_today, reference, action_kind, action_label)
      VALUES (${newId('tsk')}, ${input.organization.id}, ${input.client?.id ?? null}, ${who}, 'lead-contact', 'WhatsApp',
        ${`${who} asked to talk to a person on WhatsApp. ${input.reason.slice(0, 200)}`}, 'Waiting now', 'at-risk', 92, true, ${ref}, 'send', 'Reply on WhatsApp')`
  }
  await notifyOrganization(input.organization.id, {
    clientId: input.client?.id ?? null,
    kind: 'message',
    title: `WhatsApp: ${who} is waiting for an adviser`,
    body: `${input.reason.slice(0, 200)}\n\nReply from Conversations in Super Agent. The assistant stays quiet until you hand the chat back.`,
    reference: ref,
  })
  await audit({ organizationId: input.organization.id, actorUserId: input.user?.id ?? null, action: 'handoff.requested', target: input.phone, detail: { reason: input.reason.slice(0, 200) } })
}

/** An adviser replies to a contact from the dashboard. Scoped to the adviser's organisation. */
export async function agentReply(organizationId: string, actor: { id: string; name: string }, phone: string, body: string): Promise<'sent' | 'failed' | 'forbidden'> {
  const contact = await getContact(phone)
  if (!contact || contact.organizationId !== organizationId) return 'forbidden'
  const text = body.trim()
  // A web thread has no gateway. Writing the message down is the delivery:
  // the portal reads the same conversation back.
  const { isWebKey } = await import('@/services/webchat')
  const sent = isWebKey(phone) ? true : await sendWhatsApp(phone, text, organizationId)
  await appendMessage({ phone, organizationId, userId: contact.userId, direction: 'out', role: 'agent', body: `${text}\n\n— ${actor.name}` })
  if (contact.mode !== 'human') await setMode(phone, 'human', actor.id)
  else if (!contact.assignedUserId) await assignContact(phone, organizationId, actor.id)
  await audit({ organizationId, actorUserId: actor.id, action: 'conversation.reply', target: phone })
  return sent ? 'sent' : 'failed'
}

export async function resumeAssistant(organizationId: string, actorUserId: string, phone: string): Promise<boolean> {
  const contact = await getContact(phone)
  if (!contact || contact.organizationId !== organizationId) return false
  await setMode(phone, 'ai')
  const { isWebKey } = await import('@/services/webchat')
  const text = isWebKey(phone)
    ? 'Your adviser has handed this chat back to the assistant. Ask me anything, or say you would like a person again.'
    : 'Your adviser has handed this chat back to the Super Agent assistant. Reply MENU to see what I can do, or 9 to reach an adviser again.'
  if (!isWebKey(phone)) await sendWhatsApp(phone, text, organizationId)
  await appendMessage({ phone, organizationId, userId: contact.userId, direction: 'out', role: 'system', body: text })
  await audit({ organizationId, actorUserId, action: 'conversation.resume-ai', target: phone })
  return true
}

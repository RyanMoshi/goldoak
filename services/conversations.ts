import { getSql } from '@/lib/db/client'
import { ensureSchema } from '@/lib/db/migrate'
import { toContact, toConversationMessage, toConversationRow } from '@/lib/db/mappers'
import { newId } from '@/lib/ids'
import type { ContactMode, ConversationMessage, ConversationRow, WhatsAppContact } from '@/types/platform'

/**
 * Conversation state for the shared Super Agent number. One contact row per
 * phone (which agency it belongs to, the running workflow, AI or human mode)
 * and an append-only message log. Everything an agency reads here is filtered
 * by organisation.
 */

export async function getContact(phone: string): Promise<WhatsAppContact | null> {
  await ensureSchema()
  const sql = getSql()
  const rows = await sql`SELECT * FROM whatsapp_contacts WHERE phone = ${phone} LIMIT 1`
  return rows[0] ? toContact(rows[0]) : null
}

/** Ensures a contact row exists and records the inbound. */
export async function touchContact(phone: string, displayName: string | null): Promise<WhatsAppContact> {
  await ensureSchema()
  const sql = getSql()
  const rows = await sql`INSERT INTO whatsapp_contacts (phone, display_name, last_inbound_at)
    VALUES (${phone}, ${displayName}, now())
    ON CONFLICT (phone) DO UPDATE SET last_inbound_at = now(), display_name = COALESCE(EXCLUDED.display_name, whatsapp_contacts.display_name), updated_at = now()
    RETURNING *`
  return toContact(rows[0])
}

export async function linkContact(phone: string, patch: { organizationId?: string | null; userId?: string | null }): Promise<void> {
  const sql = getSql()
  if (patch.organizationId !== undefined) await sql`UPDATE whatsapp_contacts SET organization_id = ${patch.organizationId}, updated_at = now() WHERE phone = ${phone}`
  if (patch.userId !== undefined) await sql`UPDATE whatsapp_contacts SET user_id = ${patch.userId}, updated_at = now() WHERE phone = ${phone}`
}

export async function setWorkflow(phone: string, workflow: string | null, step: number | null, data: Record<string, unknown>): Promise<void> {
  const sql = getSql()
  await sql`UPDATE whatsapp_contacts SET workflow = ${workflow}, step = ${step}, data = ${sql.json(data as never)}, updated_at = now() WHERE phone = ${phone}`
}

export async function setMode(phone: string, mode: ContactMode, assignedUserId: string | null = null): Promise<void> {
  const sql = getSql()
  if (mode === 'human') {
    await sql`UPDATE whatsapp_contacts SET mode = 'human', assigned_user_id = ${assignedUserId}, handoff_at = now(), workflow = NULL, step = NULL, data = '{}'::jsonb, updated_at = now() WHERE phone = ${phone}`
  } else {
    await sql`UPDATE whatsapp_contacts SET mode = 'ai', assigned_user_id = NULL, handoff_at = NULL, updated_at = now() WHERE phone = ${phone}`
  }
}

export async function assignContact(phone: string, organizationId: string, assignedUserId: string | null): Promise<void> {
  const sql = getSql()
  await sql`UPDATE whatsapp_contacts SET assigned_user_id = ${assignedUserId}, updated_at = now() WHERE phone = ${phone} AND organization_id = ${organizationId}`
}

/**
 * A workflow never silently expires: the person can come back hours or days
 * later and continue. Only a flow untouched for 30 days is dropped, because by
 * then the data it holds is stale.
 */
export function workflowExpired(contact: WhatsAppContact): boolean {
  return Date.now() - new Date(contact.updatedAt).getTime() > 30 * 24 * 60 * 60 * 1000
}

/** Minutes since the previous inbound message (before this one was recorded). */
export function minutesSince(previousInboundAt: string | null): number {
  if (!previousInboundAt) return 0
  return Math.floor((Date.now() - new Date(previousInboundAt).getTime()) / 60_000)
}

interface AppendInput {
  phone: string
  organizationId: string | null
  userId: string | null
  direction: 'in' | 'out'
  role: ConversationMessage['role']
  body: string
}

export async function appendMessage(input: AppendInput): Promise<void> {
  try {
    const sql = getSql()
    await sql`INSERT INTO conversation_messages (id, phone, organization_id, user_id, direction, role, body)
      VALUES (${newId('msg')}, ${input.phone}, ${input.organizationId}, ${input.userId}, ${input.direction}, ${input.role}, ${input.body.slice(0, 4000)})`
  } catch (error) {
    console.error('conversation log failed', error instanceof Error ? error.message : error)
  }
}

/** Recent messages for a phone, oldest first. Scoped to the organisation when given. */
export async function recentMessages(phone: string, organizationId: string | null, limit = 20): Promise<ConversationMessage[]> {
  const sql = getSql()
  const rows = organizationId
    ? await sql`SELECT * FROM (SELECT * FROM conversation_messages WHERE phone = ${phone} AND (organization_id = ${organizationId} OR organization_id IS NULL) ORDER BY at DESC LIMIT ${limit}) m ORDER BY at ASC`
    : await sql`SELECT * FROM (SELECT * FROM conversation_messages WHERE phone = ${phone} ORDER BY at DESC LIMIT ${limit}) m ORDER BY at ASC`
  return rows.map(toConversationMessage)
}

const CONVERSATION_SELECT = `SELECT w.*, u.name AS user_name, c.id AS client_id, c.name AS client_name, a.name AS assigned_name, o.name AS organization_name,
      lm.body AS last_message, lm.at AS last_message_at,
      (SELECT count(*) FROM conversation_messages m WHERE m.phone = w.phone AND m.direction = 'in') AS inbound_count
    FROM whatsapp_contacts w
    LEFT JOIN users u ON u.id = w.user_id
    LEFT JOIN clients c ON c.user_id = w.user_id
    LEFT JOIN users a ON a.id = w.assigned_user_id
    LEFT JOIN organizations o ON o.id = w.organization_id
    LEFT JOIN LATERAL (SELECT body, at FROM conversation_messages m WHERE m.phone = w.phone ORDER BY at DESC LIMIT 1) lm ON true`

/** Conversations for one agency. Human-mode (waiting for a person) first, then most recent. */
export async function listConversations(organizationId: string, limit = 100): Promise<ConversationRow[]> {
  await ensureSchema()
  const sql = getSql()
  const rows = await sql.unsafe(`${CONVERSATION_SELECT} WHERE w.organization_id = $1 ORDER BY (w.mode = 'human') DESC, COALESCE(lm.at, w.updated_at) DESC LIMIT $2`, [organizationId, limit])
  return rows.map((r) => toConversationRow(r as Record<string, unknown>))
}

/** Super admin: every conversation, unrouted ones first. */
export async function listAllConversations(limit = 200): Promise<ConversationRow[]> {
  await ensureSchema()
  const sql = getSql()
  const rows = await sql.unsafe(`${CONVERSATION_SELECT} ORDER BY (w.organization_id IS NULL) DESC, (w.mode = 'human') DESC, COALESCE(lm.at, w.updated_at) DESC LIMIT $1`, [limit])
  return rows.map((r) => toConversationRow(r as Record<string, unknown>))
}

/** One conversation, only if it belongs to the organisation (or for the super admin when organizationId is null). */
export async function getConversation(organizationId: string | null, phone: string): Promise<{ contact: ConversationRow; messages: ConversationMessage[] } | null> {
  await ensureSchema()
  const sql = getSql()
  const rows = organizationId
    ? await sql.unsafe(`${CONVERSATION_SELECT} WHERE w.phone = $1 AND w.organization_id = $2 LIMIT 1`, [phone, organizationId])
    : await sql.unsafe(`${CONVERSATION_SELECT} WHERE w.phone = $1 LIMIT 1`, [phone])
  if (!rows[0]) return null
  const contact = toConversationRow(rows[0] as Record<string, unknown>)
  const messages = await recentMessages(phone, organizationId, 200)
  return { contact, messages }
}

export async function countWaitingForHuman(organizationId: string): Promise<number> {
  const sql = getSql()
  const rows = await sql`SELECT count(*) AS n FROM whatsapp_contacts WHERE organization_id = ${organizationId} AND mode = 'human'`
  return Number(rows[0]?.n ?? 0)
}

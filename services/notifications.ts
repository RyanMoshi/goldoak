import { getSql } from '@/lib/db/client'
import { ensureSchema } from '@/lib/db/migrate'
import { toNotification } from '@/lib/db/mappers'
import { newId } from '@/lib/ids'
import { sendWhatsApp } from '@/lib/whatsapp/provider'
import type { Notification, NotificationKind } from '@/types/platform'

interface NotifyInput {
  organizationId: string
  userId: string | null
  clientId?: string | null
  kind: NotificationKind
  title: string
  body: string
  /** Unique key to avoid sending the same notification twice (e.g. renewal-30:pol_123). */
  reference?: string
  /** Phone to reach on WhatsApp; looked up from the user when omitted. */
  phone?: string | null
  /** Skip WhatsApp even when a provider exists. */
  inAppOnly?: boolean
}

/**
 * Records a notification (visible on the site) and, when the person has a
 * phone and has not opted out, sends the same text on WhatsApp. One call,
 * both channels: the user chooses where to read it.
 */
export async function notify(input: NotifyInput): Promise<Notification | null> {
  await ensureSchema()
  const sql = getSql()
  const id = newId('ntf')

  if (input.reference) {
    const existing = await sql`SELECT 1 FROM notifications WHERE reference = ${input.reference} LIMIT 1`
    if (existing.length) return null
  }

  let phone = input.phone ?? null
  let optIn = true
  if (input.userId) {
    const rows = await sql`SELECT phone, whatsapp_opt_in FROM users WHERE id = ${input.userId} AND active LIMIT 1`
    if (rows[0]) {
      phone = phone ?? (rows[0].phone ? String(rows[0].phone) : null)
      optIn = rows[0].whatsapp_opt_in !== false
    }
  }

  let whatsappStatus: Notification['whatsappStatus'] = 'skipped'
  if (phone && optIn && !input.inAppOnly) {
    const sent = await sendWhatsApp(phone, `${input.title}\n\n${input.body}`)
    whatsappStatus = sent ? 'sent' : 'failed'
  }

  const rows = await sql`INSERT INTO notifications (id, organization_id, user_id, client_id, kind, title, body, reference, whatsapp_status)
    VALUES (${id}, ${input.organizationId}, ${input.userId}, ${input.clientId ?? null}, ${input.kind}, ${input.title}, ${input.body}, ${input.reference ?? null}, ${whatsappStatus})
    ON CONFLICT DO NOTHING
    RETURNING *`
  return rows[0] ? toNotification(rows[0]) : null
}

/** Notifies every active agency user of an organisation. */
export async function notifyOrganization(organizationId: string, input: Omit<NotifyInput, 'organizationId' | 'userId'>): Promise<void> {
  const sql = getSql()
  const agents = await sql`SELECT id FROM users WHERE organization_id = ${organizationId} AND role IN ('agency','admin') AND active`
  for (const agent of agents) {
    await notify({ ...input, organizationId, userId: String(agent.id), reference: input.reference ? `${input.reference}:${String(agent.id)}` : undefined })
  }
}

export async function listNotifications(userId: string, limit = 20): Promise<Notification[]> {
  const sql = getSql()
  const rows = await sql`SELECT * FROM notifications WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT ${limit}`
  return rows.map(toNotification)
}

export async function unreadCount(userId: string): Promise<number> {
  const sql = getSql()
  const rows = await sql`SELECT count(*) AS n FROM notifications WHERE user_id = ${userId} AND read_at IS NULL`
  return Number(rows[0]?.n ?? 0)
}

export async function markAllRead(userId: string): Promise<void> {
  const sql = getSql()
  await sql`UPDATE notifications SET read_at = now() WHERE user_id = ${userId} AND read_at IS NULL`
}

import { getSql } from '@/lib/db/client'
import { ensureSchema } from '@/lib/db/migrate'
import { toEnquiry, toEnquiryRow } from '@/lib/db/mappers'
import { newId, reference } from '@/lib/ids'
import { audit } from '@/services/audit'
import { notify, notifyOrganization } from '@/services/notifications'
import type { Enquiry, EnquiryRow } from '@/types/platform'

/** General enquiries: a subject, a message, a reference, and an answer from the agency that reaches the person where they are. */

interface CreateEnquiryInput {
  organizationId: string
  clientId: string | null
  userId: string | null
  phone: string | null
  name: string
  subject: string
  body: string
  channel: 'whatsapp' | 'web'
}

export async function createEnquiry(input: CreateEnquiryInput): Promise<Enquiry> {
  await ensureSchema()
  const sql = getSql()
  const count = await sql`SELECT count(*) AS n FROM enquiries`
  const ref = reference('ENQ', Number(count[0]?.n ?? 0) + 1)
  const id = newId('enq')
  const rows = await sql`INSERT INTO enquiries (id, organization_id, client_id, user_id, phone, reference, subject, body, channel)
    VALUES (${id}, ${input.organizationId}, ${input.clientId}, ${input.userId}, ${input.phone}, ${ref}, ${input.subject.slice(0, 160)}, ${input.body.slice(0, 2000)}, ${input.channel}) RETURNING *`
  await sql`INSERT INTO tasks (id, organization_id, client_id, client_name, type, product, summary, timing, sla, priority, due_today, reference, action_kind, action_label)
    VALUES (${newId('tsk')}, ${input.organizationId}, ${input.clientId}, ${input.name}, 'lead-contact', 'Enquiry', ${`${input.name} asks: ${input.subject}. ${input.body.slice(0, 140)}`}, 'Received just now', 'on-track', 78, true, ${ref}, 'send', 'Answer enquiry')`
  await notifyOrganization(input.organizationId, { clientId: input.clientId, kind: 'task', title: `Enquiry ${ref}: ${input.subject.slice(0, 60)}`, body: `${input.name}: ${input.body.slice(0, 200)}`, reference: `enquiry:${id}`, inAppOnly: true })
  await audit({ organizationId: input.organizationId, actorUserId: input.userId, action: 'enquiry.created', target: id })
  return toEnquiry(rows[0])
}

export async function listEnquiries(organizationId: string, limit = 200): Promise<EnquiryRow[]> {
  await ensureSchema()
  const sql = getSql()
  const rows = await sql`SELECT e.*, c.name AS client_name FROM enquiries e LEFT JOIN clients c ON c.id = e.client_id WHERE e.organization_id = ${organizationId}
    ORDER BY (e.status = 'open') DESC, e.created_at DESC LIMIT ${limit}`
  return rows.map(toEnquiryRow)
}

export async function listEnquiriesForPerson(organizationId: string, phone: string | null, clientId: string | null): Promise<Enquiry[]> {
  const sql = getSql()
  const rows = await sql`SELECT * FROM enquiries WHERE organization_id = ${organizationId} AND ((${phone}::text IS NOT NULL AND phone = ${phone}) OR (${clientId}::text IS NOT NULL AND client_id = ${clientId})) ORDER BY created_at DESC LIMIT 20`
  return rows.map(toEnquiry)
}

export async function answerEnquiry(organizationId: string, enquiryId: string, answer: string, actor: { id: string; name: string }): Promise<Enquiry | null> {
  const sql = getSql()
  const rows = await sql`UPDATE enquiries SET status = 'answered', answer = ${answer.slice(0, 2000)}, answered_by = ${actor.id}, answered_at = now() WHERE id = ${enquiryId} AND organization_id = ${organizationId} RETURNING *`
  if (!rows[0]) return null
  const enquiry = toEnquiry(rows[0])
  await sql`UPDATE tasks SET completed_at = now() WHERE reference = ${enquiry.reference} AND completed_at IS NULL`
  await notify({ organizationId, userId: enquiry.userId, clientId: enquiry.clientId, phone: enquiry.phone, kind: 'message', title: `Reply to your enquiry ${enquiry.reference}`, body: `${answer.slice(0, 1500)}\n\n— ${actor.name}`, reference: `enquiry-answer:${enquiryId}:${Date.now()}` })
  await audit({ organizationId, actorUserId: actor.id, action: 'enquiry.answered', target: enquiryId })
  return enquiry
}

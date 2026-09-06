import { getSql } from '@/lib/db/client'
import { ensureSchema } from '@/lib/db/migrate'
import { toClaim, toClient, toPolicy, toQuoteRequest } from '@/lib/db/mappers'
import { formatShortDate } from '@/lib/format'
import { newId, reference } from '@/lib/ids'
import { notify, notifyOrganization } from '@/services/notifications'
import type { Claim, ClaimStage, Client, JourneyStage, Policy, QuoteRequest, QuoteStage } from '@/types/platform'
import { CLAIM_STAGES, JOURNEY_STAGES } from '@/types/platform'

/**
 * The actions a client can take and an agency can respond to. Called from the
 * web dashboard, the client portal and the WhatsApp bot alike, so every
 * channel produces the same records, tasks and notifications.
 */

export type Channel = 'web' | 'whatsapp' | 'agency'

async function nextReference(prefix: 'QR' | 'CLM'): Promise<string> {
  const sql = getSql()
  const table = prefix === 'QR' ? 'quote_requests' : 'claims'
  const rows = await sql.unsafe(`SELECT count(*) AS n FROM ${table}`)
  return reference(prefix, Number(rows[0]?.n ?? 0) + 1)
}

export async function clientForUser(userId: string): Promise<Client | null> {
  await ensureSchema()
  const sql = getSql()
  const rows = await sql`SELECT * FROM clients WHERE user_id = ${userId} LIMIT 1`
  return rows[0] ? toClient(rows[0]) : null
}

export async function policiesForClient(clientId: string): Promise<Policy[]> {
  const sql = getSql()
  const rows = await sql`SELECT * FROM policies WHERE client_id = ${clientId} AND status <> 'cancelled' ORDER BY expiry_date ASC`
  return rows.map(toPolicy)
}

/* ---------- Client actions ---------- */

export interface RequestQuoteInput {
  client: Client
  product: string
  notes: string | null
  channel: Channel
  actorUserId: string | null
}

export async function requestQuote(input: RequestQuoteInput): Promise<QuoteRequest> {
  await ensureSchema()
  const sql = getSql()
  const id = newId('qr')
  const ref = await nextReference('QR')
  const rows = await sql`INSERT INTO quote_requests (id, organization_id, client_id, reference, product, stage, notes, channel)
    VALUES (${id}, ${input.client.organizationId}, ${input.client.id}, ${ref}, ${input.product}, 'requested', ${input.notes}, ${input.channel}) RETURNING *`

  await sql`INSERT INTO tasks (id, organization_id, client_id, client_name, type, product, summary, timing, sla, priority, due_today, reference, action_kind, action_label)
    VALUES (${newId('tsk')}, ${input.client.organizationId}, ${input.client.id}, ${input.client.name}, 'quote-follow-up', ${input.product},
      ${`${input.client.name} asked for ${input.product} quotes${input.channel === 'whatsapp' ? ' on WhatsApp' : ''}.${input.notes ? ` Notes: ${input.notes}` : ''}`},
      'Requested just now', 'on-track', 82, true, ${ref}, 'follow-up', 'Go to market')`
  await sql`INSERT INTO activity (id, organization_id, client_id, client_name, kind, title)
    VALUES (${newId('act')}, ${input.client.organizationId}, ${input.client.id}, ${input.client.name}, 'quote-requested', ${`Quote requested: ${input.product} (${ref})`})`
  if (input.client.stage === 'understand') {
    await sql`UPDATE clients SET stage = 'compare', updated_at = now() WHERE id = ${input.client.id} AND stage = 'understand'`
  }

  await notifyOrganization(input.client.organizationId, {
    clientId: input.client.id,
    kind: 'quote-requested',
    title: `New quote request · ${input.client.name}`,
    body: `${input.product} (${ref}) via ${input.channel}. Open Today to go to market.`,
    reference: `quote-requested:${id}`,
  })
  if (input.actorUserId) {
    await notify({
      organizationId: input.client.organizationId,
      userId: input.actorUserId,
      clientId: input.client.id,
      kind: 'quote-requested',
      title: `We are on it: ${input.product}`,
      body: `Reference ${ref}. Your adviser will approach our panel and you will see each insurer's reply here and on WhatsApp.`,
      reference: `quote-ack:${id}`,
    })
  }
  return toQuoteRequest(rows[0])
}

export interface ReportClaimInput {
  client: Client
  policy: Policy | null
  product: string
  insurer: string
  description: string
  incidentDate: string | null
  channel: Channel
  actorUserId: string | null
}

export async function reportClaim(input: ReportClaimInput): Promise<Claim> {
  await ensureSchema()
  const sql = getSql()
  const id = newId('clm')
  const ref = await nextReference('CLM')
  const rows = await sql`INSERT INTO claims (id, organization_id, client_id, policy_id, reference, insurer, product, stage, description, incident_date, channel, next_update_due)
    VALUES (${id}, ${input.client.organizationId}, ${input.client.id}, ${input.policy?.id ?? null}, ${ref}, ${input.insurer}, ${input.product}, 'notified', ${input.description}, ${input.incidentDate}, ${input.channel}, current_date + 1) RETURNING *`

  await sql`INSERT INTO tasks (id, organization_id, client_id, client_name, type, insurer, product, summary, timing, sla, priority, due_today, reference, action_kind, action_label)
    VALUES (${newId('tsk')}, ${input.client.organizationId}, ${input.client.id}, ${input.client.name}, 'claim-update', ${input.insurer}, ${input.product},
      ${`Claim reported${input.channel === 'whatsapp' ? ' on WhatsApp' : ''}: ${input.description.slice(0, 160)}. Register with ${input.insurer} within 24 hours.`},
      'Notified just now', 'at-risk', 95, true, ${ref}, 'update-client', 'Register claim')`
  await sql`INSERT INTO activity (id, organization_id, client_id, client_name, kind, title)
    VALUES (${newId('act')}, ${input.client.organizationId}, ${input.client.id}, ${input.client.name}, 'claim-reported', ${`Claim reported: ${input.product} (${ref})`})`

  await notifyOrganization(input.client.organizationId, {
    clientId: input.client.id,
    kind: 'claim-reported',
    title: `Claim reported · ${input.client.name}`,
    body: `${input.product}, ${input.insurer} (${ref}). Acknowledge today and register with the insurer within 24 hours.`,
    reference: `claim-reported:${id}`,
  })
  if (input.actorUserId) {
    await notify({
      organizationId: input.client.organizationId,
      userId: input.actorUserId,
      clientId: input.client.id,
      kind: 'claim-reported',
      title: `Claim received: ${ref}`,
      body: `We have your ${input.product} claim. We register it with ${input.insurer} within 24 hours and update you every week until it is settled. Keep any photos, receipts and reports safe.`,
      reference: `claim-ack:${id}`,
    })
  }
  return toClaim(rows[0])
}

/* ---------- Agency actions ---------- */

export async function updateClientStage(organizationId: string, clientId: string, stage: JourneyStage, actorName: string): Promise<void> {
  const sql = getSql()
  const rows = await sql`UPDATE clients SET stage = ${stage}, updated_at = now() WHERE id = ${clientId} AND organization_id = ${organizationId} RETURNING *`
  const client = rows[0] ? toClient(rows[0]) : null
  if (!client) return
  const label = JOURNEY_STAGES.find((s) => s.id === stage)
  await sql`INSERT INTO activity (id, organization_id, client_id, client_name, kind, title)
    VALUES (${newId('act')}, ${organizationId}, ${clientId}, ${client.name}, 'stage', ${`Moved to ${label?.label ?? stage} by ${actorName}`})`
  if (client.userId && label) {
    const index = JOURNEY_STAGES.findIndex((s) => s.id === stage)
    await notify({
      organizationId,
      userId: client.userId,
      clientId,
      kind: 'stage-update',
      title: `Stage ${index + 1} of 6: ${label.label}`,
      body: label.description,
      reference: `stage:${clientId}:${stage}:${Date.now()}`,
    })
  }
}

export interface AddPolicyInput {
  organizationId: string
  clientId: string
  insurer: string
  product: string
  policyNumber: string
  sumInsured: number | null
  premium: number
  startDate: string
  expiryDate: string
  keyExclusions: string | null
  actorName: string
}

export async function addPolicy(input: AddPolicyInput): Promise<Policy> {
  const sql = getSql()
  const id = newId('pol')
  const rows = await sql`INSERT INTO policies (id, organization_id, client_id, insurer, product, policy_number, sum_insured, premium, start_date, expiry_date, status, key_exclusions)
    VALUES (${id}, ${input.organizationId}, ${input.clientId}, ${input.insurer}, ${input.product}, ${input.policyNumber}, ${input.sumInsured}, ${input.premium}, ${input.startDate}, ${input.expiryDate}, 'live', ${input.keyExclusions}) RETURNING *`
  const clientRows = await sql`SELECT * FROM clients WHERE id = ${input.clientId} LIMIT 1`
  const client = clientRows[0] ? toClient(clientRows[0]) : null
  if (client) {
    await sql`INSERT INTO activity (id, organization_id, client_id, client_name, kind, title)
      VALUES (${newId('act')}, ${input.organizationId}, ${client.id}, ${client.name}, 'policy', ${`Policy placed: ${input.product} with ${input.insurer} (${input.policyNumber})`})`
    if (client.stage === 'understand' || client.stage === 'solve' || client.stage === 'compare' || client.stage === 'implement') {
      await sql`UPDATE clients SET stage = 'support', updated_at = now() WHERE id = ${client.id}`
    }
    if (client.userId) {
      await notify({
        organizationId: input.organizationId,
        userId: client.userId,
        clientId: client.id,
        kind: 'policy-added',
        title: `Cover in force: ${input.product}`,
        body: `${input.insurer}, policy ${input.policyNumber}, renews ${formatShortDate(input.expiryDate)}. Documents and exclusions are in your portal.`,
        reference: `policy-added:${id}`,
      })
    }
  }
  return toPolicy(rows[0])
}

export async function updateQuoteStage(organizationId: string, quoteId: string, stage: QuoteStage, premiumEstimate: number | null): Promise<void> {
  const sql = getSql()
  const rows = await sql`UPDATE quote_requests SET stage = ${stage}, premium_estimate = coalesce(${premiumEstimate}, premium_estimate), updated_at = now()
    WHERE id = ${quoteId} AND organization_id = ${organizationId} RETURNING *`
  const quote = rows[0] ? toQuoteRequest(rows[0]) : null
  if (!quote) return
  const clientRows = await sql`SELECT * FROM clients WHERE id = ${quote.clientId} LIMIT 1`
  const client = clientRows[0] ? toClient(clientRows[0]) : null
  if (!client) return
  const label: Record<QuoteStage, string> = {
    requested: 'sent to insurers',
    compared: 'being compared on identical terms',
    proposed: 'ready: our recommendation is in your portal',
    accepted: 'accepted, cover is being placed',
    placed: 'placed',
    declined: 'closed',
  }
  await sql`INSERT INTO activity (id, organization_id, client_id, client_name, kind, title)
    VALUES (${newId('act')}, ${organizationId}, ${client.id}, ${client.name}, 'quote-received', ${`Quote ${quote.reference} ${label[stage]}`})`
  if (client.userId) {
    await notify({
      organizationId,
      userId: client.userId,
      clientId: client.id,
      kind: 'quote-update',
      title: `${quote.product} quote: ${label[stage]}`,
      body: `Reference ${quote.reference}. Open your portal or reply QUOTES for details.`,
      reference: `quote-stage:${quote.id}:${stage}`,
    })
  }
}

export async function updateClaimStage(organizationId: string, claimId: string, stage: ClaimStage, amount: number | null, note: string | null): Promise<void> {
  const sql = getSql()
  const rows = await sql`UPDATE claims SET stage = ${stage}, amount = coalesce(${amount}, amount), next_update_due = current_date + 7, updated_at = now()
    WHERE id = ${claimId} AND organization_id = ${organizationId} RETURNING *`
  const claim = rows[0] ? toClaim(rows[0]) : null
  if (!claim) return
  const clientRows = await sql`SELECT * FROM clients WHERE id = ${claim.clientId} LIMIT 1`
  const client = clientRows[0] ? toClient(clientRows[0]) : null
  if (!client) return
  const label = CLAIM_STAGES.find((s) => s.id === stage)?.label ?? stage
  await sql`INSERT INTO activity (id, organization_id, client_id, client_name, kind, title)
    VALUES (${newId('act')}, ${organizationId}, ${client.id}, ${client.name}, 'claim', ${`Claim ${claim.reference}: ${label}`})`
  if (client.userId) {
    await notify({
      organizationId,
      userId: client.userId,
      clientId: client.id,
      kind: 'claim-update',
      title: `Claim ${claim.reference}: ${label}`,
      body: note?.trim() || `Your ${claim.product} claim with ${claim.insurer} is now at "${label}". We will update you again within a week.`,
      reference: `claim-stage:${claim.id}:${stage}:${Date.now()}`,
    })
  }
}

export async function messageClient(organizationId: string, clientId: string, body: string, actorName: string): Promise<'sent' | 'no-user'> {
  const sql = getSql()
  const clientRows = await sql`SELECT * FROM clients WHERE id = ${clientId} AND organization_id = ${organizationId} LIMIT 1`
  const client = clientRows[0] ? toClient(clientRows[0]) : null
  if (!client) return 'no-user'
  await sql`INSERT INTO activity (id, organization_id, client_id, client_name, kind, title)
    VALUES (${newId('act')}, ${organizationId}, ${client.id}, ${client.name}, 'message', ${`Message from ${actorName}: ${body.slice(0, 80)}`})`
  if (!client.userId && !client.phone) return 'no-user'
  await notify({ organizationId, userId: client.userId, clientId: client.id, kind: 'message', title: `Message from ${actorName}`, body, phone: client.phone })
  return 'sent'
}

export interface CreateClientInput {
  organizationId: string
  name: string
  type: 'individual' | 'sme' | 'corporate'
  phone: string | null
  email: string | null
  notes: string | null
  adviserName: string
}

export async function createClient(input: CreateClientInput): Promise<Client> {
  await ensureSchema()
  const sql = getSql()
  const id = newId('cli')
  const rows = await sql`INSERT INTO clients (id, organization_id, name, type, phone, email, stage, adviser_name, notes)
    VALUES (${id}, ${input.organizationId}, ${input.name}, ${input.type}, ${input.phone}, ${input.email}, 'understand', ${input.adviserName}, ${input.notes}) RETURNING *`
  await sql`INSERT INTO tasks (id, organization_id, client_id, client_name, type, product, summary, timing, sla, priority, due_today, action_kind, action_label)
    VALUES (${newId('tsk')}, ${input.organizationId}, ${id}, ${input.name}, 'lead-contact', 'Risk review', ${`New lead added by ${input.adviserName}. Book the fact-find.`}, 'Added just now', 'on-track', 70, true, 'call', 'Book fact-find')`
  await sql`INSERT INTO activity (id, organization_id, client_id, client_name, kind, title)
    VALUES (${newId('act')}, ${input.organizationId}, ${id}, ${input.name}, 'signup', ${`Lead added by ${input.adviserName}`})`
  return toClient(rows[0])
}

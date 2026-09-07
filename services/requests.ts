import { getSql } from '@/lib/db/client'
import { ensureSchema } from '@/lib/db/migrate'
import { toClaim, toQuoteRequest, toUpload } from '@/lib/db/mappers'
import { listBusinessClaimsForPhoneOrClient } from '@/services/businesses'
import { listEnquiriesForPerson } from '@/services/enquiries'
import { CLAIM_STAGES } from '@/types/platform'

/**
 * "Check a request": everything a person has asked for, in one list, with
 * where it stands. Scoped to the organisation and to the person (phone or
 * client record) so a guest sees only what they submitted themselves.
 */

export interface RequestItem {
  kind: 'quote' | 'claim' | 'business-claim' | 'enquiry' | 'document'
  reference: string
  title: string
  status: string
  detail: string | null
  createdAt: string
}

const QUOTE_STAGE: Record<string, string> = { requested: 'With insurers', compared: 'Being compared', proposed: 'Proposal sent to you', accepted: 'Accepted, being placed', placed: 'Placed', declined: 'Declined' }

export async function listRequests(organizationId: string, phone: string | null, clientId: string | null): Promise<RequestItem[]> {
  await ensureSchema()
  const sql = getSql()
  const items: RequestItem[] = []

  if (clientId) {
    const quotes = await sql`SELECT * FROM quote_requests WHERE client_id = ${clientId} AND organization_id = ${organizationId} ORDER BY created_at DESC LIMIT 10`
    for (const r of quotes) {
      const q = toQuoteRequest(r)
      items.push({ kind: 'quote', reference: q.reference, title: `Quote: ${q.product}`, status: QUOTE_STAGE[q.stage] ?? q.stage, detail: null, createdAt: q.createdAt })
    }
    const claims = await sql`SELECT * FROM claims WHERE client_id = ${clientId} AND organization_id = ${organizationId} ORDER BY notified_at DESC LIMIT 10`
    for (const r of claims) {
      const c = toClaim(r)
      items.push({ kind: 'claim', reference: c.reference, title: `Claim: ${c.product}`, status: CLAIM_STAGES.find((s) => s.id === c.stage)?.label ?? c.stage, detail: c.nextUpdateDue ? `next update ${c.nextUpdateDue.slice(0, 10)}` : null, createdAt: c.notifiedAt })
    }
  }
  for (const b of await listBusinessClaimsForPhoneOrClient(organizationId, phone, clientId)) {
    items.push({ kind: 'business-claim', reference: b.reference, title: `Business claim: ${b.businessName}`, status: b.status === 'pending' ? 'Waiting for the agency to verify' : b.status === 'approved' ? 'Approved' : 'Not approved', detail: b.reviewNote, createdAt: b.createdAt })
  }
  for (const e of await listEnquiriesForPerson(organizationId, phone, clientId)) {
    items.push({ kind: 'enquiry', reference: e.reference, title: `Enquiry: ${e.subject}`, status: e.status === 'open' ? 'Waiting for a reply' : e.status === 'answered' ? 'Answered' : 'Closed', detail: e.answer ? e.answer.slice(0, 160) : null, createdAt: e.createdAt })
  }
  const uploads = await sql`SELECT * FROM uploads WHERE organization_id = ${organizationId} AND ((${phone}::text IS NOT NULL AND phone = ${phone}) OR (${clientId}::text IS NOT NULL AND client_id = ${clientId})) ORDER BY created_at DESC LIMIT 10`
  for (const r of uploads) {
    const u = toUpload(r)
    items.push({ kind: 'document', reference: u.id.replace('upl_', 'DOC-').toUpperCase().slice(0, 12), title: `Document: ${u.filename}`, status: u.ocrStatus === 'done' ? (u.confirmedAt ? 'Read and confirmed' : 'Read, waiting for your confirmation') : u.ocrStatus === 'failed' ? 'Could not be read; an adviser will look' : u.ocrStatus === 'skipped' ? 'Received; an adviser will look' : 'Being read', detail: null, createdAt: u.createdAt })
  }
  return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 15)
}

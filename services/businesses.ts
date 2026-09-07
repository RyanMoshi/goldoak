import { getSql } from '@/lib/db/client'
import { ensureSchema } from '@/lib/db/migrate'
import { toBusiness, toBusinessClaim } from '@/lib/db/mappers'
import { newId, reference } from '@/lib/ids'
import { audit } from '@/services/audit'
import { notify, notifyOrganization } from '@/services/notifications'
import type { Business, BusinessClaim, BusinessClaimStatus } from '@/types/platform'

/**
 * Businesses an agency serves, and the claims people make on them ("this is
 * my business"). A claim is reviewed by the agency; approval links the
 * business to the client's record.
 */

export async function searchBusinesses(organizationId: string, query: string, limit = 8): Promise<Business[]> {
  await ensureSchema()
  const sql = getSql()
  const q = `%${query.trim().toLowerCase().replace(/\s+/g, '%')}%`
  const rows = await sql`SELECT * FROM businesses WHERE organization_id = ${organizationId} AND (lower(name) LIKE ${q} OR lower(coalesce(registration_no, '')) LIKE ${q})
    ORDER BY (lower(name) = ${query.trim().toLowerCase()}) DESC, name LIMIT ${limit}`
  return rows.map(toBusiness)
}

export async function listBusinesses(organizationId: string, limit = 200): Promise<Business[]> {
  await ensureSchema()
  const sql = getSql()
  const rows = await sql`SELECT * FROM businesses WHERE organization_id = ${organizationId} ORDER BY name LIMIT ${limit}`
  return rows.map(toBusiness)
}

export async function getBusiness(organizationId: string, id: string): Promise<Business | null> {
  const sql = getSql()
  const rows = await sql`SELECT * FROM businesses WHERE id = ${id} AND organization_id = ${organizationId} LIMIT 1`
  return rows[0] ? toBusiness(rows[0]) : null
}

interface BusinessInput {
  organizationId: string
  name: string
  registrationNo?: string | null
  sector?: string | null
  phone?: string | null
  email?: string | null
  address?: string | null
  clientId?: string | null
  verified?: boolean
  createdBy: string | null
}

export async function createBusiness(input: BusinessInput): Promise<Business> {
  await ensureSchema()
  const sql = getSql()
  const id = newId('biz')
  const rows = await sql`INSERT INTO businesses (id, organization_id, client_id, name, registration_no, sector, phone, email, address, verified, created_by)
    VALUES (${id}, ${input.organizationId}, ${input.clientId ?? null}, ${input.name.trim()}, ${input.registrationNo ?? null}, ${input.sector ?? null}, ${input.phone ?? null}, ${input.email ?? null}, ${input.address ?? null}, ${input.verified ?? false}, ${input.createdBy})
    RETURNING *`
  await audit({ organizationId: input.organizationId, actorUserId: input.createdBy, action: 'business.created', target: id, detail: { name: input.name } })
  return toBusiness(rows[0])
}

export async function updateBusiness(organizationId: string, id: string, patch: Partial<Omit<BusinessInput, 'organizationId' | 'createdBy'>>, actorUserId: string): Promise<void> {
  const sql = getSql()
  const current = await getBusiness(organizationId, id)
  if (!current) throw new Error('Business not found')
  await sql`UPDATE businesses SET
      name = ${patch.name ?? current.name}, registration_no = ${patch.registrationNo !== undefined ? patch.registrationNo : current.registrationNo},
      sector = ${patch.sector !== undefined ? patch.sector : current.sector}, phone = ${patch.phone !== undefined ? patch.phone : current.phone},
      email = ${patch.email !== undefined ? patch.email : current.email}, address = ${patch.address !== undefined ? patch.address : current.address},
      verified = ${patch.verified ?? current.verified}, client_id = ${patch.clientId !== undefined ? patch.clientId : current.clientId}, updated_at = now()
    WHERE id = ${id} AND organization_id = ${organizationId}`
  await audit({ organizationId, actorUserId, action: 'business.updated', target: id })
}

/* ---------- Claims on a business ---------- */

interface SubmitClaimInput {
  organizationId: string
  businessId: string
  clientId: string | null
  userId: string | null
  phone: string | null
  applicantName: string
  relationship: string
  verification: string | null
  channel: 'whatsapp' | 'web'
}

export async function submitBusinessClaim(input: SubmitClaimInput): Promise<BusinessClaim> {
  await ensureSchema()
  const sql = getSql()
  const business = await getBusiness(input.organizationId, input.businessId)
  if (!business) throw new Error('Business not found')
  const count = await sql`SELECT count(*) AS n FROM business_claims`
  const ref = reference('BIZ', Number(count[0]?.n ?? 0) + 1)
  const id = newId('bcl')
  await sql`INSERT INTO business_claims (id, organization_id, business_id, client_id, user_id, phone, reference, applicant_name, relationship, verification, channel)
    VALUES (${id}, ${input.organizationId}, ${input.businessId}, ${input.clientId}, ${input.userId}, ${input.phone}, ${ref}, ${input.applicantName}, ${input.relationship}, ${input.verification}, ${input.channel})`
  await sql`INSERT INTO tasks (id, organization_id, client_id, client_name, type, product, summary, timing, sla, priority, due_today, reference, action_kind, action_label)
    VALUES (${newId('tsk')}, ${input.organizationId}, ${input.clientId}, ${input.applicantName}, 'documents-missing', 'Business claim',
      ${`${input.applicantName} claims ${business.name} (${input.relationship}). Verify and approve or reject under Businesses.`}, 'Submitted just now', 'on-track', 80, true, ${ref}, 'review', 'Review claim')`
  await notifyOrganization(input.organizationId, {
    clientId: input.clientId,
    kind: 'task',
    title: `Business claim ${ref}: ${business.name}`,
    body: `${input.applicantName} (${input.relationship}) asks to be linked to ${business.name}. Review it under Businesses → Claims.`,
    reference: `bizclaim:${id}`,
    inAppOnly: true,
  })
  await audit({ organizationId: input.organizationId, actorUserId: input.userId, action: 'business-claim.submitted', target: id, detail: { businessId: input.businessId, ref } })
  const rows = await sql`SELECT bc.*, b.name AS business_name FROM business_claims bc JOIN businesses b ON b.id = bc.business_id WHERE bc.id = ${id}`
  return toBusinessClaim(rows[0])
}

export async function listBusinessClaims(organizationId: string, status?: BusinessClaimStatus, limit = 200): Promise<BusinessClaim[]> {
  await ensureSchema()
  const sql = getSql()
  const rows = status
    ? await sql`SELECT bc.*, b.name AS business_name FROM business_claims bc JOIN businesses b ON b.id = bc.business_id WHERE bc.organization_id = ${organizationId} AND bc.status = ${status} ORDER BY bc.created_at DESC LIMIT ${limit}`
    : await sql`SELECT bc.*, b.name AS business_name FROM business_claims bc JOIN businesses b ON b.id = bc.business_id WHERE bc.organization_id = ${organizationId} ORDER BY (bc.status = 'pending') DESC, bc.created_at DESC LIMIT ${limit}`
  return rows.map(toBusinessClaim)
}

export async function listBusinessClaimsForPhoneOrClient(organizationId: string, phone: string | null, clientId: string | null): Promise<BusinessClaim[]> {
  const sql = getSql()
  const rows = await sql`SELECT bc.*, b.name AS business_name FROM business_claims bc JOIN businesses b ON b.id = bc.business_id
    WHERE bc.organization_id = ${organizationId} AND ((${phone}::text IS NOT NULL AND bc.phone = ${phone}) OR (${clientId}::text IS NOT NULL AND bc.client_id = ${clientId}))
    ORDER BY bc.created_at DESC LIMIT 20`
  return rows.map(toBusinessClaim)
}

export async function reviewBusinessClaim(organizationId: string, claimId: string, decision: 'approved' | 'rejected', note: string | null, reviewer: { id: string; name: string }): Promise<BusinessClaim | null> {
  const sql = getSql()
  const rows = await sql`UPDATE business_claims SET status = ${decision}, review_note = ${note}, reviewed_by = ${reviewer.id}, reviewed_at = now()
    WHERE id = ${claimId} AND organization_id = ${organizationId} AND status = 'pending' RETURNING *`
  if (!rows[0]) return null
  const full = await sql`SELECT bc.*, b.name AS business_name FROM business_claims bc JOIN businesses b ON b.id = bc.business_id WHERE bc.id = ${claimId}`
  const claim = toBusinessClaim(full[0])
  if (decision === 'approved' && claim.clientId) {
    await sql`UPDATE businesses SET client_id = ${claim.clientId}, verified = true, updated_at = now() WHERE id = ${claim.businessId}`
  }
  await sql`UPDATE tasks SET completed_at = now() WHERE reference = ${claim.reference} AND completed_at IS NULL`
  await notify({
    organizationId,
    userId: claim.userId,
    clientId: claim.clientId,
    phone: claim.phone,
    kind: 'stage-update',
    title: decision === 'approved' ? `Business claim ${claim.reference} approved` : `Business claim ${claim.reference} not approved`,
    body: decision === 'approved' ? `${claim.businessName} is now linked to your account. ${reviewer.name} will be in touch about its cover.` : `${reviewer.name} could not approve your claim on ${claim.businessName}.${note ? ` Note: ${note}` : ''} Reply 7 on WhatsApp to talk to an adviser.`,
    reference: `bizclaim-${decision}:${claimId}`,
  })
  await audit({ organizationId, actorUserId: reviewer.id, action: `business-claim.${decision}`, target: claimId, detail: { note } })
  return claim
}

import { getSql } from '@/lib/db/client'
import { ensureSchema } from '@/lib/db/migrate'
import { toClaim, toPolicy, toQuoteRequest, toSubmission } from '@/lib/db/mappers'
import { JOURNEY_STAGES, type Claim, type ClientType, type JourneyStage, type Policy, type QuoteRequest } from '@/types/platform'

/**
 * Read models for the agency workspace pages. Every query is scoped to one
 * organisation; nothing here is ever called without an organisation id.
 */

const n = (v: unknown) => Number(v ?? 0)
const s = (v: unknown) => (v == null ? null : String(v))

/* ---------- Pipeline (kanban by journey stage) ---------- */

export interface PipelineCard {
  id: string
  name: string
  type: ClientType
  stage: JourneyStage
  adviserName: string | null
  phone: string | null
  openQuotes: number
  quoteValue: number
  policies: number
  annualPremium: number
  updatedAt: string
  daysInStage: number
}

export interface PipelineColumn {
  stage: JourneyStage
  label: string
  description: string
  cards: PipelineCard[]
  value: number
}

export async function getPipeline(organizationId: string): Promise<PipelineColumn[]> {
  await ensureSchema()
  const sql = getSql()
  const rows = await sql`SELECT c.id, c.name, c.type, c.stage, c.adviser_name, c.phone, c.updated_at,
      (SELECT count(*) FROM quote_requests q WHERE q.client_id = c.id AND q.stage IN ('requested','compared','proposed')) AS open_quotes,
      (SELECT coalesce(sum(premium_estimate),0) FROM quote_requests q WHERE q.client_id = c.id AND q.stage IN ('requested','compared','proposed')) AS quote_value,
      (SELECT count(*) FROM policies p WHERE p.client_id = c.id AND p.status IN ('live','renewal-due')) AS policies,
      (SELECT coalesce(sum(premium),0) FROM policies p WHERE p.client_id = c.id AND p.status IN ('live','renewal-due')) AS annual_premium,
      (SELECT max(at) FROM activity a WHERE a.client_id = c.id AND a.kind = 'stage') AS stage_changed_at
    FROM clients c WHERE c.organization_id = ${organizationId} ORDER BY c.updated_at DESC`
  const cards: PipelineCard[] = rows.map((r) => {
    const since = r.stage_changed_at ?? r.updated_at
    return {
      id: String(r.id),
      name: String(r.name),
      type: (r.type as ClientType) ?? 'individual',
      stage: (r.stage as JourneyStage) ?? 'understand',
      adviserName: s(r.adviser_name),
      phone: s(r.phone),
      openQuotes: n(r.open_quotes),
      quoteValue: n(r.quote_value),
      policies: n(r.policies),
      annualPremium: n(r.annual_premium),
      updatedAt: new Date(String(r.updated_at)).toISOString(),
      daysInStage: Math.max(0, Math.floor((Date.now() - new Date(String(since)).getTime()) / 86_400_000)),
    }
  })
  return JOURNEY_STAGES.map((stage) => {
    const list = cards.filter((c) => c.stage === stage.id)
    return { stage: stage.id, label: stage.label, description: stage.description, cards: list, value: list.reduce((sum, c) => sum + (c.quoteValue || c.annualPremium), 0) }
  })
}

/* ---------- Quotes ---------- */

export interface QuoteRow extends QuoteRequest {
  clientName: string
  organizationId: string
}

export async function listQuotes(organizationId: string): Promise<QuoteRow[]> {
  await ensureSchema()
  const sql = getSql()
  const [quoteRows, submissionRows] = await Promise.all([
    sql`SELECT q.*, c.name AS client_name FROM quote_requests q JOIN clients c ON c.id = q.client_id WHERE q.organization_id = ${organizationId}
        ORDER BY (q.stage IN ('requested','compared','proposed')) DESC, q.updated_at DESC LIMIT 300`,
    sql`SELECT s.* FROM quote_submissions s WHERE s.organization_id = ${organizationId} ORDER BY s.sent_at ASC`,
  ])
  const byQuote = new Map<string, ReturnType<typeof toSubmission>[]>()
  for (const r of submissionRows) {
    const key = String(r.quote_request_id)
    byQuote.set(key, [...(byQuote.get(key) ?? []), toSubmission(r)])
  }
  return quoteRows.map((r) => ({ ...toQuoteRequest(r, byQuote.get(String(r.id)) ?? []), clientName: String(r.client_name), organizationId }))
}

/* ---------- Renewals ---------- */

export interface RenewalRow extends Policy {
  clientName: string
  clientPhone: string | null
  daysToExpiry: number
  hasTask: boolean
}

export async function listRenewals(organizationId: string): Promise<RenewalRow[]> {
  await ensureSchema()
  const sql = getSql()
  const rows = await sql`SELECT p.*, c.name AS client_name, c.phone AS client_phone,
      (p.expiry_date - current_date) AS days_to_expiry,
      EXISTS (SELECT 1 FROM tasks t WHERE t.type = 'renewal' AND t.completed_at IS NULL AND t.reference = 'renewal:' || p.id || ':' || to_char(p.expiry_date, 'YYYY-MM-DD')) AS has_task
    FROM policies p JOIN clients c ON c.id = p.client_id
    WHERE p.organization_id = ${organizationId} AND p.status IN ('live','renewal-due','lapsed') AND p.expiry_date BETWEEN current_date - 30 AND current_date + 90
    ORDER BY p.expiry_date ASC`
  return rows.map((r) => ({ ...toPolicy(r), clientName: String(r.client_name), clientPhone: s(r.client_phone), daysToExpiry: n(r.days_to_expiry), hasTask: Boolean(r.has_task) }))
}

/* ---------- Claims ---------- */

export interface ClaimRow extends Claim {
  clientName: string
  daysOpen: number
}

export async function listClaims(organizationId: string): Promise<ClaimRow[]> {
  await ensureSchema()
  const sql = getSql()
  const rows = await sql`SELECT k.*, c.name AS client_name FROM claims k JOIN clients c ON c.id = k.client_id
    WHERE k.organization_id = ${organizationId}
    ORDER BY (k.stage NOT IN ('settled','closed')) DESC, k.next_update_due ASC NULLS LAST, k.updated_at DESC LIMIT 300`
  return rows.map((r) => ({ ...toClaim(r), clientName: String(r.client_name), daysOpen: Math.floor((Date.now() - new Date(String(r.notified_at)).getTime()) / 86_400_000) }))
}

/* ---------- Insurers ---------- */

export interface InsurerRow {
  insurer: string
  policies: number
  premium: number
  submissions: number
  awaiting: number
  received: number
  declined: number
  avgTurnaroundDays: number | null
  openClaims: number
  settledClaims: number
}

export async function listInsurers(organizationId: string): Promise<InsurerRow[]> {
  await ensureSchema()
  const sql = getSql()
  const rows = await sql`WITH names AS (
      SELECT insurer FROM policies WHERE organization_id = ${organizationId}
      UNION SELECT insurer FROM quote_submissions WHERE organization_id = ${organizationId}
      UNION SELECT insurer FROM claims WHERE organization_id = ${organizationId}
    )
    SELECT nm.insurer,
      (SELECT count(*) FROM policies p WHERE p.organization_id = ${organizationId} AND p.insurer = nm.insurer AND p.status IN ('live','renewal-due')) AS policies,
      (SELECT coalesce(sum(premium),0) FROM policies p WHERE p.organization_id = ${organizationId} AND p.insurer = nm.insurer AND p.status IN ('live','renewal-due')) AS premium,
      (SELECT count(*) FROM quote_submissions q WHERE q.organization_id = ${organizationId} AND q.insurer = nm.insurer) AS submissions,
      (SELECT count(*) FROM quote_submissions q WHERE q.organization_id = ${organizationId} AND q.insurer = nm.insurer AND q.status = 'awaiting') AS awaiting,
      (SELECT count(*) FROM quote_submissions q WHERE q.organization_id = ${organizationId} AND q.insurer = nm.insurer AND q.status IN ('received','ready')) AS received,
      (SELECT count(*) FROM quote_submissions q WHERE q.organization_id = ${organizationId} AND q.insurer = nm.insurer AND q.status = 'declined') AS declined,
      (SELECT avg(EXTRACT(EPOCH FROM (q.responded_at - q.sent_at)) / 86400) FROM quote_submissions q WHERE q.organization_id = ${organizationId} AND q.insurer = nm.insurer AND q.responded_at IS NOT NULL) AS avg_turnaround,
      (SELECT count(*) FROM claims k WHERE k.organization_id = ${organizationId} AND k.insurer = nm.insurer AND k.stage NOT IN ('settled','closed')) AS open_claims,
      (SELECT count(*) FROM claims k WHERE k.organization_id = ${organizationId} AND k.insurer = nm.insurer AND k.stage IN ('settled','closed')) AS settled_claims
    FROM names nm WHERE nm.insurer IS NOT NULL AND nm.insurer <> '' ORDER BY premium DESC, nm.insurer`
  return rows.map((r) => ({
    insurer: String(r.insurer),
    policies: n(r.policies),
    premium: n(r.premium),
    submissions: n(r.submissions),
    awaiting: n(r.awaiting),
    received: n(r.received),
    declined: n(r.declined),
    avgTurnaroundDays: r.avg_turnaround == null ? null : Math.round(Number(r.avg_turnaround) * 10) / 10,
    openClaims: n(r.open_claims),
    settledClaims: n(r.settled_claims),
  }))
}

/* ---------- Reports ---------- */

export interface ReportData {
  premiumInForce: number
  policiesInForce: number
  clients: number
  newClients30d: number
  quotesRequested90d: number
  quotesWon90d: number
  conversion: number | null
  openClaims: number
  settledClaims90d: number
  renewalsDue90d: number
  renewalPremium90d: number
  conversations: number
  waitingForHuman: number
  consultations30d: number
  byProduct: { label: string; count: number; premium: number }[]
  byInsurer: { label: string; count: number; premium: number }[]
  byStage: { label: string; count: number }[]
  signupsByMonth: { month: string; count: number }[]
  claimsByStage: { label: string; count: number }[]
}

export async function getReport(organizationId: string): Promise<ReportData> {
  await ensureSchema()
  const sql = getSql()
  const [totals, byProduct, byInsurer, byStage, signups, claimsByStage] = await Promise.all([
    sql`SELECT
      (SELECT coalesce(sum(premium),0) FROM policies WHERE organization_id = ${organizationId} AND status IN ('live','renewal-due')) AS premium_in_force,
      (SELECT count(*) FROM policies WHERE organization_id = ${organizationId} AND status IN ('live','renewal-due')) AS policies_in_force,
      (SELECT count(*) FROM clients WHERE organization_id = ${organizationId}) AS clients,
      (SELECT count(*) FROM clients WHERE organization_id = ${organizationId} AND created_at > now() - interval '30 days') AS new_clients,
      (SELECT count(*) FROM quote_requests WHERE organization_id = ${organizationId} AND created_at > now() - interval '90 days') AS quotes_requested,
      (SELECT count(*) FROM quote_requests WHERE organization_id = ${organizationId} AND created_at > now() - interval '90 days' AND stage IN ('accepted','placed')) AS quotes_won,
      (SELECT count(*) FROM claims WHERE organization_id = ${organizationId} AND stage NOT IN ('settled','closed')) AS open_claims,
      (SELECT count(*) FROM claims WHERE organization_id = ${organizationId} AND stage IN ('settled','closed') AND updated_at > now() - interval '90 days') AS settled_claims,
      (SELECT count(*) FROM policies WHERE organization_id = ${organizationId} AND status IN ('live','renewal-due') AND expiry_date BETWEEN current_date AND current_date + 90) AS renewals_due,
      (SELECT coalesce(sum(premium),0) FROM policies WHERE organization_id = ${organizationId} AND status IN ('live','renewal-due') AND expiry_date BETWEEN current_date AND current_date + 90) AS renewal_premium,
      (SELECT count(*) FROM whatsapp_contacts WHERE organization_id = ${organizationId}) AS conversations,
      (SELECT count(*) FROM whatsapp_contacts WHERE organization_id = ${organizationId} AND mode = 'human') AS waiting,
      (SELECT count(*) FROM consultations WHERE organization_id = ${organizationId} AND at > now() - interval '30 days') AS consultations`,
    sql`SELECT product AS label, count(*) AS count, coalesce(sum(premium),0) AS premium FROM policies WHERE organization_id = ${organizationId} AND status IN ('live','renewal-due') GROUP BY product ORDER BY premium DESC LIMIT 8`,
    sql`SELECT insurer AS label, count(*) AS count, coalesce(sum(premium),0) AS premium FROM policies WHERE organization_id = ${organizationId} AND status IN ('live','renewal-due') GROUP BY insurer ORDER BY premium DESC LIMIT 8`,
    sql`SELECT stage AS label, count(*) AS count FROM clients WHERE organization_id = ${organizationId} GROUP BY stage`,
    sql`SELECT to_char(date_trunc('month', created_at), 'YYYY-MM') AS month, count(*) AS count FROM clients WHERE organization_id = ${organizationId} AND created_at > now() - interval '6 months' GROUP BY 1 ORDER BY 1`,
    sql`SELECT stage AS label, count(*) AS count FROM claims WHERE organization_id = ${organizationId} GROUP BY stage`,
  ])
  const t = totals[0] ?? {}
  const requested = n(t.quotes_requested)
  const stageOrder = JOURNEY_STAGES.map((st) => st.id)
  return {
    premiumInForce: n(t.premium_in_force),
    policiesInForce: n(t.policies_in_force),
    clients: n(t.clients),
    newClients30d: n(t.new_clients),
    quotesRequested90d: requested,
    quotesWon90d: n(t.quotes_won),
    conversion: requested ? Math.round((n(t.quotes_won) / requested) * 100) : null,
    openClaims: n(t.open_claims),
    settledClaims90d: n(t.settled_claims),
    renewalsDue90d: n(t.renewals_due),
    renewalPremium90d: n(t.renewal_premium),
    conversations: n(t.conversations),
    waitingForHuman: n(t.waiting),
    consultations30d: n(t.consultations),
    byProduct: byProduct.map((r) => ({ label: String(r.label), count: n(r.count), premium: n(r.premium) })),
    byInsurer: byInsurer.map((r) => ({ label: String(r.label), count: n(r.count), premium: n(r.premium) })),
    byStage: stageOrder.map((id) => ({ label: JOURNEY_STAGES.find((st) => st.id === id)?.label ?? id, count: n(byStage.find((r) => r.label === id)?.count) })),
    signupsByMonth: signups.map((r) => ({ month: String(r.month), count: n(r.count) })),
    claimsByStage: claimsByStage.map((r) => ({ label: String(r.label), count: n(r.count) })),
  }
}

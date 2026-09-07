import { getSql } from '@/lib/db/client'
import { ensureSchema } from '@/lib/db/migrate'
import { toClaim, toClient, toPolicy, toQuoteRequest, toSubmission } from '@/lib/db/mappers'
import { newId } from '@/lib/ids'
import { callout, formatDate, kes, keyValues, paragraph, renderPdf, section, table, title, type PdfFrame } from '@/lib/pdf/document'
import { getReport } from '@/services/agency/workspace'
import { getOrganization, getUser } from '@/services/users'
import { CLAIM_STAGES, JOURNEY_STAGES, type Claim, type Client, type Organization, type Policy, type QuoteRequest } from '@/types/platform'

/**
 * Generated documents. Each call registers a numbered document row (so the
 * number on the PDF is stable and auditable) and renders the PDF on the
 * server. Access is decided by the API route; this module only checks that
 * the subject belongs to the organisation.
 */

export type DocumentType = 'registration' | 'client-summary' | 'claim' | 'quote' | 'agency-report'

const PREFIX: Record<DocumentType, string> = { registration: 'REG', 'client-summary': 'SUM', claim: 'CLM', quote: 'QTE', 'agency-report': 'RPT' }

async function registerDocument(input: { organizationId: string; clientId: string | null; userId: string | null; type: DocumentType; title: string; subjectId: string | null }): Promise<string> {
  await ensureSchema()
  const sql = getSql()
  // Re-use the number for the same subject so a re-download does not mint a new one.
  if (input.subjectId) {
    const existing = await sql`SELECT number FROM documents WHERE organization_id = ${input.organizationId} AND type = ${input.type} AND subject_id = ${input.subjectId} ORDER BY created_at DESC LIMIT 1`
    if (existing[0]) return String(existing[0].number)
  }
  const count = await sql`SELECT count(*) AS n FROM documents WHERE type = ${input.type}`
  const number = `${PREFIX[input.type]}-${new Date().getFullYear()}-${String(Number(count[0]?.n ?? 0) + 1).padStart(5, '0')}`
  await sql`INSERT INTO documents (id, organization_id, client_id, user_id, type, number, title, subject_id)
    VALUES (${newId('doc')}, ${input.organizationId}, ${input.clientId}, ${input.userId}, ${input.type}, ${number}, ${input.title}, ${input.subjectId})`
  return number
}

async function loadClient(organizationId: string, clientId: string): Promise<{ client: Client; policies: Policy[]; quotes: QuoteRequest[]; claims: Claim[] } | null> {
  const sql = getSql()
  const rows = await sql`SELECT * FROM clients WHERE id = ${clientId} AND organization_id = ${organizationId} LIMIT 1`
  if (!rows[0]) return null
  const [policyRows, quoteRows, subRows, claimRows] = await Promise.all([
    sql`SELECT * FROM policies WHERE client_id = ${clientId} ORDER BY expiry_date ASC`,
    sql`SELECT * FROM quote_requests WHERE client_id = ${clientId} ORDER BY created_at DESC`,
    sql`SELECT s.* FROM quote_submissions s JOIN quote_requests q ON q.id = s.quote_request_id WHERE q.client_id = ${clientId}`,
    sql`SELECT * FROM claims WHERE client_id = ${clientId} ORDER BY notified_at DESC`,
  ])
  const subs = subRows.map(toSubmission)
  return {
    client: toClient(rows[0]),
    policies: policyRows.map(toPolicy),
    quotes: quoteRows.map((r) => toQuoteRequest(r, subRows.filter((s) => s.quote_request_id === r.id).map((s) => subs.find((x) => x.id === String(s.id))!).filter(Boolean))),
    claims: claimRows.map(toClaim),
  }
}

export interface GeneratedPdf {
  buffer: Buffer
  filename: string
  number: string
}

const stageLabel = (id: string) => JOURNEY_STAGES.find((s) => s.id === id)?.label ?? id
const claimStage = (id: string) => CLAIM_STAGES.find((s) => s.id === id)?.label ?? id

export async function registrationPdf(organizationId: string, clientId: string, actorUserId: string | null): Promise<GeneratedPdf | null> {
  const org = await getOrganization(organizationId)
  const data = await loadClient(organizationId, clientId)
  if (!org || !data) return null
  const user = data.client.userId ? await getUser(data.client.userId) : null
  const number = await registerDocument({ organizationId, clientId, userId: actorUserId, type: 'registration', title: `Registration confirmation · ${data.client.name}`, subjectId: clientId })
  const frame: PdfFrame = { organization: org, title: 'Registration confirmation', number }
  const buffer = await renderPdf(frame, (doc) => {
    title(doc, 'Registration confirmation', `${data.client.name} is registered with ${org.name}.`)
    keyValues(doc, [
      ['Client', data.client.name],
      ['Type', data.client.type === 'sme' ? 'Business (SME)' : data.client.type === 'corporate' ? 'Organisation' : 'Individual'],
      ['Account holder', user?.name ?? '—'],
      ['Email', user?.email ?? data.client.email ?? '—'],
      ['WhatsApp', data.client.phone ? `+${data.client.phone}` : '—'],
      ['Registered on', formatDate(data.client.createdAt)],
      ['Current stage', `${JOURNEY_STAGES.findIndex((s) => s.id === data.client.stage) + 1} of 6 · ${stageLabel(data.client.stage)}`],
      ['Adviser', data.client.adviserName ?? 'To be assigned'],
    ])
    if (data.client.notes) {
      section(doc, 'What you asked us to protect')
      paragraph(doc, data.client.notes)
    }
    section(doc, 'What happens next')
    paragraph(doc, `1. Your adviser contacts you within one working day to book a short risk conversation.\n2. We design a programme around your exposures and approach our insurer panel on identical terms.\n3. You receive a written proposal to accept, question or decline.\n4. Once placed, every renewal, endorsement and claim is tracked here and on WhatsApp.`)
    callout(doc, `Manage everything from WhatsApp: message ${org.whatsapp ? `+${org.whatsapp}` : 'Super Agent'} from ${data.client.phone ? `+${data.client.phone}` : 'your registered number'} and reply MENU.`)
  })
  return { buffer, filename: `${number}-registration.pdf`, number }
}

export async function clientSummaryPdf(organizationId: string, clientId: string, actorUserId: string | null): Promise<GeneratedPdf | null> {
  const org = await getOrganization(organizationId)
  const data = await loadClient(organizationId, clientId)
  if (!org || !data) return null
  const number = await registerDocument({ organizationId, clientId, userId: actorUserId, type: 'client-summary', title: `Cover summary · ${data.client.name}`, subjectId: null })
  const frame: PdfFrame = { organization: org, title: 'Cover summary', number }
  const live = data.policies.filter((p) => p.status !== 'cancelled')
  const buffer = await renderPdf(frame, (doc) => {
    title(doc, 'Cover summary', `${data.client.name} · prepared ${formatDate(new Date())}`)
    keyValues(doc, [
      ['Journey stage', `${JOURNEY_STAGES.findIndex((s) => s.id === data.client.stage) + 1} of 6 · ${stageLabel(data.client.stage)}`],
      ['Adviser', data.client.adviserName ?? '—'],
      ['Policies in force', String(live.filter((p) => p.status === 'live' || p.status === 'renewal-due').length)],
      ['Annual premium', kes(live.reduce((s, p) => s + (p.status === 'cancelled' ? 0 : p.premium), 0))],
    ])
    section(doc, 'Policies')
    table(
      doc,
      [
        { label: 'Cover', width: 130 },
        { label: 'Insurer', width: 110 },
        { label: 'Policy no.', width: 95 },
        { label: 'Expires', width: 80 },
        { label: 'Premium', width: 84, align: 'right' },
      ],
      live.map((p) => [p.product, p.insurer, p.policyNumber, formatDate(p.expiryDate), kes(p.premium)]),
    )
    const exclusions = live.filter((p) => p.keyExclusions)
    if (exclusions.length) {
      section(doc, 'Key exclusions to remember')
      for (const p of exclusions) paragraph(doc, `${p.product} (${p.insurer}): ${p.keyExclusions}`)
    }
    section(doc, 'Quotes in progress')
    table(
      doc,
      [
        { label: 'Reference', width: 110 },
        { label: 'Cover', width: 150 },
        { label: 'Stage', width: 110 },
        { label: 'Insurers replied', width: 129, align: 'right' },
      ],
      data.quotes.filter((q) => q.stage !== 'placed' && q.stage !== 'declined').map((q) => [q.reference, q.product, q.stage, `${q.submissions.filter((s) => s.status === 'received' || s.status === 'ready').length} of ${q.submissions.length}`]),
    )
    section(doc, 'Claims')
    table(
      doc,
      [
        { label: 'Reference', width: 110 },
        { label: 'Cover', width: 150 },
        { label: 'Stage', width: 110 },
        { label: 'Amount', width: 129, align: 'right' },
      ],
      data.claims.map((c) => [c.reference, `${c.product} · ${c.insurer}`, claimStage(c.stage), kes(c.amount)]),
    )
  })
  return { buffer, filename: `${number}-cover-summary.pdf`, number }
}

export async function claimPdf(organizationId: string, claimId: string, actorUserId: string | null): Promise<GeneratedPdf | null> {
  const sql = getSql()
  const rows = await sql`SELECT * FROM claims WHERE id = ${claimId} AND organization_id = ${organizationId} LIMIT 1`
  if (!rows[0]) return null
  const claim = toClaim(rows[0])
  const org = await getOrganization(organizationId)
  const data = await loadClient(organizationId, claim.clientId)
  if (!org || !data) return null
  const policy = data.policies.find((p) => p.id === claim.policyId) ?? null
  const number = await registerDocument({ organizationId, clientId: claim.clientId, userId: actorUserId, type: 'claim', title: `Claim confirmation · ${claim.reference}`, subjectId: claimId })
  const frame: PdfFrame = { organization: org, title: 'Claim confirmation', number }
  const buffer = await renderPdf(frame, (doc) => {
    title(doc, 'Claim confirmation', `${claim.reference} · ${data.client.name}`)
    keyValues(doc, [
      ['Client', data.client.name],
      ['Cover', `${claim.product} · ${claim.insurer}`],
      ['Policy number', policy?.policyNumber ?? '—'],
      ['Reported on', formatDate(claim.notifiedAt)],
      ['Incident date', claim.incidentDate ? formatDate(claim.incidentDate) : 'Not stated'],
      ['Reported via', claim.channel === 'whatsapp' ? 'WhatsApp' : claim.channel === 'agency' ? 'Adviser' : 'Client portal'],
      ['Current stage', claimStage(claim.stage)],
      ['Amount', kes(claim.amount)],
      ['Next update due', claim.nextUpdateDue ? formatDate(claim.nextUpdateDue) : '—'],
    ])
    section(doc, 'What happened')
    paragraph(doc, claim.description ?? '—')
    section(doc, 'Our commitment')
    paragraph(doc, `We register this claim with ${claim.insurer} within 24 hours of notification and update you at least weekly until it is settled, even when nothing has changed. Keep photos, receipts, valuations and any police or assessor reports; we will tell you exactly which documents the insurer needs.`)
    callout(doc, `Check progress any time: reply 4 on WhatsApp or open your portal. Questions: ${org.phone || org.email}.`)
  })
  return { buffer, filename: `${claim.reference}-claim-confirmation.pdf`, number }
}

export async function quotePdf(organizationId: string, quoteId: string, actorUserId: string | null): Promise<GeneratedPdf | null> {
  const sql = getSql()
  const rows = await sql`SELECT * FROM quote_requests WHERE id = ${quoteId} AND organization_id = ${organizationId} LIMIT 1`
  if (!rows[0]) return null
  const subs = await sql`SELECT * FROM quote_submissions WHERE quote_request_id = ${quoteId} ORDER BY sent_at ASC`
  const quote = toQuoteRequest(rows[0], subs.map(toSubmission))
  const org = await getOrganization(organizationId)
  const data = await loadClient(organizationId, quote.clientId)
  if (!org || !data) return null
  const number = await registerDocument({ organizationId, clientId: quote.clientId, userId: actorUserId, type: 'quote', title: `Quote request · ${quote.reference}`, subjectId: quoteId })
  const frame: PdfFrame = { organization: org, title: 'Quote request confirmation', number }
  const buffer = await renderPdf(frame, (doc) => {
    title(doc, 'Quote request confirmation', `${quote.reference} · ${data.client.name}`)
    keyValues(doc, [
      ['Client', data.client.name],
      ['Cover requested', quote.product],
      ['Requested on', formatDate(quote.createdAt)],
      ['Stage', quote.stage],
      ['Indicative premium', kes(quote.premiumEstimate)],
    ])
    if (quote.notes) {
      section(doc, 'Details provided')
      paragraph(doc, quote.notes)
    }
    section(doc, 'Insurer panel')
    table(
      doc,
      [
        { label: 'Insurer', width: 180 },
        { label: 'Sent', width: 110 },
        { label: 'Status', width: 110 },
        { label: 'Premium', width: 99, align: 'right' },
      ],
      quote.submissions.map((s) => [s.insurer, formatDate(s.sentAt), s.status, kes(s.premium)]),
    )
    callout(doc, 'Every insurer is approached on identical terms so the comparison is fair. We recommend on cover, exclusions and claims record, never on price alone.')
  })
  return { buffer, filename: `${quote.reference}-quote-request.pdf`, number }
}

export async function agencyReportPdf(organizationId: string, actorUserId: string | null): Promise<GeneratedPdf | null> {
  const org = await getOrganization(organizationId)
  if (!org) return null
  const report = await getReport(organizationId)
  const number = await registerDocument({ organizationId, clientId: null, userId: actorUserId, type: 'agency-report', title: `Agency report · ${formatDate(new Date())}`, subjectId: null })
  const frame: PdfFrame = { organization: org, title: 'Agency report', number }
  const buffer = await renderPdf(frame, (doc) => {
    title(doc, 'Agency report', `${org.name} · ${formatDate(new Date())}`)
    keyValues(doc, [
      ['Premium in force', kes(report.premiumInForce)],
      ['Policies in force', String(report.policiesInForce)],
      ['Clients', `${report.clients} (${report.newClients30d} new in the last 30 days)`],
      ['Quote conversion (90 days)', report.conversion == null ? '—' : `${report.conversion}% (${report.quotesWon90d} of ${report.quotesRequested90d})`],
      ['Renewals due (90 days)', `${report.renewalsDue90d} · ${kes(report.renewalPremium90d)}`],
      ['Claims', `${report.openClaims} open · ${report.settledClaims90d} settled in 90 days`],
      ['WhatsApp', `${report.conversations} conversations · ${report.consultations30d} questions answered in 30 days`],
    ])
    section(doc, 'Premium by product')
    table(doc, [{ label: 'Product', width: 300 }, { label: 'Policies', width: 100, align: 'right' }, { label: 'Premium', width: 99, align: 'right' }], report.byProduct.map((r) => [r.label, String(r.count), kes(r.premium)]))
    section(doc, 'Premium by insurer')
    table(doc, [{ label: 'Insurer', width: 300 }, { label: 'Policies', width: 100, align: 'right' }, { label: 'Premium', width: 99, align: 'right' }], report.byInsurer.map((r) => [r.label, String(r.count), kes(r.premium)]))
    section(doc, 'Clients by journey stage')
    table(doc, [{ label: 'Stage', width: 399 }, { label: 'Clients', width: 100, align: 'right' }], report.byStage.map((r) => [r.label, String(r.count)]))
  })
  return { buffer, filename: `${number}-agency-report.pdf`, number }
}

export function organizationName(org: Organization): string {
  return org.name
}

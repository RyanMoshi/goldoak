import { randomBytes } from 'crypto'
import { getSql } from '@/lib/db/client'
import { ensureSchema } from '@/lib/db/migrate'
import { newId } from '@/lib/ids'
import { audit } from '@/services/audit'
import type { AgencySettings, BillingDocument, BillingKind, BillingLine, BillingListRow, BillingStatus } from '@/types/billing'
import type { Organization } from '@/types/platform'

/**
 * Quotes and invoices.
 *
 * One table holds both: `kind` decides the wording, the numbering series and
 * the status vocabulary. Every read and write is scoped by `organizationId`
 * taken from the session — a document is never fetched by id alone.
 *
 * Money: each line is quantity x unit price, less its discount, plus its tax.
 * Totals are recomputed from the lines on every save, so the header can never
 * drift from what is printed.
 */

const num = (v: unknown): number => {
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : 0
}

export function defaultsFor(org: Organization | null): Required<Pick<AgencySettings, 'currency' | 'taxLabel' | 'taxPercent' | 'quotePrefix' | 'invoicePrefix' | 'quoteValidDays' | 'invoiceDueDays'>> & AgencySettings {
  const s = org?.settings ?? {}
  return {
    currency: s.currency || 'KES',
    taxLabel: s.taxLabel || 'VAT',
    taxPercent: typeof s.taxPercent === 'number' ? s.taxPercent : 0,
    quotePrefix: s.quotePrefix || 'QT',
    invoicePrefix: s.invoicePrefix || 'INV',
    quoteValidDays: typeof s.quoteValidDays === 'number' ? s.quoteValidDays : 30,
    invoiceDueDays: typeof s.invoiceDueDays === 'number' ? s.invoiceDueDays : 14,
    quoteTerms: s.quoteTerms,
    invoiceTerms: s.invoiceTerms,
    paymentInstructions: s.paymentInstructions,
  }
}

/** Next number in the agency's series for this year, e.g. QT-2026-0007. */
export async function nextNumber(organizationId: string, kind: BillingKind, org: Organization | null): Promise<string> {
  const sql = getSql()
  const period = String(new Date().getFullYear())
  const prefix = kind === 'quote' ? defaultsFor(org).quotePrefix : defaultsFor(org).invoicePrefix
  const rows = await sql`INSERT INTO number_sequences (organization_id, kind, period, next_number)
    VALUES (${organizationId}, ${kind}, ${period}, 2)
    ON CONFLICT (organization_id, kind, period) DO UPDATE SET next_number = number_sequences.next_number + 1
    RETURNING next_number`
  const next = Number(rows[0]?.next_number ?? 2) - 1
  return `${prefix}-${period}-${String(next).padStart(4, '0')}`
}

export interface LineInput {
  description: string
  detail?: string | null
  quantity: number
  unitPrice: number
  discountPercent?: number
  taxPercent?: number
}

export interface SaveInput {
  organizationId: string
  actor: { id: string; name: string }
  kind: BillingKind
  clientId?: string | null
  customerName: string
  customerEmail?: string | null
  customerPhone?: string | null
  customerAddress?: string | null
  issueDate?: string
  dueDate?: string | null
  currency?: string
  notes?: string | null
  terms?: string | null
  paymentInstructions?: string | null
  reference?: string | null
  lines: LineInput[]
}

function lineAmount(l: LineInput): { net: number; tax: number; discount: number; gross: number } {
  const base = num(l.quantity) * num(l.unitPrice)
  const discount = (base * num(l.discountPercent)) / 100
  const net = Math.max(0, base - discount)
  const tax = (net * num(l.taxPercent)) / 100
  return { net, tax, discount, gross: net + tax }
}

function totalsOf(lines: LineInput[]) {
  let subtotal = 0
  let discountTotal = 0
  let taxTotal = 0
  for (const l of lines) {
    const a = lineAmount(l)
    subtotal += a.net
    discountTotal += a.discount
    taxTotal += a.tax
  }
  const round = (n: number) => Math.round(n * 100) / 100
  return { subtotal: round(subtotal), discountTotal: round(discountTotal), taxTotal: round(taxTotal), total: round(subtotal + taxTotal) }
}

async function writeLines(documentId: string, lines: LineInput[]): Promise<void> {
  const sql = getSql()
  await sql`DELETE FROM billing_lines WHERE document_id = ${documentId}`
  let position = 0
  for (const l of lines) {
    const a = lineAmount(l)
    await sql`INSERT INTO billing_lines (id, document_id, position, description, detail, quantity, unit_price, discount_percent, tax_percent, amount)
      VALUES (${newId('bl')}, ${documentId}, ${position}, ${l.description.slice(0, 300)}, ${l.detail?.slice(0, 600) ?? null}, ${num(l.quantity)}, ${num(l.unitPrice)}, ${num(l.discountPercent)}, ${num(l.taxPercent)}, ${Math.round(a.gross * 100) / 100})`
    position++
  }
}

export async function createDocument(input: SaveInput, org: Organization | null): Promise<BillingDocument> {
  await ensureSchema()
  const sql = getSql()
  const d = defaultsFor(org)
  const lines = input.lines.filter((l) => l.description.trim())
  if (!lines.length) throw new Error('Add at least one line.')
  const t = totalsOf(lines)
  const id = newId('bil')
  const number = await nextNumber(input.organizationId, input.kind, org)
  const issue = input.issueDate || new Date().toISOString().slice(0, 10)
  const due = input.dueDate || defaultDue(issue, input.kind, d)
  await sql`INSERT INTO billing_documents (id, organization_id, client_id, kind, number, status, customer_name, customer_email, customer_phone, customer_address,
      issue_date, due_date, currency, subtotal, discount_total, tax_total, total, notes, terms, payment_instructions, reference, created_by)
    VALUES (${id}, ${input.organizationId}, ${input.clientId ?? null}, ${input.kind}, ${number}, 'draft', ${input.customerName}, ${input.customerEmail ?? null}, ${input.customerPhone ?? null}, ${input.customerAddress ?? null},
      ${issue}, ${due}, ${input.currency || d.currency}, ${t.subtotal}, ${t.discountTotal}, ${t.taxTotal}, ${t.total},
      ${input.notes ?? null}, ${input.terms ?? (input.kind === 'quote' ? d.quoteTerms ?? null : d.invoiceTerms ?? null)}, ${input.paymentInstructions ?? d.paymentInstructions ?? null}, ${input.reference ?? null}, ${input.actor.id})`
  await writeLines(id, lines)
  await audit({ organizationId: input.organizationId, actorUserId: input.actor.id, action: `${input.kind}.created`, target: id, detail: { number, total: t.total } })
  const doc = await getDocument(input.organizationId, id)
  if (!doc) throw new Error('Document was not created')
  return doc
}

function defaultDue(issue: string, kind: BillingKind, d: AgencySettings): string {
  const days = kind === 'quote' ? d.quoteValidDays ?? 30 : d.invoiceDueDays ?? 14
  const date = new Date(`${issue}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

export async function updateDocument(organizationId: string, id: string, input: Omit<SaveInput, 'organizationId' | 'kind'>): Promise<BillingDocument | null> {
  const sql = getSql()
  const existing = await getDocument(organizationId, id)
  if (!existing) return null
  if (existing.status === 'paid' || existing.status === 'cancelled') throw new Error('This document can no longer be edited.')
  const lines = input.lines.filter((l) => l.description.trim())
  if (!lines.length) throw new Error('Add at least one line.')
  const t = totalsOf(lines)
  await sql`UPDATE billing_documents SET client_id = ${input.clientId ?? null}, customer_name = ${input.customerName}, customer_email = ${input.customerEmail ?? null},
      customer_phone = ${input.customerPhone ?? null}, customer_address = ${input.customerAddress ?? null}, issue_date = ${input.issueDate || existing.issueDate},
      due_date = ${input.dueDate ?? existing.dueDate}, currency = ${input.currency || existing.currency}, subtotal = ${t.subtotal}, discount_total = ${t.discountTotal},
      tax_total = ${t.taxTotal}, total = ${t.total}, notes = ${input.notes ?? null}, terms = ${input.terms ?? null}, payment_instructions = ${input.paymentInstructions ?? null},
      reference = ${input.reference ?? null}, updated_at = now()
    WHERE id = ${id} AND organization_id = ${organizationId}`
  await writeLines(id, lines)
  await audit({ organizationId, actorUserId: input.actor.id, action: `${existing.kind}.updated`, target: id, detail: { number: existing.number, total: t.total } })
  return getDocument(organizationId, id)
}

export async function getDocument(organizationId: string, id: string): Promise<BillingDocument | null> {
  await ensureSchema()
  const sql = getSql()
  const rows = await sql`SELECT d.*, u.name AS created_by_name FROM billing_documents d LEFT JOIN users u ON u.id = d.created_by
    WHERE d.id = ${id} AND d.organization_id = ${organizationId} LIMIT 1`
  if (!rows[0]) return null
  const lines = await sql`SELECT * FROM billing_lines WHERE document_id = ${id} ORDER BY position ASC`
  return toDocument(rows[0], lines)
}

/** For the public share link: the token is the only credential, so no org scope. */
export async function getSharedDocument(token: string): Promise<{ document: BillingDocument; organizationId: string } | null> {
  await ensureSchema()
  const sql = getSql()
  const rows = await sql`SELECT d.*, u.name AS created_by_name FROM billing_documents d LEFT JOIN users u ON u.id = d.created_by WHERE d.share_token = ${token} LIMIT 1`
  if (!rows[0]) return null
  const lines = await sql`SELECT * FROM billing_lines WHERE document_id = ${String(rows[0].id)} ORDER BY position ASC`
  return { document: toDocument(rows[0], lines), organizationId: String(rows[0].organization_id) }
}

export async function ensureShareToken(organizationId: string, id: string): Promise<string | null> {
  const sql = getSql()
  const doc = await getDocument(organizationId, id)
  if (!doc) return null
  if (doc.shareToken) return doc.shareToken
  const token = randomBytes(18).toString('base64url')
  await sql`UPDATE billing_documents SET share_token = ${token} WHERE id = ${id} AND organization_id = ${organizationId}`
  return token
}

export async function listDocuments(organizationId: string, kind: BillingKind, limit = 100): Promise<BillingListRow[]> {
  await ensureSchema()
  const sql = getSql()
  const rows = await sql`SELECT id, kind, number, status, customer_name, client_id, total, amount_paid, currency, issue_date, due_date, sent_at, created_at
    FROM billing_documents WHERE organization_id = ${organizationId} AND kind = ${kind} ORDER BY created_at DESC LIMIT ${limit}`
  return rows.map((r) => ({
    id: String(r.id),
    kind: r.kind as BillingKind,
    number: String(r.number),
    status: r.status as BillingStatus,
    customerName: String(r.customer_name),
    clientId: r.client_id ? String(r.client_id) : null,
    total: num(r.total),
    amountPaid: num(r.amount_paid),
    currency: String(r.currency),
    issueDate: String(r.issue_date).slice(0, 10),
    dueDate: r.due_date ? String(r.due_date).slice(0, 10) : null,
    sentAt: r.sent_at ? new Date(r.sent_at as string).toISOString() : null,
    createdAt: new Date(r.created_at as string).toISOString(),
  }))
}

export async function listForClient(organizationId: string, clientId: string): Promise<BillingListRow[]> {
  const sql = getSql()
  const rows = await sql`SELECT id, kind, number, status, customer_name, client_id, total, amount_paid, currency, issue_date, due_date, sent_at, created_at
    FROM billing_documents WHERE organization_id = ${organizationId} AND client_id = ${clientId} ORDER BY created_at DESC LIMIT 50`
  return rows.map((r) => ({
    id: String(r.id),
    kind: r.kind as BillingKind,
    number: String(r.number),
    status: r.status as BillingStatus,
    customerName: String(r.customer_name),
    clientId: r.client_id ? String(r.client_id) : null,
    total: num(r.total),
    amountPaid: num(r.amount_paid),
    currency: String(r.currency),
    issueDate: String(r.issue_date).slice(0, 10),
    dueDate: r.due_date ? String(r.due_date).slice(0, 10) : null,
    sentAt: r.sent_at ? new Date(r.sent_at as string).toISOString() : null,
    createdAt: new Date(r.created_at as string).toISOString(),
  }))
}

export interface BillingStats {
  quotesOpen: number
  quotesAccepted: number
  invoicesOutstanding: number
  outstandingAmount: number
  paidThisMonth: number
  currency: string
}

export async function billingStats(organizationId: string, org: Organization | null): Promise<BillingStats> {
  await ensureSchema()
  const sql = getSql()
  const rows = await sql`SELECT
      count(*) FILTER (WHERE kind = 'quote' AND status IN ('draft','sent')) AS quotes_open,
      count(*) FILTER (WHERE kind = 'quote' AND status = 'accepted') AS quotes_accepted,
      count(*) FILTER (WHERE kind = 'invoice' AND status IN ('sent','part_paid','overdue')) AS invoices_outstanding,
      coalesce(sum(total - amount_paid) FILTER (WHERE kind = 'invoice' AND status IN ('sent','part_paid','overdue')), 0) AS outstanding_amount,
      coalesce(sum(amount_paid) FILTER (WHERE kind = 'invoice' AND paid_at > date_trunc('month', now())), 0) AS paid_month
    FROM billing_documents WHERE organization_id = ${organizationId}`
  const r = rows[0] ?? {}
  return {
    quotesOpen: Number(r.quotes_open ?? 0),
    quotesAccepted: Number(r.quotes_accepted ?? 0),
    invoicesOutstanding: Number(r.invoices_outstanding ?? 0),
    outstandingAmount: num(r.outstanding_amount),
    paidThisMonth: num(r.paid_month),
    currency: defaultsFor(org).currency,
  }
}

export async function setStatus(organizationId: string, id: string, status: BillingStatus, actor: { id: string; name: string }): Promise<BillingDocument | null> {
  const sql = getSql()
  const doc = await getDocument(organizationId, id)
  if (!doc) return null
  const stamps = {
    sent: status === 'sent' ? 'now()' : null,
    paid: status === 'paid' ? 'now()' : null,
  }
  await sql`UPDATE billing_documents SET status = ${status},
      sent_at = CASE WHEN ${stamps.sent === null} THEN sent_at ELSE now() END,
      paid_at = CASE WHEN ${status} = 'paid' THEN now() ELSE paid_at END,
      amount_paid = CASE WHEN ${status} = 'paid' THEN total ELSE amount_paid END,
      decided_at = CASE WHEN ${status} IN ('accepted','rejected') THEN now() ELSE decided_at END,
      updated_at = now()
    WHERE id = ${id} AND organization_id = ${organizationId}`
  await audit({ organizationId, actorUserId: actor.id, action: `${doc.kind}.status`, target: id, detail: { number: doc.number, status } })
  return getDocument(organizationId, id)
}

export async function recordPayment(organizationId: string, id: string, amount: number, actor: { id: string; name: string }): Promise<BillingDocument | null> {
  const sql = getSql()
  const doc = await getDocument(organizationId, id)
  if (!doc || doc.kind !== 'invoice') return null
  const paid = Math.min(doc.total, Math.max(0, doc.amountPaid + amount))
  const status: BillingStatus = paid >= doc.total - 0.005 ? 'paid' : paid > 0 ? 'part_paid' : doc.status
  await sql`UPDATE billing_documents SET amount_paid = ${paid}, status = ${status}, paid_at = CASE WHEN ${status} = 'paid' THEN now() ELSE paid_at END, updated_at = now()
    WHERE id = ${id} AND organization_id = ${organizationId}`
  await audit({ organizationId, actorUserId: actor.id, action: 'invoice.payment', target: id, detail: { number: doc.number, amount, paid } })
  return getDocument(organizationId, id)
}

export async function markSent(organizationId: string, id: string): Promise<void> {
  const sql = getSql()
  await sql`UPDATE billing_documents SET status = CASE WHEN status = 'draft' THEN 'sent' ELSE status END, sent_at = coalesce(sent_at, now()), updated_at = now()
    WHERE id = ${id} AND organization_id = ${organizationId}`
}

export async function deleteDraft(organizationId: string, id: string, actor: { id: string; name: string }): Promise<boolean> {
  const sql = getSql()
  const rows = await sql`DELETE FROM billing_documents WHERE id = ${id} AND organization_id = ${organizationId} AND status = 'draft' RETURNING number, kind`
  if (!rows[0]) return false
  await audit({ organizationId, actorUserId: actor.id, action: `${String(rows[0].kind)}.deleted`, target: id, detail: { number: String(rows[0].number) } })
  return true
}

/** Marks overdue invoices and expired quotes. Called by the daily automation. */
export async function refreshOverdue(): Promise<{ overdue: number; expired: number }> {
  const sql = getSql()
  const a = await sql`UPDATE billing_documents SET status = 'overdue', updated_at = now()
    WHERE kind = 'invoice' AND status IN ('sent','part_paid') AND due_date < current_date RETURNING id`
  const b = await sql`UPDATE billing_documents SET status = 'expired', updated_at = now()
    WHERE kind = 'quote' AND status = 'sent' AND due_date < current_date RETURNING id`
  return { overdue: a.length, expired: b.length }
}

function toDocument(r: Record<string, unknown>, lineRows: Record<string, unknown>[]): BillingDocument {
  const lines: BillingLine[] = lineRows.map((l) => ({
    id: String(l.id),
    position: Number(l.position ?? 0),
    description: String(l.description),
    detail: l.detail ? String(l.detail) : null,
    quantity: num(l.quantity),
    unitPrice: num(l.unit_price),
    discountPercent: num(l.discount_percent),
    taxPercent: num(l.tax_percent),
    amount: num(l.amount),
  }))
  return {
    id: String(r.id),
    organizationId: String(r.organization_id),
    clientId: r.client_id ? String(r.client_id) : null,
    kind: r.kind as BillingKind,
    number: String(r.number),
    status: r.status as BillingStatus,
    customerName: String(r.customer_name),
    customerEmail: r.customer_email ? String(r.customer_email) : null,
    customerPhone: r.customer_phone ? String(r.customer_phone) : null,
    customerAddress: r.customer_address ? String(r.customer_address) : null,
    issueDate: String(r.issue_date).slice(0, 10),
    dueDate: r.due_date ? String(r.due_date).slice(0, 10) : null,
    currency: String(r.currency ?? 'KES'),
    subtotal: num(r.subtotal),
    discountTotal: num(r.discount_total),
    taxTotal: num(r.tax_total),
    total: num(r.total),
    amountPaid: num(r.amount_paid),
    notes: r.notes ? String(r.notes) : null,
    terms: r.terms ? String(r.terms) : null,
    paymentInstructions: r.payment_instructions ? String(r.payment_instructions) : null,
    reference: r.reference ? String(r.reference) : null,
    shareToken: r.share_token ? String(r.share_token) : null,
    createdBy: r.created_by ? String(r.created_by) : null,
    createdByName: r.created_by_name ? String(r.created_by_name) : null,
    sentAt: r.sent_at ? new Date(r.sent_at as string).toISOString() : null,
    paidAt: r.paid_at ? new Date(r.paid_at as string).toISOString() : null,
    decidedAt: r.decided_at ? new Date(r.decided_at as string).toISOString() : null,
    createdAt: new Date(r.created_at as string).toISOString(),
    updatedAt: new Date(r.updated_at as string).toISOString(),
    lines,
  }
}

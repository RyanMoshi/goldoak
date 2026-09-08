'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireSession } from '@/lib/auth/server'
import { billingPdf } from '@/services/billing-pdf'
import { createDocument, deleteDraft, ensureShareToken, getDocument, markSent, recordPayment, setStatus, updateDocument, type LineInput } from '@/services/billing'
import { sendDocumentEmail } from '@/services/emails'
import { getOrganization, placeholderOrganization } from '@/services/users'
import { money } from '@/lib/pdf/document'
import type { BillingKind, BillingStatus } from '@/types/billing'

/**
 * Quote and invoice actions. Every one re-reads the session, so a document is
 * only ever created, edited, sent or paid inside the agency the person is
 * signed in to; ids from the browser are always checked against it.
 */

export interface BillingState {
  error?: string
  success?: string
  field?: string
}

const MAX_LINES = 60

/** Line items arrive as parallel arrays from the repeating form rows. */
function readLines(formData: FormData): LineInput[] {
  const descriptions = formData.getAll('line_description').map(String)
  const details = formData.getAll('line_detail').map(String)
  const quantities = formData.getAll('line_quantity').map(String)
  const prices = formData.getAll('line_price').map(String)
  const discounts = formData.getAll('line_discount').map(String)
  const taxes = formData.getAll('line_tax').map(String)
  const lines: LineInput[] = []
  for (let i = 0; i < Math.min(descriptions.length, MAX_LINES); i++) {
    const description = descriptions[i]?.trim()
    if (!description) continue
    lines.push({
      description,
      detail: details[i]?.trim() || null,
      quantity: Number(quantities[i] ?? 1) || 0,
      unitPrice: Number(prices[i] ?? 0) || 0,
      discountPercent: Math.min(100, Math.max(0, Number(discounts[i] ?? 0) || 0)),
      taxPercent: Math.min(100, Math.max(0, Number(taxes[i] ?? 0) || 0)),
    })
  }
  return lines
}

function common(formData: FormData) {
  return {
    clientId: String(formData.get('clientId') ?? '').trim() || null,
    customerName: String(formData.get('customerName') ?? '').trim(),
    customerEmail: String(formData.get('customerEmail') ?? '').trim().toLowerCase() || null,
    customerPhone: String(formData.get('customerPhone') ?? '').trim() || null,
    customerAddress: String(formData.get('customerAddress') ?? '').trim() || null,
    issueDate: String(formData.get('issueDate') ?? '').trim() || undefined,
    dueDate: String(formData.get('dueDate') ?? '').trim() || null,
    notes: String(formData.get('notes') ?? '').trim() || null,
    terms: String(formData.get('terms') ?? '').trim() || null,
    paymentInstructions: String(formData.get('paymentInstructions') ?? '').trim() || null,
    reference: String(formData.get('reference') ?? '').trim() || null,
  }
}

export async function createBillingDocumentAction(formData: FormData): Promise<BillingState> {
  const session = await requireSession('agency')
  const kind: BillingKind = formData.get('kind') === 'invoice' ? 'invoice' : 'quote'
  const fields = common(formData)
  const lines = readLines(formData)
  if (fields.customerName.length < 2) return { error: 'Enter the customer’s name.', field: 'customerName' }
  if (!lines.length) return { error: 'Add at least one line with a description.', field: 'lines' }
  let id: string
  try {
    const org = await getOrganization(session.oid)
    const doc = await createDocument({ organizationId: session.oid, actor: { id: session.uid, name: session.name }, kind, ...fields, lines }, org)
    id = doc.id
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Could not save the document.' }
  }
  revalidatePath('/agency/billing')
  redirect(`/agency/billing/${kind === 'invoice' ? 'invoices' : 'quotes'}/${id}?created=1`)
}

export async function updateBillingDocumentAction(id: string, formData: FormData): Promise<BillingState> {
  const session = await requireSession('agency')
  const fields = common(formData)
  const lines = readLines(formData)
  if (fields.customerName.length < 2) return { error: 'Enter the customer’s name.', field: 'customerName' }
  if (!lines.length) return { error: 'Add at least one line with a description.', field: 'lines' }
  try {
    const updated = await updateDocument(session.oid, id, { actor: { id: session.uid, name: session.name }, ...fields, lines })
    if (!updated) return { error: 'That document does not belong to your agency.' }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Could not save the changes.' }
  }
  revalidatePath(`/agency/billing`)
  return { success: 'Saved.' }
}

export async function setBillingStatusAction(id: string, status: BillingStatus): Promise<BillingState> {
  const session = await requireSession('agency')
  try {
    const doc = await setStatus(session.oid, id, status, { id: session.uid, name: session.name })
    if (!doc) return { error: 'That document does not belong to your agency.' }
    revalidatePath(`/agency/billing`)
    revalidatePath('/agency/billing')
    return { success: `Marked as ${status.replace('_', ' ')}.` }
  } catch {
    return { error: 'Could not update the status.' }
  }
}

export async function recordPaymentAction(id: string, formData: FormData): Promise<BillingState> {
  const session = await requireSession('agency')
  const amount = Number(formData.get('amount') ?? 0)
  if (!Number.isFinite(amount) || amount <= 0) return { error: 'Enter the amount received.', field: 'amount' }
  try {
    const doc = await recordPayment(session.oid, id, amount, { id: session.uid, name: session.name })
    if (!doc) return { error: 'That invoice does not belong to your agency.' }
    revalidatePath(`/agency/billing`)
    return { success: doc.status === 'paid' ? 'Invoice settled in full.' : `Payment recorded. ${money(doc.total - doc.amountPaid, doc.currency)} still outstanding.` }
  } catch {
    return { error: 'Could not record the payment.' }
  }
}

export async function emailBillingDocumentAction(id: string, formData: FormData): Promise<BillingState> {
  const session = await requireSession('agency')
  const to = String(formData.get('to') ?? '').trim().toLowerCase()
  const message = String(formData.get('message') ?? '').trim().slice(0, 600) || null
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return { error: 'Enter a valid email address.', field: 'to' }
  try {
    const doc = await getDocument(session.oid, id)
    if (!doc) return { error: 'That document does not belong to your agency.' }
    const org = (await getOrganization(session.oid)) ?? placeholderOrganization(session.oid)
    const pdf = await billingPdf(doc, org)
    const token = await ensureShareToken(session.oid, id)
    const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://goldoak.vercel.app'
    const isQuote = doc.kind === 'quote'
    const outcome = await sendDocumentEmail({
      key: isQuote ? 'quote-sent' : 'invoice-sent',
      to,
      organizationId: session.oid,
      clientId: doc.clientId,
      relatedId: doc.id,
      vars: {
        first_name: doc.customerName.split(' ')[0],
        agency_name: org.name,
        agent_name: session.name,
        quote_number: doc.number,
        invoice_number: doc.number,
        total: money(doc.total, doc.currency),
        valid_until: doc.dueDate ?? '',
        due_date: doc.dueDate ?? '',
        payment_instructions: doc.paymentInstructions ?? '',
        message: message ?? '',
        document_url: token ? `${site}/d/${token}` : '',
      },
      attachment: { filename: pdf.filename, content: pdf.buffer },
    })
    if (outcome === 'sent') await markSent(session.oid, id)
    revalidatePath(`/agency/billing`)
    if (outcome === 'unconfigured') return { error: 'Email is not configured on this deployment, so nothing was sent.' }
    if (outcome !== 'sent') return { error: 'The email provider refused the message. Try again in a moment.' }
    return { success: `${isQuote ? 'Quotation' : 'Invoice'} ${doc.number} emailed to ${to} with the PDF attached.` }
  } catch (error) {
    console.error('emailBillingDocument failed', error instanceof Error ? error.message : error)
    return { error: 'Could not send the email.' }
  }
}

export async function shareBillingDocumentAction(id: string): Promise<BillingState & { url?: string }> {
  const session = await requireSession('agency')
  const token = await ensureShareToken(session.oid, id)
  if (!token) return { error: 'That document does not belong to your agency.' }
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://goldoak.vercel.app'
  revalidatePath(`/agency/billing`)
  return { success: 'Link ready. Anyone with it can view this document.', url: `${site}/d/${token}` }
}

export async function deleteBillingDocumentAction(id: string): Promise<BillingState> {
  const session = await requireSession('agency')
  const kind = (await getDocument(session.oid, id))?.kind ?? 'quote'
  const ok = await deleteDraft(session.oid, id, { id: session.uid, name: session.name })
  if (!ok) return { error: 'Only a draft can be deleted. Cancel it instead.' }
  revalidatePath('/agency/billing')
  redirect(`/agency/billing/${kind === 'invoice' ? 'invoices' : 'quotes'}?deleted=1`)
}

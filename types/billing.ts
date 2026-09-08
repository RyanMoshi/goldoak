/**
 * Quotes and invoices. Both are the same shape: a numbered document for one
 * customer with priced lines. `kind` decides the wording, the statuses and
 * which dates matter (a quote expires, an invoice falls due).
 */

export type BillingKind = 'quote' | 'invoice'

export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'cancelled'
export type InvoiceStatus = 'draft' | 'sent' | 'part_paid' | 'paid' | 'overdue' | 'cancelled'
export type BillingStatus = QuoteStatus | InvoiceStatus

export interface BillingLine {
  id: string
  position: number
  description: string
  detail: string | null
  quantity: number
  unitPrice: number
  discountPercent: number
  taxPercent: number
  amount: number
}

export interface BillingDocument {
  id: string
  organizationId: string
  clientId: string | null
  kind: BillingKind
  number: string
  status: BillingStatus
  customerName: string
  customerEmail: string | null
  customerPhone: string | null
  customerAddress: string | null
  issueDate: string
  dueDate: string | null
  currency: string
  subtotal: number
  discountTotal: number
  taxTotal: number
  total: number
  amountPaid: number
  notes: string | null
  terms: string | null
  paymentInstructions: string | null
  reference: string | null
  shareToken: string | null
  createdBy: string | null
  createdByName?: string | null
  sentAt: string | null
  paidAt: string | null
  decidedAt: string | null
  createdAt: string
  updatedAt: string
  lines: BillingLine[]
}

export interface BillingListRow {
  id: string
  kind: BillingKind
  number: string
  status: BillingStatus
  customerName: string
  clientId: string | null
  total: number
  amountPaid: number
  currency: string
  issueDate: string
  dueDate: string | null
  sentAt: string | null
  createdAt: string
}

/** Money is stored to two decimals; the UI rounds only when displaying. */
export const BILLING_STATUS_LABEL: Record<string, string> = {
  draft: 'Draft',
  sent: 'Sent',
  accepted: 'Accepted',
  rejected: 'Rejected',
  expired: 'Expired',
  cancelled: 'Cancelled',
  part_paid: 'Part paid',
  paid: 'Paid',
  overdue: 'Overdue',
}

export const QUOTE_STATUSES: QuoteStatus[] = ['draft', 'sent', 'accepted', 'rejected', 'expired', 'cancelled']
export const INVOICE_STATUSES: InvoiceStatus[] = ['draft', 'sent', 'part_paid', 'paid', 'overdue', 'cancelled']

/** Agency defaults kept in `organizations.settings`. */
export interface AgencySettings {
  currency?: string
  taxLabel?: string
  taxPercent?: number
  quotePrefix?: string
  invoicePrefix?: string
  quoteValidDays?: number
  invoiceDueDays?: number
  quoteTerms?: string
  invoiceTerms?: string
  paymentInstructions?: string
}

import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

/**
 * Billing has no single list of its own: quotations and invoices are separate
 * sections. Landing here sends you to quotations rather than a dead end, which
 * is what a bare /agency/billing used to be.
 */
export default function BillingIndexPage() {
  redirect('/agency/billing/quotes')
}

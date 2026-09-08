'use client'

import { Ban, CheckCircle2, Copy, Download, Link2, Mail, Pencil, Trash2, Wallet } from 'lucide-react'
import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/platform/ui/Badge'
import { Card, CardHeader } from '@/components/platform/ui/Card'
import { Field, SubmitButton, TextArea, TextInput } from '@/components/platform/ui/Form'
import { StatusLine } from '@/components/platform/ui/PageHeader'
import { deleteBillingDocumentAction, emailBillingDocumentAction, recordPaymentAction, setBillingStatusAction, shareBillingDocumentAction, type BillingState } from '@/lib/billing/actions'
import { BILLING_STATUS_LABEL, type BillingDocument } from '@/types/billing'

/**
 * What an agency does with a finished document: send it, share it, chase it,
 * settle it. Each action is a server action with its own pending state, and
 * anything irreversible asks first.
 */

const TONE: Record<string, 'neutral' | 'success' | 'gold' | 'error' | 'info'> = {
  draft: 'neutral',
  sent: 'info',
  accepted: 'success',
  paid: 'success',
  part_paid: 'gold',
  rejected: 'error',
  expired: 'error',
  overdue: 'error',
  cancelled: 'neutral',
}

export function BillingDetail({ document: doc, taxLabel }: { document: BillingDocument; taxLabel: string }) {
  const [state, setState] = useState<BillingState & { url?: string }>({})
  const [pending, startTransition] = useTransition()
  const [showEmail, setShowEmail] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const isQuote = doc.kind === 'quote'
  const label = isQuote ? 'quotation' : 'invoice'
  const fmt = (v: number) => `${doc.currency} ${v.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const run = (fn: () => Promise<BillingState & { url?: string }>) => startTransition(async () => setState(await fn()))

  return (
    <div className="space-y-6">
      <Card as="section">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-serif text-[22px] font-semibold text-forest">{doc.number}</h2>
              <Badge tone={TONE[doc.status] ?? 'neutral'} dot>
                {BILLING_STATUS_LABEL[doc.status] ?? doc.status}
              </Badge>
            </div>
            <p className="mt-1 text-[14px] text-ink-muted">
              {isQuote ? 'Quotation for' : 'Invoice to'} <span className="font-semibold text-ink">{doc.customerName}</span>
              {doc.customerEmail ? ` · ${doc.customerEmail}` : ''}
            </p>
          </div>
          <p data-numeric className="shrink-0 font-serif text-[26px] font-bold text-forest">
            {fmt(doc.total)}
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <a
            href={`/api/billing/${doc.id}/pdf`}
            className="inline-flex h-10 items-center gap-2 rounded-control border border-line bg-surface px-3.5 text-[13.5px] font-semibold text-ink hover:border-ink-muted focus-ring"
          >
            <Download className="size-4" aria-hidden="true" /> Download PDF
          </a>
          {doc.customerEmail || !showEmail ? (
            <button
              type="button"
              onClick={() => setShowEmail((v) => !v)}
              className="inline-flex h-10 items-center gap-2 rounded-control bg-forest px-3.5 text-[13.5px] font-semibold text-white hover:bg-forest-700 focus-ring"
            >
              <Mail className="size-4" aria-hidden="true" /> Email to customer
            </button>
          ) : null}
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => shareBillingDocumentAction(doc.id))}
            className="inline-flex h-10 items-center gap-2 rounded-control border border-line bg-surface px-3.5 text-[13.5px] font-semibold text-ink hover:border-ink-muted focus-ring disabled:opacity-60"
          >
            <Link2 className="size-4" aria-hidden="true" /> Share a link
          </button>
          {doc.status === 'draft' ? (
            <Link href={`/agency/billing/${isQuote ? 'quotes' : 'invoices'}/${doc.id}/edit`} className="inline-flex h-10 items-center gap-2 rounded-control border border-line bg-surface px-3.5 text-[13.5px] font-semibold text-ink hover:border-ink-muted focus-ring">
              <Pencil className="size-4" aria-hidden="true" /> Edit
            </Link>
          ) : null}
          {isQuote && (doc.status === 'sent' || doc.status === 'draft') ? (
            <>
              <button
                type="button"
                disabled={pending}
                onClick={() => run(() => setBillingStatusAction(doc.id, 'accepted'))}
                className="inline-flex h-10 items-center gap-2 rounded-control border border-success/30 bg-success/10 px-3.5 text-[13.5px] font-semibold text-success hover:bg-success/15 focus-ring disabled:opacity-60"
              >
                <CheckCircle2 className="size-4" aria-hidden="true" /> Mark accepted
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => run(() => setBillingStatusAction(doc.id, 'rejected'))}
                className="inline-flex h-10 items-center gap-2 rounded-control border border-line bg-surface px-3.5 text-[13.5px] font-semibold text-ink-muted hover:border-ink-muted hover:text-ink focus-ring disabled:opacity-60"
              >
                <Ban className="size-4" aria-hidden="true" /> Declined
              </button>
            </>
          ) : null}
          {!isQuote && doc.status !== 'paid' && doc.status !== 'cancelled' ? (
            <button
              type="button"
              onClick={() => setShowPayment((v) => !v)}
              className="inline-flex h-10 items-center gap-2 rounded-control border border-success/30 bg-success/10 px-3.5 text-[13.5px] font-semibold text-success hover:bg-success/15 focus-ring"
            >
              <Wallet className="size-4" aria-hidden="true" /> Record a payment
            </button>
          ) : null}
          {doc.status === 'draft' ? (
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                if (window.confirm(`Delete draft ${doc.number}? This cannot be undone.`)) run(() => deleteBillingDocumentAction(doc.id))
              }}
              className="inline-flex h-10 items-center gap-2 rounded-control px-3.5 text-[13.5px] font-semibold text-ink-faint hover:bg-error/10 hover:text-error focus-ring disabled:opacity-60"
            >
              <Trash2 className="size-4" aria-hidden="true" /> Delete draft
            </button>
          ) : null}
        </div>

        {showEmail ? (
          <form
            action={(fd) => startTransition(async () => setState(await emailBillingDocumentAction(doc.id, fd)))}
            className="mt-4 space-y-3 rounded-card border border-line bg-surface-3 p-4"
          >
            <TextInput label="Send to" name="to" type="email" required defaultValue={doc.customerEmail ?? ''} placeholder="customer@example.com" hint="The PDF is attached and the document is marked as sent." />
            <TextArea label="Add a short note" name="message" rows={2} placeholder="As discussed this morning — happy to talk it through." optional />
            <SubmitButton pending={pending} pendingLabel="Sending…">
              Send {label}
            </SubmitButton>
          </form>
        ) : null}

        {showPayment ? (
          <form action={(fd) => startTransition(async () => setState(await recordPaymentAction(doc.id, fd)))} className="mt-4 space-y-3 rounded-card border border-line bg-surface-3 p-4">
            <TextInput
              label="Amount received"
              name="amount"
              inputMode="decimal"
              required
              defaultValue={String(Math.max(0, doc.total - doc.amountPaid))}
              hint={`Outstanding: ${fmt(Math.max(0, doc.total - doc.amountPaid))}`}
              error={state.field === 'amount' ? state.error : undefined}
            />
            <SubmitButton pending={pending} pendingLabel="Recording…">
              Record payment
            </SubmitButton>
          </form>
        ) : null}

        <StatusLine success={state.success} error={!state.field ? state.error : undefined} onDismiss={() => setState({})} />
        {state.url ? (
          <div className="mt-3 flex items-center gap-2 rounded-control border border-line bg-surface-3 px-3 py-2">
            <code className="min-w-0 flex-1 truncate font-mono text-[12px] text-ink">{state.url}</code>
            <button
              type="button"
              onClick={() => navigator.clipboard?.writeText(state.url!)}
              className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-control border border-line bg-surface px-2.5 text-[12.5px] font-semibold text-ink hover:border-ink-muted focus-ring"
            >
              <Copy className="size-3.5" aria-hidden="true" /> Copy
            </button>
          </div>
        ) : null}
      </Card>

      <Card as="section" flush>
        <div className="p-5 pb-3">
          <CardHeader title="Lines" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-[13.5px]">
            <thead>
              <tr className="border-y border-line bg-surface-3 text-left">
                <th className="px-5 py-2.5 font-semibold text-ink-muted">Description</th>
                <th className="px-3 py-2.5 text-right font-semibold text-ink-muted">Qty</th>
                <th className="px-3 py-2.5 text-right font-semibold text-ink-muted">Unit</th>
                <th className="px-5 py-2.5 text-right font-semibold text-ink-muted">Amount</th>
              </tr>
            </thead>
            <tbody>
              {doc.lines.map((l) => (
                <tr key={l.id} className="border-b border-divider last:border-b-0">
                  <td className="px-5 py-3">
                    <p className="font-semibold text-ink">{l.description}</p>
                    {l.detail ? <p className="mt-0.5 text-[12.5px] text-ink-muted">{l.detail}</p> : null}
                    {l.discountPercent > 0 || l.taxPercent > 0 ? (
                      <p className="mt-0.5 text-[12px] text-ink-faint">
                        {l.discountPercent > 0 ? `${l.discountPercent}% discount` : ''}
                        {l.discountPercent > 0 && l.taxPercent > 0 ? ' · ' : ''}
                        {l.taxPercent > 0 ? `${l.taxPercent}% ${taxLabel}` : ''}
                      </p>
                    ) : null}
                  </td>
                  <td data-numeric className="px-3 py-3 text-right text-ink-muted">
                    {l.quantity}
                  </td>
                  <td data-numeric className="px-3 py-3 text-right text-ink-muted">
                    {fmt(l.unitPrice)}
                  </td>
                  <td data-numeric className="px-5 py-3 text-right font-semibold text-ink">
                    {fmt(l.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-divider bg-surface-3 px-5 py-4">
          <dl className="ml-auto max-w-xs space-y-1.5 text-[13.5px]">
            <Row label="Subtotal" value={fmt(doc.subtotal)} />
            {doc.discountTotal > 0 ? <Row label="Discount" value={`− ${fmt(doc.discountTotal)}`} /> : null}
            {doc.taxTotal > 0 ? <Row label={taxLabel} value={fmt(doc.taxTotal)} /> : null}
            <div className="flex justify-between gap-4 border-t border-line pt-2">
              <dt className="font-bold text-forest">{isQuote ? 'Total quoted' : 'Total due'}</dt>
              <dd data-numeric className="font-serif text-[19px] font-bold text-forest">
                {fmt(doc.total)}
              </dd>
            </div>
            {!isQuote && doc.amountPaid > 0 ? (
              <>
                <Row label="Paid" value={fmt(doc.amountPaid)} />
                <Row label="Balance" value={fmt(doc.total - doc.amountPaid)} />
              </>
            ) : null}
          </dl>
        </div>
      </Card>

      {doc.notes || doc.terms || doc.paymentInstructions ? (
        <Card as="section">
          <CardHeader title="Notes and terms" />
          <div className="mt-4 space-y-4 text-[13.5px] leading-6 text-ink">
            {doc.notes ? <Block title="Note to the customer" text={doc.notes} /> : null}
            {doc.paymentInstructions ? <Block title="How to pay" text={doc.paymentInstructions} /> : null}
            {doc.terms ? <Block title="Terms and conditions" text={doc.terms} /> : null}
          </div>
        </Card>
      ) : null}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-ink-muted">{label}</dt>
      <dd data-numeric className="font-semibold text-ink">
        {value}
      </dd>
    </div>
  )
}

function Block({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <p className="text-[12px] font-bold uppercase tracking-[0.06em] text-ink-muted">{title}</p>
      <p className="mt-1 whitespace-pre-wrap">{text}</p>
    </div>
  )
}

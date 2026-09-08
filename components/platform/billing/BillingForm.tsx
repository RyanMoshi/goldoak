'use client'

import { Plus, Trash2 } from 'lucide-react'
import { useMemo, useState, useTransition } from 'react'
import { Card, CardHeader } from '@/components/platform/ui/Card'
import { Field, FormActions, FormSection, Select, SubmitButton, TextArea, TextInput } from '@/components/platform/ui/Form'
import { StatusLine } from '@/components/platform/ui/PageHeader'
import { createBillingDocumentAction, updateBillingDocumentAction, type BillingState } from '@/lib/billing/actions'
import type { AgencySettings, BillingDocument, BillingKind } from '@/types/billing'

/**
 * One form for both quotes and invoices. Totals are computed as you type from
 * the same arithmetic the server uses, so the figure on screen is the figure
 * that gets saved and printed. Lines are a repeating group posted as parallel
 * arrays, which keeps the form a plain HTML form that works before hydration.
 */

interface Line {
  key: string
  description: string
  detail: string
  quantity: string
  price: string
  discount: string
  tax: string
}

interface ClientOption {
  id: string
  name: string
  email: string | null
  phone: string | null
}

const blank = (tax: number): Line => ({ key: Math.random().toString(36).slice(2), description: '', detail: '', quantity: '1', price: '', discount: '0', tax: String(tax) })

const n = (v: string) => {
  const x = Number(v)
  return Number.isFinite(x) ? x : 0
}

export function BillingForm({ kind, clients, settings, document, currency }: { kind: BillingKind; clients: ClientOption[]; settings: AgencySettings; document?: BillingDocument; currency: string }) {
  const defaultTax = settings.taxPercent ?? 0
  const [state, setState] = useState<BillingState>({})
  const [pending, startTransition] = useTransition()
  const [lines, setLines] = useState<Line[]>(
    document?.lines.length
      ? document.lines.map((l) => ({ key: l.id, description: l.description, detail: l.detail ?? '', quantity: String(l.quantity), price: String(l.unitPrice), discount: String(l.discountPercent), tax: String(l.taxPercent) }))
      : [blank(defaultTax)],
  )
  const [customer, setCustomer] = useState({
    clientId: document?.clientId ?? '',
    customerName: document?.customerName ?? '',
    customerEmail: document?.customerEmail ?? '',
    customerPhone: document?.customerPhone ?? '',
  })

  const totals = useMemo(() => {
    let subtotal = 0
    let discount = 0
    let tax = 0
    for (const l of lines) {
      const base = n(l.quantity) * n(l.price)
      const d = (base * n(l.discount)) / 100
      const net = Math.max(0, base - d)
      subtotal += net
      discount += d
      tax += (net * n(l.tax)) / 100
    }
    return { subtotal, discount, tax, total: subtotal + tax }
  }, [lines])

  const fmt = (v: number) => `${currency} ${v.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const update = (key: string, patch: Partial<Line>) => setLines((ls) => ls.map((l) => (l.key === key ? { ...l, ...patch } : l)))
  const label = kind === 'quote' ? 'quotation' : 'invoice'

  function submit(formData: FormData) {
    startTransition(async () => {
      const result = document ? await updateBillingDocumentAction(document.id, formData) : await createBillingDocumentAction(formData)
      if (result) setState(result)
    })
  }

  return (
    <form action={submit} className="space-y-6" noValidate>
      <input type="hidden" name="kind" value={kind} />

      <Card as="section">
        <CardHeader title="Customer" description={`Who this ${label} is for. Pick a client to fill their details, or type them in for a one-off.`} />
        <div className="mt-5 space-y-4">
          <Field label="Client" htmlFor="bill-client" hint="Linking a client shows this document on their record.">
            <Select
              id="bill-client"
              name="clientId"
              value={customer.clientId}
              onChange={(e) => {
                const id = e.target.value
                const c = clients.find((x) => x.id === id)
                setCustomer((prev) => ({ clientId: id, customerName: c?.name ?? prev.customerName, customerEmail: c?.email ?? prev.customerEmail, customerPhone: c?.phone ?? prev.customerPhone }))
              }}
            >
              <option value="">Not linked to a client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput label="Customer name" name="customerName" required value={customer.customerName} onChange={(e) => setCustomer({ ...customer, customerName: e.target.value })} placeholder="Achieng Otieno" error={state.field === 'customerName' ? state.error : undefined} />
            <TextInput label="Email" name="customerEmail" type="email" value={customer.customerEmail} onChange={(e) => setCustomer({ ...customer, customerEmail: e.target.value })} placeholder="achieng@example.com" hint={`Where the ${label} is sent.`} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput label="Phone" name="customerPhone" value={customer.customerPhone} onChange={(e) => setCustomer({ ...customer, customerPhone: e.target.value })} placeholder="+254 7xx xxx xxx" optional />
            <TextInput label="Your reference" name="reference" defaultValue={document?.reference ?? ''} placeholder="Policy renewal 2026" optional />
          </div>
          <TextArea label="Postal address" name="customerAddress" rows={2} defaultValue={document?.customerAddress ?? ''} placeholder="P.O. Box 000-00100, Nairobi" optional />
        </div>
      </Card>

      <Card as="section">
        <CardHeader title="Dates" />
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <TextInput label="Date of issue" name="issueDate" type="date" defaultValue={document?.issueDate ?? new Date().toISOString().slice(0, 10)} required />
          <TextInput
            label={kind === 'quote' ? 'Valid until' : 'Payment due'}
            name="dueDate"
            type="date"
            defaultValue={document?.dueDate ?? ''}
            hint={kind === 'quote' ? `Left blank, we use ${settings.quoteValidDays ?? 30} days.` : `Left blank, we use ${settings.invoiceDueDays ?? 14} days.`}
          />
        </div>
      </Card>

      <Card as="section" flush>
        <div className="p-5 pb-0">
          <CardHeader title="Lines" description="What is being quoted or charged. Quantity times unit price, less any discount, plus tax." />
        </div>
        <div className="mt-4 space-y-3 px-4 sm:px-5">
          {lines.map((line, index) => (
            <div key={line.key} className="rounded-card border border-line bg-surface-3 p-3">
              <div className="flex items-start gap-2">
                <span className="mt-2.5 hidden w-5 shrink-0 text-[12px] font-bold text-ink-faint sm:block">{index + 1}</span>
                <div className="min-w-0 flex-1 space-y-3">
                  <TextInput label="Description" name="line_description" value={line.description} onChange={(e) => update(line.key, { description: e.target.value })} placeholder="Comprehensive motor cover · KCA 123A" required={index === 0} />
                  <TextInput label="Extra detail" name="line_detail" value={line.detail} onChange={(e) => update(line.key, { detail: e.target.value })} placeholder="Toyota Premio, sum insured KES 1,200,000" optional />
                  <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
                    <TextInput label="Qty" name="line_quantity" inputMode="decimal" value={line.quantity} onChange={(e) => update(line.key, { quantity: e.target.value })} />
                    <TextInput label="Unit price" name="line_price" inputMode="decimal" value={line.price} onChange={(e) => update(line.key, { price: e.target.value })} placeholder="0.00" />
                    <TextInput label="Discount %" name="line_discount" inputMode="decimal" value={line.discount} onChange={(e) => update(line.key, { discount: e.target.value })} />
                    <TextInput label={`${settings.taxLabel ?? 'Tax'} %`} name="line_tax" inputMode="decimal" value={line.tax} onChange={(e) => update(line.key, { tax: e.target.value })} />
                    <div className="col-span-2 lg:col-span-1">
                      <p className="text-[13px] font-semibold text-ink">Amount</p>
                      <p data-numeric className="mt-1.5 flex h-11 items-center justify-end rounded-control bg-surface px-3 text-[14px] font-bold text-forest">
                        {fmt(Math.max(0, n(line.quantity) * n(line.price) * (1 - n(line.discount) / 100)) * (1 + n(line.tax) / 100))}
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setLines((ls) => (ls.length === 1 ? [blank(defaultTax)] : ls.filter((l) => l.key !== line.key)))}
                  className="mt-7 inline-flex size-9 shrink-0 items-center justify-center rounded-control text-ink-faint hover:bg-error/10 hover:text-error focus-ring"
                  aria-label={`Remove line ${index + 1}`}
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setLines((ls) => [...ls, blank(defaultTax)])}
            className="inline-flex h-10 items-center gap-2 rounded-control border border-dashed border-line px-3 text-[13.5px] font-semibold text-ink-muted hover:border-forest hover:text-forest focus-ring"
          >
            <Plus className="size-4" aria-hidden="true" /> Add a line
          </button>
        </div>

        <div className="mt-5 border-t border-divider bg-surface-3 px-5 py-4">
          <dl className="ml-auto max-w-xs space-y-1.5 text-[13.5px]">
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Subtotal</dt>
              <dd data-numeric className="font-semibold text-ink">
                {fmt(totals.subtotal)}
              </dd>
            </div>
            {totals.discount > 0 ? (
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">Discount</dt>
                <dd data-numeric className="font-semibold text-ink">
                  − {fmt(totals.discount)}
                </dd>
              </div>
            ) : null}
            {totals.tax > 0 ? (
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">{settings.taxLabel ?? 'Tax'}</dt>
                <dd data-numeric className="font-semibold text-ink">
                  {fmt(totals.tax)}
                </dd>
              </div>
            ) : null}
            <div className="flex justify-between gap-4 border-t border-line pt-2">
              <dt className="font-bold text-forest">{kind === 'quote' ? 'Total quoted' : 'Total due'}</dt>
              <dd data-numeric className="font-serif text-[19px] font-bold text-forest">
                {fmt(totals.total)}
              </dd>
            </div>
          </dl>
        </div>
      </Card>

      <Card as="section">
        <CardHeader title="Notes and terms" description="Printed at the foot of the PDF." />
        <div className="mt-5 space-y-4">
          <FormSection title="Message to the customer">
            <TextArea name="notes" rows={3} defaultValue={document?.notes ?? ''} placeholder="Thank you for the opportunity to quote for your motor cover." optional />
          </FormSection>
          {kind === 'invoice' ? (
            <FormSection title="How to pay">
              <TextArea name="paymentInstructions" rows={3} defaultValue={document?.paymentInstructions ?? settings.paymentInstructions ?? ''} placeholder="M-PESA Paybill 000000, account: your invoice number. Bank: …" optional />
            </FormSection>
          ) : null}
          <FormSection title="Terms and conditions">
            <TextArea name="terms" rows={3} defaultValue={document?.terms ?? (kind === 'quote' ? (settings.quoteTerms ?? '') : (settings.invoiceTerms ?? ''))} placeholder="Cover is bound only on receipt of the premium and insurer confirmation." optional />
          </FormSection>
        </div>
      </Card>

      <StatusLine success={state.success} error={!state.field ? state.error : undefined} onDismiss={() => setState({})} />
      <FormActions>
        <SubmitButton pending={pending} pendingLabel={document ? 'Saving…' : 'Creating…'}>
          {document ? 'Save changes' : `Create ${label}`}
        </SubmitButton>
      </FormActions>
    </form>
  )
}

import Link from 'next/link'
import { FileSignature, Plus, Receipt } from 'lucide-react'
import { Badge } from '@/components/platform/ui/Badge'
import { Card, CardHeader } from '@/components/platform/ui/Card'
import { BILLING_STATUS_LABEL, type BillingListRow } from '@/types/billing'

/** The quotations and invoices raised for one client, on their own record. */

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

export function ClientBilling({ rows }: { rows: BillingListRow[] }) {
  return (
    <Card as="section">
      <CardHeader
        title="Quotations and invoices"
        description={rows.length ? `${rows.length} document${rows.length === 1 ? '' : 's'} for this client.` : 'Nothing raised for this client yet.'}
        aside={
          <div className="flex gap-1.5">
            <Link href="/agency/billing/new?kind=quote" className="inline-flex h-9 items-center gap-1.5 rounded-control border border-line bg-surface px-2.5 text-[12.5px] font-semibold text-ink hover:border-ink-muted focus-ring">
              <Plus className="size-3.5" aria-hidden="true" /> Quote
            </Link>
            <Link href="/agency/billing/new?kind=invoice" className="inline-flex h-9 items-center gap-1.5 rounded-control border border-line bg-surface px-2.5 text-[12.5px] font-semibold text-ink hover:border-ink-muted focus-ring">
              <Plus className="size-3.5" aria-hidden="true" /> Invoice
            </Link>
          </div>
        }
      />
      {rows.length ? (
        <ul className="mt-4 divide-y divide-divider border-t border-line">
          {rows.map((r) => (
            <li key={r.id}>
              <Link href={`/agency/billing/${r.kind === 'quote' ? 'quotes' : 'invoices'}/${r.id}`} className="flex items-center justify-between gap-3 py-2.5 focus-ring">
                <span className="flex min-w-0 items-center gap-2.5">
                  <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-control bg-surface-2 text-ink-muted">
                    {r.kind === 'quote' ? <FileSignature className="size-4" aria-hidden="true" /> : <Receipt className="size-4" aria-hidden="true" />}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-mono text-[12.5px] font-semibold text-forest">{r.number}</span>
                    <span className="block text-[12px] text-ink-muted">
                      {new Date(r.issueDate).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <span data-numeric className="text-[13.5px] font-bold text-ink">
                    {r.currency} {r.total.toLocaleString('en-KE', { maximumFractionDigits: 0 })}
                  </span>
                  <Badge tone={TONE[r.status] ?? 'neutral'} dot>
                    {BILLING_STATUS_LABEL[r.status] ?? r.status}
                  </Badge>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </Card>
  )
}

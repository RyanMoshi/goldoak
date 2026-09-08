import Link from 'next/link'
import { FileText } from 'lucide-react'
import { Badge } from '@/components/platform/ui/Badge'
import { Card } from '@/components/platform/ui/Card'
import { EmptyState } from '@/components/platform/ui/EmptyState'
import { relativeTime } from '@/lib/format'
import { BILLING_STATUS_LABEL, type BillingKind, type BillingListRow } from '@/types/billing'

/** Cards on phones, a table from md up: the same data, laid out for the device. */

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

function fmt(amount: number, currency: string): string {
  return `${currency} ${amount.toLocaleString('en-KE', { maximumFractionDigits: 0 })}`
}

export function BillingTable({ rows, kind }: { rows: BillingListRow[]; kind: BillingKind }) {
  const label = kind === 'quote' ? 'quotation' : 'invoice'
  if (!rows.length) {
    return (
      <Card flush>
        <EmptyState
          icon={FileText}
          title={`No ${label}s yet`}
          description={kind === 'quote' ? 'Create a quotation to send a priced proposal a client can accept.' : 'Create an invoice to bill a client for premium or fees.'}
          action={
            <Link href={`/agency/billing/new?kind=${kind}`} className="inline-flex h-10 items-center rounded-control bg-forest px-4 text-[13.5px] font-semibold text-white hover:bg-forest-700 focus-ring">
              New {label}
            </Link>
          }
        />
      </Card>
    )
  }
  return (
    <>
      <ul className="grid grid-cols-[minmax(0,1fr)] gap-3 md:hidden">
        {rows.map((r) => (
          <li key={r.id}>
            <Link href={`/agency/billing/${r.id}`} className="block rounded-card border border-line bg-surface p-4 focus-ring hover:border-ink-faint">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[14.5px] font-bold text-ink">{r.customerName}</p>
                  <p className="font-mono text-[12px] text-ink-muted">{r.number}</p>
                </div>
                <Badge tone={TONE[r.status] ?? 'neutral'} dot>
                  {BILLING_STATUS_LABEL[r.status] ?? r.status}
                </Badge>
              </div>
              <div className="mt-3 flex items-end justify-between gap-3">
                <p className="text-[12px] text-ink-faint">
                  {r.dueDate ? `${kind === 'quote' ? 'Valid to' : 'Due'} ${new Date(r.dueDate).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })} · ` : ''}
                  {relativeTime(r.createdAt)}
                </p>
                <p data-numeric className="font-serif text-[17px] font-bold text-forest">
                  {fmt(r.total, r.currency)}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <Card flush className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[720px] border-collapse text-[13.5px]">
          <thead>
            <tr className="border-b border-line bg-surface-3 text-left">
              <th className="px-4 py-2.5 font-semibold text-ink-muted">Number</th>
              <th className="px-4 py-2.5 font-semibold text-ink-muted">Customer</th>
              <th className="px-4 py-2.5 font-semibold text-ink-muted">Issued</th>
              <th className="px-4 py-2.5 font-semibold text-ink-muted">{kind === 'quote' ? 'Valid until' : 'Due'}</th>
              <th className="px-4 py-2.5 text-right font-semibold text-ink-muted">Total</th>
              <th className="px-4 py-2.5 font-semibold text-ink-muted">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-divider last:border-b-0 hover:bg-surface-3">
                <td className="px-4 py-3">
                  <Link href={`/agency/billing/${r.id}`} className="font-mono text-[12.5px] font-semibold text-forest hover:underline focus-ring">
                    {r.number}
                  </Link>
                </td>
                <td className="max-w-[220px] truncate px-4 py-3 font-semibold text-ink">{r.customerName}</td>
                <td className="px-4 py-3 text-ink-muted">{new Date(r.issueDate).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                <td className="px-4 py-3 text-ink-muted">{r.dueDate ? new Date(r.dueDate).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</td>
                <td data-numeric className="px-4 py-3 text-right font-bold text-ink">
                  {fmt(r.total, r.currency)}
                  {r.amountPaid > 0 && r.amountPaid < r.total ? <span className="block text-[11.5px] font-normal text-ink-faint">{fmt(r.total - r.amountPaid, r.currency)} left</span> : null}
                </td>
                <td className="px-4 py-3">
                  <Badge tone={TONE[r.status] ?? 'neutral'} dot>
                    {BILLING_STATUS_LABEL[r.status] ?? r.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  )
}

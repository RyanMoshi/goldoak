import { FileText } from 'lucide-react'
import { Badge, type BadgeTone } from '@/components/platform/ui/Badge'
import { Card, CardHeader } from '@/components/platform/ui/Card'
import { EmptyState } from '@/components/platform/ui/EmptyState'
import { Money } from '@/components/platform/ui/Money'
import { daysUntil, formatShortDate } from '@/lib/format'
import type { Policy, PolicyStatus } from '@/types/platform'

const statusMeta: Record<PolicyStatus, { label: string; tone: BadgeTone }> = {
  live: { label: 'Live', tone: 'success' },
  'renewal-due': { label: 'Renewal due', tone: 'warning' },
  lapsed: { label: 'Lapsed', tone: 'error' },
  cancelled: { label: 'Cancelled', tone: 'neutral' },
}

export function PolicyList({ policies, heading = 'My insurance', emptyText }: { policies: Policy[]; heading?: string; emptyText?: string }) {
  return (
    <Card as="section" flush aria-label={heading}>
      <div className="px-5 pb-3 pt-5">
        <CardHeader title={heading} description={policies.length ? `${policies.length} polic${policies.length === 1 ? 'y' : 'ies'} on file` : undefined} />
      </div>
      {policies.length === 0 ? (
        <EmptyState icon={FileText} title="No policies yet" description={emptyText ?? 'Cover placed through GoldOak appears here with its renewal date and documents.'} />
      ) : (
        <ul className="divide-y divide-divider border-t border-line">
          {policies.map((p) => {
            const days = daysUntil(p.expiryDate)
            const status = statusMeta[p.status]
            return (
              <li key={p.id} className="px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[15px] font-bold text-ink">{p.product}</p>
                    <p className="text-[12.5px] text-ink-muted">{p.insurer} · <span className="font-mono">{p.policyNumber}</span></p>
                  </div>
                  <Badge tone={status.tone} dot>{status.label}</Badge>
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-[12.5px] sm:grid-cols-4">
                  <div><dt className="text-ink-faint">Premium</dt><dd><Money amount={p.premium} className="text-ink" /><span className="text-ink-faint">/yr</span></dd></div>
                  {p.sumInsured ? <div><dt className="text-ink-faint">Sum insured</dt><dd><Money amount={p.sumInsured} className="text-ink" /></dd></div> : null}
                  <div><dt className="text-ink-faint">Renews</dt><dd className={days <= 30 ? 'font-semibold text-warning' : 'text-ink'}>{formatShortDate(p.expiryDate)} <span className="font-mono text-[11px] text-ink-faint">{days}d</span></dd></div>
                  <div><dt className="text-ink-faint">Started</dt><dd className="text-ink">{formatShortDate(p.startDate)}</dd></div>
                </dl>
                {p.keyExclusions ? <p className="mt-2 text-[12.5px] text-ink-muted"><span className="font-semibold text-ink">Note:</span> {p.keyExclusions}</p> : null}
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}

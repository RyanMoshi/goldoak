import { ShieldCheck } from 'lucide-react'
import { Badge } from '@/components/platform/ui/Badge'
import { Card, CardHeader } from '@/components/platform/ui/Card'
import { EmptyState } from '@/components/platform/ui/EmptyState'
import { Money } from '@/components/platform/ui/Money'
import { cn } from '@/lib/cn'
import { formatShortDate } from '@/lib/format'
import { CLAIM_STAGES, type Claim } from '@/types/platform'

export function ClaimList({ claims, heading = 'Claims' }: { claims: Claim[]; heading?: string }) {
  return (
    <Card as="section" flush aria-label={heading}>
      <div className="px-5 pb-3 pt-5">
        <CardHeader title={heading} description={claims.length ? `${claims.length} on file` : undefined} />
      </div>
      {claims.length === 0 ? (
        <EmptyState icon={ShieldCheck} title="No claims" description="If something happens, tell us the same day. We register it within 24 hours and update you weekly until it is settled." />
      ) : (
        <ul className="divide-y divide-divider border-t border-line">
          {claims.map((c) => {
            const index = CLAIM_STAGES.findIndex((s) => s.id === c.stage)
            const closed = c.stage === 'settled' || c.stage === 'closed'
            return (
              <li key={c.id} className="px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[15px] font-bold text-ink">{c.product} · {c.insurer}</p>
                    <p className="text-[12.5px] text-ink-muted"><span className="font-mono">{c.reference}</span> · notified {formatShortDate(c.notifiedAt)}</p>
                  </div>
                  <Badge tone={closed ? 'success' : 'info'} dot>{CLAIM_STAGES[index]?.label ?? c.stage}</Badge>
                </div>
                <ol className="mt-3 flex gap-1" aria-label="Claim stages">
                  {CLAIM_STAGES.map((s, i) => (
                    <li key={s.id} title={s.label} className={cn('h-1.5 flex-1 rounded-[2px]', i < index ? 'bg-forest' : i === index ? 'bg-gold' : 'bg-surface-2')} />
                  ))}
                </ol>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] text-ink-muted">
                  {c.amount ? <span>Amount <Money amount={c.amount} className="text-ink" /></span> : null}
                  {c.nextUpdateDue && !closed ? <span>Next update <span className="font-semibold text-ink">{formatShortDate(c.nextUpdateDue)}</span></span> : null}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}

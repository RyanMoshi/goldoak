import { FileSearch } from 'lucide-react'
import { Badge, type BadgeTone } from '@/components/platform/ui/Badge'
import { Card, CardHeader } from '@/components/platform/ui/Card'
import { EmptyState } from '@/components/platform/ui/EmptyState'
import { Money } from '@/components/platform/ui/Money'
import { relativeTime } from '@/lib/format'
import type { QuoteRequest, QuoteStage, SubmissionStatus } from '@/types/platform'

const stageMeta: Record<QuoteStage, { label: string; tone: BadgeTone; note: string }> = {
  requested: { label: 'With insurers', tone: 'warning', note: 'We have asked our panel and are waiting for replies.' },
  compared: { label: 'Comparing', tone: 'info', note: 'Replies are in. Your adviser is comparing them on identical terms.' },
  proposed: { label: 'Proposal sent', tone: 'gold', note: 'Our recommendation is with you. Reply to accept or ask a question.' },
  accepted: { label: 'Accepted', tone: 'success', note: 'Cover is being placed. Documents follow.' },
  placed: { label: 'Placed', tone: 'success', note: 'Done. See the policy above.' },
  declined: { label: 'Declined', tone: 'neutral', note: '' },
}

const subMeta: Record<SubmissionStatus, string> = {
  awaiting: 'waiting',
  received: 'replied',
  clarification: 'asked a question',
  ready: 'ready',
  declined: 'declined',
}

export function QuoteList({ quotes, heading = 'Quotes in progress' }: { quotes: QuoteRequest[]; heading?: string }) {
  return (
    <Card as="section" flush aria-label={heading}>
      <div className="px-5 pb-3 pt-5">
        <CardHeader title={heading} description={quotes.length ? `${quotes.length} open` : undefined} />
      </div>
      {quotes.length === 0 ? (
        <EmptyState icon={FileSearch} title="No quotes in progress" description="When your adviser goes to market for you, each insurer's reply shows here." />
      ) : (
        <ul className="divide-y divide-divider border-t border-line">
          {quotes.map((q) => {
            const stage = stageMeta[q.stage]
            return (
              <li key={q.id} className="px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[15px] font-bold text-ink">{q.product}</p>
                    <p className="text-[12.5px] text-ink-muted"><span className="font-mono">{q.reference}</span> · started {relativeTime(q.createdAt)}</p>
                  </div>
                  <Badge tone={stage.tone} dot>{stage.label}</Badge>
                </div>
                {stage.note ? <p className="mt-2 text-[13px] text-ink-muted">{stage.note}</p> : null}
                {q.submissions.length ? (
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {q.submissions.map((s) => (
                      <li key={s.id} className="inline-flex items-center gap-1.5 rounded-[4px] border border-line bg-surface-3 px-2 py-1 text-[12px]">
                        <span className="font-semibold text-ink">{s.insurer}</span>
                        <span className="text-ink-faint">{subMeta[s.status]}</span>
                        {s.premium ? <Money amount={s.premium} className="text-[11.5px] text-ink" /> : null}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {q.premiumEstimate ? <p className="mt-2 text-[12px] text-ink-faint">Indicative premium <Money amount={q.premiumEstimate} className="text-ink-muted" /></p> : null}
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}

import Link from 'next/link'
import { KanbanSquare } from 'lucide-react'
import { Badge } from '@/components/platform/ui/Badge'
import { Card } from '@/components/platform/ui/Card'
import { EmptyState } from '@/components/platform/ui/EmptyState'
import { Money } from '@/components/platform/ui/Money'
import { cn } from '@/lib/cn'
import type { PipelineColumn } from '@/services/agency/workspace'
import type { ClientType } from '@/types/platform'

const typeLabel: Record<ClientType, string> = { individual: 'Individual', sme: 'SME', corporate: 'Corporate' }

const headTone = ['bg-gold/15 text-gold-700', 'bg-gold/25 text-gold-700', 'bg-info/10 text-info', 'bg-info/15 text-info', 'bg-success/10 text-success', 'bg-forest text-white']

/** Kanban of clients by journey stage. Cards open the client record where the stage is changed. */
export function PipelineBoard({ columns }: { columns: PipelineColumn[] }) {
  const total = columns.reduce((sum, c) => sum + c.cards.length, 0)
  if (!total) {
    return (
      <Card flush>
        <EmptyState icon={KanbanSquare} title="No clients in the pipeline" description="Clients appear here as soon as they sign up or you add a lead." />
      </Card>
    )
  }
  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <ol className="flex min-w-max gap-3">
        {columns.map((col, i) => (
          <li key={col.stage} className="w-[272px] shrink-0">
            <div className={cn('flex items-center justify-between rounded-t-card px-3 py-2', headTone[i])}>
              <span className="text-[12px] font-bold uppercase tracking-[0.08em]">
                {i + 1} · {col.label}
              </span>
              <span className="font-mono text-[12px] font-semibold">{col.cards.length}</span>
            </div>
            <div className="min-h-[200px] space-y-2 rounded-b-card border border-t-0 border-line bg-surface-2/60 p-2">
              <p className="px-1 pb-1 text-[11.5px] leading-4 text-ink-muted">{col.description}</p>
              {col.value ? (
                <p className="px-1 pb-1 text-[11.5px] text-ink-faint">
                  Value <Money amount={col.value} compact className="text-ink" />
                </p>
              ) : null}
              {col.cards.map((c) => (
                <Link key={c.id} href={`/agency/clients/${c.id}`} className="block rounded-card border border-line bg-surface p-3 shadow-sm transition-colors hover:border-line-strong focus-ring">
                  <div className="flex items-start justify-between gap-2">
                    <p className="min-w-0 truncate text-[14px] font-bold text-ink">{c.name}</p>
                    <Badge>{typeLabel[c.type]}</Badge>
                  </div>
                  <p className="mt-0.5 text-[12px] text-ink-muted">{c.adviserName ?? 'Unassigned'}</p>
                  <dl className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11.5px] text-ink-muted">
                    {c.openQuotes ? (
                      <div>
                        <dt className="sr-only">Open quotes</dt>
                        <dd>
                          {c.openQuotes} quote{c.openQuotes === 1 ? '' : 's'}
                          {c.quoteValue ? (
                            <>
                              {' · '}
                              <Money amount={c.quoteValue} compact className="text-ink" />
                            </>
                          ) : null}
                        </dd>
                      </div>
                    ) : null}
                    {c.policies ? (
                      <div>
                        <dt className="sr-only">Policies</dt>
                        <dd>
                          {c.policies} polic{c.policies === 1 ? 'y' : 'ies'} · <Money amount={c.annualPremium} compact className="text-ink" />
                        </dd>
                      </div>
                    ) : null}
                  </dl>
                  <p className={cn('mt-2 font-mono text-[10.5px]', c.daysInStage > 14 ? 'text-warning' : 'text-ink-faint')}>{c.daysInStage === 0 ? 'Moved today' : `${c.daysInStage} days in stage`}</p>
                </Link>
              ))}
              {col.cards.length === 0 ? <p className="px-1 py-6 text-center text-[12px] text-ink-faint">Empty</p> : null}
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

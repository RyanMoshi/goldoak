'use client'

import { ArrowRight, FileText, RefreshCw, Send, ShieldAlert, UserPlus, type LucideIcon } from 'lucide-react'
import { Money } from '@/components/platform/ui/Money'
import { cn } from '@/lib/cn'
import type { MetricIcon, PriorityMetric } from '@/types/platform'

const icons: Record<MetricIcon, LucideIcon> = {
  leads: UserPlus,
  quotes: FileText,
  proposals: Send,
  renewals: RefreshCw,
  claims: ShieldAlert,
}

interface Props {
  metric: PriorityMetric
  active: boolean
  onSelect: (metric: PriorityMetric) => void
}

/** A metric is a filter: pressing it narrows the work queue. The active card inverts to forest. */
export function PriorityMetricCard({ metric, active, onSelect }: Props) {
  const Icon = icons[metric.icon]
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={() => onSelect(metric)}
      className={cn(
        'group flex min-w-[200px] snap-start flex-col rounded-card border p-4 text-left transition-colors duration-150 focus-ring sm:min-w-0',
        active ? 'border-forest bg-forest text-white' : 'border-line bg-surface hover:border-line-strong hover:bg-surface-3',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={cn('label-caps', active ? 'text-white/70' : 'text-ink-muted')}>{metric.label}</span>
        <Icon className={cn('size-4 shrink-0', active ? 'text-gold' : 'text-ink-faint group-hover:text-ink-muted')} aria-hidden="true" strokeWidth={1.75} />
      </div>
      <div className="mt-2.5 flex items-baseline gap-2">
        <span data-numeric className={cn('font-serif text-[30px] font-bold leading-8', active ? 'text-white' : 'text-forest')}>
          {metric.value}
        </span>
        {metric.amount !== undefined ? (
          <Money amount={metric.amount} compact className={cn('rounded-[4px] px-1.5 py-0.5 text-[11px]', active ? 'bg-white/10 text-gold' : 'bg-surface-2 text-ink-muted')} />
        ) : null}
      </div>
      <div className={cn('mt-3 flex items-center justify-between gap-2 border-t pt-2.5 text-[12.5px] leading-4', active ? 'border-white/15' : 'border-divider')}>
        <span
          className={cn(
            'truncate',
            active ? 'text-white/85' : metric.contextTone === 'error' ? 'font-semibold text-error' : metric.contextTone === 'warning' ? 'font-semibold text-warning' : 'text-ink-muted',
          )}
        >
          {metric.context}
        </span>
        <ArrowRight className={cn('size-3.5 shrink-0 transition-transform group-hover:translate-x-0.5', active ? 'text-gold' : 'text-ink-faint')} aria-hidden="true" />
      </div>
    </button>
  )
}

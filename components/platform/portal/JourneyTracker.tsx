import { Check } from 'lucide-react'
import { cn } from '@/lib/cn'
import { JOURNEY_STAGES, type JourneyStage } from '@/types/platform'

/** The six GoldOak stages with the client's current position. Shared by the portal and the agency. */
export function JourneyTracker({ stage, compact = false }: { stage: JourneyStage; compact?: boolean }) {
  const current = Math.max(0, JOURNEY_STAGES.findIndex((s) => s.id === stage))
  return (
    <ol className={cn('grid gap-2', compact ? 'grid-cols-3 sm:grid-cols-6' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6')} aria-label="Your progress with GoldOak">
      {JOURNEY_STAGES.map((s, index) => {
        const done = index < current
        const active = index === current
        return (
          <li
            key={s.id}
            aria-current={active ? 'step' : undefined}
            className={cn(
              'rounded-card border p-3',
              active ? 'border-forest bg-forest text-white' : done ? 'border-forest-100 bg-forest-100 text-forest' : 'border-line bg-surface text-ink-muted',
            )}
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'inline-flex size-5 shrink-0 items-center justify-center rounded-full font-mono text-[10.5px] font-semibold',
                  active ? 'bg-gold text-white' : done ? 'bg-forest text-white' : 'bg-surface-2 text-ink-faint',
                )}
              >
                {done ? <Check className="size-3" aria-hidden="true" strokeWidth={3} /> : index + 1}
              </span>
              <span className={cn('truncate text-[12.5px] font-bold uppercase tracking-[0.06em]', active ? 'text-white' : '')}>{s.label}</span>
            </div>
            {!compact ? <p className={cn('mt-2 text-[12px] leading-4', active ? 'text-white/80' : 'text-ink-muted')}>{s.description}</p> : null}
          </li>
        )
      })}
    </ol>
  )
}

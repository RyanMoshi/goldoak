'use client'

import Link from 'next/link'
import { ArrowRight, Check, X } from 'lucide-react'
import { useTransition } from 'react'
import { Card } from '@/components/platform/ui/Card'
import { cn } from '@/lib/cn'
import { dismissOnboardingAction } from '@/lib/agency/actions'
import type { OnboardingState } from '@/services/agency-onboarding'

/**
 * The setup checklist. Shown on Today until every required step is done, and
 * always reachable from `/agency/onboarding`. Each step says what the agency
 * gets out of finishing it, because a checklist that only lists chores gets
 * dismissed.
 */
export function OnboardingChecklist({ state, compact = false }: { state: OnboardingState; compact?: boolean }) {
  const [pending, startTransition] = useTransition()
  const percent = Math.round((state.completed / state.total) * 100)

  return (
    <Card as="section" className={cn('relative', compact ? '' : 'p-6')}>
      {compact ? (
        <form action={() => startTransition(async () => void (await dismissOnboardingAction()))} className="absolute right-3 top-3">
          <button type="submit" disabled={pending} aria-label="Hide the setup checklist" className="inline-flex size-8 items-center justify-center rounded-control text-ink-faint hover:bg-surface-2 hover:text-ink focus-ring disabled:opacity-60">
            <X className="size-4" aria-hidden="true" />
          </button>
        </form>
      ) : null}

      <div className="pr-8">
        <p className="label-caps text-gold-700">Getting set up</p>
        <h2 className="mt-1.5 font-serif text-[19px] font-semibold text-forest">
          {state.finished ? 'Your agency is ready' : `${state.completed} of ${state.total} steps done`}
        </h2>
        <p className="mt-1 text-[13.5px] text-ink-muted">
          {state.finished ? 'Everything essential is configured. The optional steps below are still worth doing.' : 'A few minutes now and everything else works the way you expect.'}
        </p>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label="Setup progress">
        <div className="h-full rounded-full bg-forest transition-all duration-500" style={{ width: `${percent}%` }} />
      </div>

      <ol className="mt-5 space-y-2.5">
        {state.steps.map((step) => (
          <li key={step.id}>
            <div className={cn('flex items-start gap-3 rounded-card border p-3', step.done ? 'border-line bg-surface-3' : 'border-line bg-surface')}>
              <span
                aria-hidden="true"
                className={cn('mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold', step.done ? 'bg-forest text-white' : 'border border-line-strong bg-surface text-ink-faint')}
              >
                {step.done ? <Check className="size-3.5" /> : state.steps.filter((s) => !s.done).indexOf(step) + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className={cn('text-[14px] font-bold', step.done ? 'text-ink-muted line-through decoration-ink-faint/50' : 'text-ink')}>
                  {step.title}
                  {step.optional ? <span className="ml-2 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-faint">optional</span> : null}
                </p>
                <p className="mt-0.5 text-[12.5px] leading-5 text-ink-muted">{step.done ? step.description : step.benefit}</p>
              </div>
              {step.id !== 'agency' && step.id !== 'admin' ? (
                <Link
                  href={step.href}
                  className={cn(
                    'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-control px-3 text-[12.5px] font-semibold focus-ring',
                    step.done ? 'text-ink-muted hover:bg-surface-2 hover:text-ink' : 'bg-forest text-white hover:bg-forest-700',
                  )}
                >
                  {step.done ? 'Review' : step.actionLabel}
                  {step.done ? null : <ArrowRight className="size-3.5" aria-hidden="true" />}
                </Link>
              ) : null}
            </div>
          </li>
        ))}
      </ol>

      {compact && state.next ? (
        <p className="mt-4 text-[12.5px] text-ink-faint">
          Next up: <span className="font-semibold text-ink">{state.next.title}</span>. You can hide this and finish later from Settings.
        </p>
      ) : null}
    </Card>
  )
}

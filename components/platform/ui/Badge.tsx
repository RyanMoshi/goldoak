import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export type BadgeTone = 'neutral' | 'forest' | 'gold' | 'success' | 'warning' | 'error' | 'info'

const tones: Record<BadgeTone, string> = {
  neutral: 'bg-surface-2 text-ink-muted border-line-strong',
  forest: 'bg-forest-100 text-forest border-forest-100',
  gold: 'bg-gold-100 text-gold-700 border-gold-100',
  success: 'bg-success/10 text-success border-success/25',
  warning: 'bg-warning/10 text-warning border-warning/25',
  error: 'bg-error/10 text-error border-error/20',
  info: 'bg-info/10 text-info border-info/25',
}

interface BadgeProps {
  tone?: BadgeTone
  dot?: boolean
  mono?: boolean
  className?: string
  children: ReactNode
}

/** Status and identity chips. Square-ish corners; never a pill. Always carries a label. */
export function Badge({ tone = 'neutral', dot = false, mono = false, className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-[4px] border px-1.5 py-0.5 text-[11px] font-semibold leading-4 whitespace-nowrap',
        mono ? 'font-mono tracking-[0.04em]' : 'uppercase tracking-[0.06em]',
        tones[tone],
        className,
      )}
    >
      {dot ? <span aria-hidden="true" className="size-1.5 rounded-full bg-current" /> : null}
      {children}
    </span>
  )
}

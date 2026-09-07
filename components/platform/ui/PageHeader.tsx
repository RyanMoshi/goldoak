import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface PageHeaderProps {
  eyebrow: string
  title: string
  description?: string
  aside?: ReactNode
  className?: string
}

/** The heading block every workspace page starts with. */
export function PageHeader({ eyebrow, title, description, aside, className }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="min-w-0">
        <p className="label-caps flex items-center gap-2 text-gold-700">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-gold" />
          {eyebrow}
        </p>
        <h2 className="mt-2 font-serif text-[26px] font-medium leading-8 tracking-[-0.01em] text-forest sm:text-[32px] sm:leading-10">{title}</h2>
        {description ? <p className="mt-1 max-w-prose text-[14.5px] text-ink-muted">{description}</p> : null}
      </div>
      {aside ? <div className="shrink-0">{aside}</div> : null}
    </div>
  )
}

/** Inline success / error line under a form. */
export function StatusLine({ success, error, onDismiss }: { success?: string; error?: string; onDismiss?: () => void }) {
  if (!success && !error) return null
  return (
    <div role="status" className={cn('mt-4 flex items-start gap-2 rounded-control border px-3 py-2 text-[13px]', success ? 'border-success/25 bg-success/10 text-ink' : 'border-error/25 bg-error/10 text-error')}>
      <span className="flex-1 break-words">{success ?? error}</span>
      {onDismiss ? (
        <button type="button" onClick={onDismiss} aria-label="Dismiss" className="text-ink-muted hover:text-ink focus-ring rounded-control">
          ×
        </button>
      ) : null}
    </div>
  )
}

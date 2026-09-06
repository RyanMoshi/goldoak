'use client'

import { ArrowRight, RotateCcw, Sparkles, X } from 'lucide-react'
import Link from 'next/link'
import type { CommandResult } from '@/data/platform/ai'

export type CommandStatus = 'working' | 'done' | 'error'

interface Props {
  status: CommandStatus
  command: string
  result: CommandResult | null
  errorMessage?: string
  onClose: () => void
  onRetry: () => void
}

/** The assistant's answer as a structured note, not chat bubbles. */
export function AIResponsePanel({ status, command, result, errorMessage, onClose, onRetry }: Props) {
  return (
    <div role="status" aria-live="polite" className="p-3">
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-control bg-gold-100 text-gold-700">
          <Sparkles className="size-3.5" aria-hidden="true" strokeWidth={2} />
        </span>
        <p className="min-w-0 flex-1 truncate text-[12px] text-ink-muted">
          <span className="font-semibold text-ink">You asked:</span> {command}
        </p>
        <button type="button" onClick={onClose} aria-label="Close response" className="inline-flex size-7 shrink-0 items-center justify-center rounded-control text-ink-muted hover:bg-surface-2 hover:text-ink focus-ring">
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-3 border-l-2 border-gold bg-surface-3 px-3.5 py-3">
        {status === 'working' ? (
          <div className="flex items-center gap-2.5 py-1">
            <span className="flex items-center gap-1" aria-hidden="true">
              <span className="size-1.5 animate-pulse rounded-full bg-gold" />
              <span className="size-1.5 animate-pulse rounded-full bg-gold [animation-delay:150ms]" />
              <span className="size-1.5 animate-pulse rounded-full bg-gold [animation-delay:300ms]" />
            </span>
            <span className="text-[13px] text-ink-muted">Working through the workspace…</span>
          </div>
        ) : null}

        {status === 'error' ? (
          <div>
            <p className="text-sm font-semibold text-ink">That didn&apos;t go through.</p>
            <p className="mt-1 text-[13px] text-ink-muted">{errorMessage ?? 'Try again in a moment.'}</p>
            <button type="button" onClick={onRetry} className="mt-3 inline-flex items-center gap-1.5 rounded-control border border-line bg-surface px-2.5 py-1.5 text-[12.5px] font-semibold text-ink hover:border-ink-muted focus-ring">
              <RotateCcw className="size-3.5" aria-hidden="true" />
              Try again
            </button>
          </div>
        ) : null}

        {status === 'done' && result ? (
          <div>
            <p className="font-serif text-[15px] font-semibold leading-5 text-forest">{result.title}</p>
            <ul className="mt-2.5 divide-y divide-divider">
              {result.lines.map((line, i) => (
                <li key={i} className="flex items-baseline justify-between gap-4 py-1.5">
                  <span className="text-[13px] text-ink">{line.text}</span>
                  {line.detail ? <span className="shrink-0 text-right font-mono text-[11.5px] text-ink-muted">{line.detail}</span> : null}
                </li>
              ))}
            </ul>
            {result.actions.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {result.actions.map((action, i) => (
                  <Link
                    key={`${action.href}-${i}`}
                    href={action.href}
                    onClick={onClose}
                    className={
                      i === 0
                        ? 'inline-flex h-8 items-center gap-1.5 rounded-control bg-forest px-3 text-[12.5px] font-semibold text-white hover:bg-forest-700 focus-ring'
                        : 'inline-flex h-8 items-center gap-1.5 rounded-control border border-line bg-surface px-3 text-[12.5px] font-semibold text-ink hover:border-ink-muted focus-ring'
                    }
                  >
                    {action.label}
                    <ArrowRight className="size-3.5" aria-hidden="true" />
                  </Link>
                ))}
              </div>
            ) : null}
            <p className="mt-3 text-[11px] leading-4 text-ink-faint">{result.source}</p>
          </div>
        ) : null}
      </div>
    </div>
  )
}

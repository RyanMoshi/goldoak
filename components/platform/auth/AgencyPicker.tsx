'use client'

import { Building2, ChevronRight, Loader2 } from 'lucide-react'
import { useState, useTransition } from 'react'
import { chooseAgencyAction } from '@/lib/auth/actions'
import { cn } from '@/lib/cn'

export function AgencyPicker({ options, current }: { options: { id: string; name: string; role: string }[]; current: string }) {
  const [pending, startTransition] = useTransition()
  const [choosing, setChoosing] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function choose(id: string) {
    setError(null)
    setChoosing(id)
    startTransition(async () => {
      const result = await chooseAgencyAction(id)
      if (result?.error) {
        setError(result.error)
        setChoosing(null)
      }
    })
  }

  return (
    <div className="animate-fade-up">
      <p className="label-caps text-gold-700">Your agencies</p>
      <ul className="mt-4 space-y-2">
        {options.map((o) => (
          <li key={o.id}>
            <button type="button" onClick={() => choose(o.id)} disabled={pending} className={cn('flex min-h-[64px] w-full items-center gap-3 rounded-card border bg-surface px-4 py-3 text-left transition-colors hover:border-forest focus-ring disabled:opacity-60', o.id === current ? 'border-forest' : 'border-line')}>
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-forest text-gold">
                <Building2 className="size-5" aria-hidden="true" strokeWidth={1.75} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-bold text-ink">{o.name}</span>
                <span className="block text-[12.5px] text-ink-muted">{o.role}</span>
              </span>
              {choosing === o.id ? <Loader2 className="size-4 animate-spin text-ink-muted" aria-hidden="true" /> : <ChevronRight className="size-4 text-ink-faint" aria-hidden="true" />}
            </button>
          </li>
        ))}
      </ul>
      {error ? <p className="mt-3 text-[13px] text-error">{error}</p> : null}
    </div>
  )
}

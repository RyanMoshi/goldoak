'use client'

import { Clock3, CornerDownLeft, Sparkles } from 'lucide-react'
import type { CommandSuggestion } from '@/data/platform/ai'
import { cn } from '@/lib/cn'

export interface SuggestionOption {
  id: string
  text: string
  hint: string
  kind: 'recent' | 'suggestion'
}

export function toOptions(recent: string[], suggestions: CommandSuggestion[], query: string): SuggestionOption[] {
  const q = query.trim().toLowerCase()
  const recentOptions: SuggestionOption[] = q ? [] : recent.map((text, i) => ({ id: `recent-${i}`, text, hint: 'Recent', kind: 'recent' }))
  const suggestionOptions: SuggestionOption[] = suggestions
    .filter((s) => !q || s.text.toLowerCase().includes(q))
    .filter((s) => !recentOptions.some((r) => r.text === s.text))
    .map((s) => ({ id: s.id, text: s.text, hint: s.hint, kind: 'suggestion' }))
  return [...recentOptions, ...suggestionOptions]
}

interface Props {
  listboxId: string
  options: SuggestionOption[]
  highlightedIndex: number
  onHighlight: (index: number) => void
  onChoose: (option: SuggestionOption) => void
  onClearRecent?: () => void
  optionId: (index: number) => string
}

export function AICommandSuggestions({ listboxId, options, highlightedIndex, onHighlight, onChoose, onClearRecent, optionId }: Props) {
  const hasRecent = options.some((o) => o.kind === 'recent')
  return (
    <div id={listboxId} role="listbox" aria-label="Command suggestions" className="py-1.5">
      {options.length === 0 ? (
        <p className="px-3 py-3 text-[13px] text-ink-muted">
          No matching suggestion. Press <span className="font-semibold text-ink">Enter</span> to run what you typed.
        </p>
      ) : null}
      {options.map((option, index) => {
        const showHeading = index === 0 || options[index - 1].kind !== option.kind
        const highlighted = index === highlightedIndex
        return (
          <div key={option.id}>
            {showHeading ? (
              <div className="flex items-center justify-between px-3 pb-1 pt-2">
                <span className="label-caps text-ink-faint">{option.kind === 'recent' ? 'Recent' : 'Try'}</span>
                {option.kind === 'recent' && hasRecent && onClearRecent ? (
                  <button type="button" onClick={onClearRecent} className="rounded-control px-1 text-[11px] font-semibold text-ink-muted hover:text-ink focus-ring">
                    Clear
                  </button>
                ) : null}
              </div>
            ) : null}
            <div
              id={optionId(index)}
              role="option"
              aria-selected={highlighted}
              onMouseEnter={() => onHighlight(index)}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => onChoose(option)}
              className={cn(
                'mx-1.5 flex cursor-pointer items-center gap-2.5 rounded-control px-2 py-2 text-[13.5px] transition-colors',
                highlighted ? 'bg-forest text-white' : 'text-ink hover:bg-surface-2',
              )}
            >
              {option.kind === 'recent' ? (
                <Clock3 className={cn('size-4 shrink-0', highlighted ? 'text-gold' : 'text-ink-faint')} aria-hidden="true" strokeWidth={1.75} />
              ) : (
                <Sparkles className="size-4 shrink-0 text-gold" aria-hidden="true" strokeWidth={1.75} />
              )}
              <span className="min-w-0 flex-1 truncate">{option.text}</span>
              <span className={cn('shrink-0 text-[11px] font-semibold uppercase tracking-[0.06em]', highlighted ? 'text-white/70' : 'text-ink-faint')}>{option.hint}</span>
              {highlighted ? <CornerDownLeft className="size-3.5 shrink-0 text-white/70" aria-hidden="true" /> : null}
            </div>
          </div>
        )
      })}
    </div>
  )
}

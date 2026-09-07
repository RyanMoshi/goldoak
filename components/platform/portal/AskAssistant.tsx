'use client'

import { Bot, Send, UserRound } from 'lucide-react'
import { useEffect, useRef, useState, useTransition } from 'react'
import { Card } from '@/components/platform/ui/Card'
import { askAssistantAction } from '@/lib/portal/actions'
import { cn } from '@/lib/cn'
import type { Consultation } from '@/types/platform'

interface Turn {
  id: string
  role: 'user' | 'assistant'
  text: string
  handoff?: boolean
}

const SUGGESTIONS = ['What does comprehensive motor cover exclude?', 'Do I need WIBA for three employees?', 'How does a claim work, step by step?', 'What is the difference between group and individual medical?']

/** The consultation assistant on the web. Same brain as WhatsApp, same history. */
export function AskAssistant({ history, agencyName }: { history: Consultation[]; agencyName: string }) {
  const [turns, setTurns] = useState<Turn[]>(() => history.slice().reverse().flatMap((c) => [{ id: `${c.id}-q`, role: 'user' as const, text: c.question }, { id: `${c.id}-a`, role: 'assistant' as const, text: c.answer }]))
  const [draft, setDraft] = useState('')
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [turns.length])

  function ask(question: string) {
    const q = question.trim()
    if (!q || pending) return
    setError(null)
    setDraft('')
    setTurns((t) => [...t, { id: `${Date.now()}-q`, role: 'user', text: q }])
    startTransition(async () => {
      const result = await askAssistantAction(q)
      if (result.error) {
        setError(result.error)
        return
      }
      setTurns((t) => [...t, { id: `${Date.now()}-a`, role: 'assistant', text: result.answer ?? '', handoff: result.handoff }])
    })
  }

  return (
    <Card flush className="flex min-h-[60vh] flex-col">
      <ol className="flex-1 space-y-3 overflow-y-auto bg-canvas/60 px-4 py-4">
        {turns.length === 0 ? (
          <li className="rounded-card bg-surface p-4 text-[13.5px] text-ink-muted">
            <p className="font-semibold text-ink">Ask anything about insurance.</p>
            <p className="mt-1">What a cover includes, what a claim needs, what suits a business like yours. For a firm price or anything about a live claim, your {agencyName} adviser steps in.</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <li key={s}>
                  <button type="button" onClick={() => ask(s)} className="rounded-full border border-line bg-surface px-3 py-1.5 text-[12.5px] font-semibold text-forest hover:border-forest focus-ring">
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          </li>
        ) : null}
        {turns.map((t) => (
          <li key={t.id} className={cn('flex gap-2', t.role === 'user' ? 'justify-end' : 'justify-start')}>
            {t.role === 'assistant' ? (
              <span className="mt-1 inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-forest text-gold">
                <Bot className="size-3.5" aria-hidden="true" />
              </span>
            ) : null}
            <div className={cn('max-w-[85%] rounded-card px-3.5 py-2.5 text-[13.5px] leading-5 shadow-sm sm:max-w-[75%]', t.role === 'user' ? 'bg-forest text-white' : 'bg-surface text-ink')}>
              <p className="whitespace-pre-wrap break-words">{t.text}</p>
              {t.handoff ? <p className="mt-2 text-[12px] font-semibold text-gold-700">An adviser has been asked to follow up with you.</p> : null}
            </div>
            {t.role === 'user' ? (
              <span className="mt-1 inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-gold/20 text-gold-700">
                <UserRound className="size-3.5" aria-hidden="true" />
              </span>
            ) : null}
          </li>
        ))}
        {pending ? (
          <li className="flex gap-2">
            <span className="mt-1 inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-forest text-gold">
              <Bot className="size-3.5" aria-hidden="true" />
            </span>
            <div className="rounded-card bg-surface px-3.5 py-2.5 text-[13px] text-ink-muted shadow-sm">Thinking…</div>
          </li>
        ) : null}
        <div ref={endRef} />
      </ol>
      <form
        className="border-t border-line p-3"
        onSubmit={(e) => {
          e.preventDefault()
          ask(draft)
        }}
      >
        <label htmlFor="ask" className="sr-only">
          Your question
        </label>
        <div className="flex items-end gap-2">
          <textarea
            id="ask"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                ask(draft)
              }
            }}
            rows={2}
            maxLength={2000}
            placeholder="Type your question…"
            className="min-h-[44px] flex-1 resize-y rounded-control border border-line bg-surface px-3 py-2 text-[14px] text-ink placeholder:text-ink-faint focus-ring"
          />
          <button type="submit" disabled={pending || !draft.trim()} className="inline-flex h-11 items-center gap-2 rounded-control bg-forest px-4 text-sm font-semibold text-white hover:bg-forest-700 disabled:opacity-50 focus-ring">
            <Send className="size-4" aria-hidden="true" /> Ask
          </button>
        </div>
        {error ? <p className="mt-2 text-[13px] text-error">{error}</p> : null}
      </form>
    </Card>
  )
}

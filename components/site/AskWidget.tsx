'use client'

import { Bot, Send } from 'lucide-react'
import { useState } from 'react'
import { superAgentLink } from '@/lib/contact'

interface Turn {
  role: 'user' | 'assistant'
  text: string
}

const SUGGESTIONS = ['What does comprehensive motor cover?', 'Do I need WIBA for my staff?', 'How do claims work?']

/** Public "Talk to the AI" box on the website. Same assistant as WhatsApp, not personalised until you sign up. */
export function AskWidget({ agencyCode }: { agencyCode?: string }) {
  const [turns, setTurns] = useState<Turn[]>([])
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const wa = superAgentLink('Hi, I have a question about insurance')

  async function ask(question: string) {
    const q = question.trim()
    if (!q || busy) return
    setBusy(true)
    setError(null)
    setDraft('')
    setTurns((t) => [...t, { role: 'user', text: q }])
    try {
      const res = await fetch('/api/consult', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: q, agency: agencyCode }) })
      const data = (await res.json()) as { answer?: string; error?: string }
      if (!res.ok || !data.answer) throw new Error(data.error ?? 'No answer')
      setTurns((t) => [...t, { role: 'assistant', text: data.answer as string }])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'The assistant is unavailable right now.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="rounded-2xl border border-gold-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-gold-100 px-5 py-4">
        <span className="inline-flex size-10 items-center justify-center rounded-full bg-primary text-secondary">
          <Bot className="size-5" aria-hidden="true" />
        </span>
        <div>
          <p className="font-semibold text-text-headline">Talk to the AI</p>
          <p className="text-sm text-text-body">Insurance questions, answered in plain language. Free, no account needed.</p>
        </div>
      </div>
      <div className="max-h-80 space-y-3 overflow-y-auto px-5 py-4">
        {turns.length === 0 ? (
          <ul className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <li key={s}>
                <button type="button" onClick={() => ask(s)} className="rounded-full border border-gold-200 bg-gold-50 px-3 py-1.5 text-sm font-medium text-primary hover:border-secondary">
                  {s}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        {turns.map((t, i) => (
          <div key={i} className={t.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
            <p className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-6 ${t.role === 'user' ? 'bg-primary text-white' : 'bg-bg-section text-text-headline'}`}>{t.text}</p>
          </div>
        ))}
        {busy ? <p className="text-sm text-text-body">Thinking…</p> : null}
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
      </div>
      <form
        className="flex items-end gap-2 border-t border-gold-100 p-3"
        onSubmit={(e) => {
          e.preventDefault()
          ask(draft)
        }}
      >
        <label htmlFor="site-ask" className="sr-only">
          Your question
        </label>
        <textarea
          id="site-ask"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              ask(draft)
            }
          }}
          rows={1}
          maxLength={1000}
          placeholder="Ask about any cover…"
          className="min-h-[44px] flex-1 resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-text-headline focus:border-secondary focus:outline-none"
        />
        <button type="submit" disabled={busy || !draft.trim()} className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50">
          <Send className="size-4" aria-hidden="true" /> Ask
        </button>
      </form>
      <p className="px-5 pb-4 text-xs text-text-body">
        Prefer WhatsApp?{' '}
        <a href={wa} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary underline-offset-2 hover:underline">
          Message Super Agent on WhatsApp
        </a>
        . Sign up to get answers about your own cover.
      </p>
    </div>
  )
}

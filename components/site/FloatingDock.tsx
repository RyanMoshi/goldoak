'use client'

import { Bot, MessageCircle, Send, Sparkles, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import { contact } from '@/lib/contact'

/**
 * The two things a visitor should always be able to reach: a human on
 * WhatsApp, and the assistant.
 *
 * They live in one fixed dock so they can never overlap each other or the
 * page. On a phone the chat opens as a full sheet (a floating card at that
 * width is unusable); from `sm` up it is a panel above the buttons. The
 * conversation is kept for the session so a visitor can wander the site and
 * come back to it.
 */

interface Turn {
  role: 'user' | 'assistant'
  text: string
}

const STORAGE_KEY = 'goldoak-chat'
const WHATSAPP_MESSAGE = 'Hello GoldOak, I’d like to learn more about your insurance services.'

const SUGGESTIONS = ['What insurance do you offer?', 'How do claims work?', 'How do I get a quote?']

export function FloatingDock() {
  const [open, setOpen] = useState(false)
  const [turns, setTurns] = useState<Turn[]>([])
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const whatsapp = `https://wa.me/${contact.phoneRaw.replace(/\D/g, '')}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`

  // Bring the conversation back when the visitor returns to the site.
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY)
      if (saved) setTurns(JSON.parse(saved) as Turn[])
    } catch {
      /* private mode: start fresh */
    }
  }, [])

  useEffect(() => {
    try {
      if (turns.length) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(turns.slice(-20)))
    } catch {
      /* nothing to do */
    }
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [turns, busy])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    setTimeout(() => inputRef.current?.focus(), 120)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const ask = useCallback(
    async (question: string) => {
      const q = question.trim()
      if (!q || busy) return
      setBusy(true)
      setError(null)
      setDraft('')
      const history = turns.slice(-6)
      setTurns((t) => [...t, { role: 'user', text: q }])
      try {
        const res = await fetch('/api/consult', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: q, history }),
        })
        const data = (await res.json()) as { answer?: string; error?: string }
        if (!res.ok || !data.answer) throw new Error(data.error ?? 'No answer came back.')
        setTurns((t) => [...t, { role: 'assistant', text: data.answer as string }])
      } catch (e) {
        setError(e instanceof Error ? e.message : 'The assistant is unavailable right now.')
      } finally {
        setBusy(false)
      }
    },
    [busy, turns],
  )

  return (
    <>
      {/* The panel. Full sheet on a phone, card from sm up. */}
      {open ? (
        <div
          role="dialog"
          aria-modal="false"
          aria-label="Chat with the GoldOak assistant"
          className={cn(
            'fixed inset-x-0 bottom-0 top-0 z-[60] flex flex-col bg-surface',
            'sm:inset-auto sm:bottom-24 sm:right-5 sm:top-auto sm:h-[min(34rem,calc(100dvh-8rem))] sm:w-[23rem] sm:rounded-card sm:border sm:border-line sm:shadow-drawer',
          )}
        >
          <header className="flex items-center justify-between gap-3 rounded-t-card bg-forest px-4 py-3 text-white">
            <span className="flex min-w-0 items-center gap-2.5">
              <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-gold">
                <Sparkles className="size-4" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block text-[14px] font-bold leading-tight">GoldOak assistant</span>
                <span className="block text-[11.5px] text-white/70">Ask anything about cover</span>
              </span>
            </span>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close the chat" className="inline-flex size-9 items-center justify-center rounded-control text-white/70 hover:bg-white/10 hover:text-white focus-ring">
              <X className="size-5" aria-hidden="true" />
            </button>
          </header>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto bg-canvas px-4 py-4">
            {turns.length === 0 ? (
              <div className="space-y-3">
                <p className="text-[13.5px] leading-6 text-ink">
                  Hello. I can explain cover, walk you through a claim, or point you to the right person. What would you like to know?
                </p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => ask(s)}
                      className="rounded-full border border-line bg-surface px-3 py-1.5 text-[12.5px] font-semibold text-ink hover:border-forest hover:text-forest focus-ring"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {turns.map((t, i) => (
              <div key={i} className={cn('flex gap-2', t.role === 'user' ? 'justify-end' : 'justify-start')}>
                {t.role === 'assistant' ? (
                  <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-forest text-gold">
                    <Bot className="size-3" aria-hidden="true" />
                  </span>
                ) : null}
                <p
                  className={cn(
                    'max-w-[85%] whitespace-pre-wrap rounded-card px-3 py-2 text-[13.5px] leading-6',
                    t.role === 'user' ? 'bg-forest text-white' : 'border border-line bg-surface text-ink',
                  )}
                >
                  {t.text}
                </p>
              </div>
            ))}

            {busy ? (
              <div className="flex items-center gap-2" aria-live="polite">
                <span className="inline-flex size-6 items-center justify-center rounded-full bg-forest text-gold">
                  <Bot className="size-3" aria-hidden="true" />
                </span>
                <span className="typing-dots rounded-card border border-line bg-surface px-3 py-2.5" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
                <span className="sr-only">Thinking</span>
              </div>
            ) : null}

            {error ? (
              <p role="alert" className="rounded-control border border-error/25 bg-error/10 px-3 py-2 text-[12.5px] text-error">
                {error}{' '}
                <a href={whatsapp} target="_blank" rel="noreferrer" className="font-semibold underline">
                  Message us on WhatsApp instead
                </a>
                .
              </p>
            ) : null}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              ask(draft)
            }}
            className="flex items-end gap-2 border-t border-line bg-surface p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
          >
            <textarea
              ref={inputRef}
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
              placeholder={busy ? 'Thinking…' : 'Ask about cover, claims, anything…'}
              aria-label="Your question"
              className="max-h-28 min-h-[44px] flex-1 resize-none rounded-control border border-line bg-surface px-3 py-2.5 text-[16px] text-ink placeholder:text-ink-faint focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest sm:text-[14px]"
            />
            <button
              type="submit"
              disabled={busy || !draft.trim()}
              aria-label="Send"
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-control bg-forest text-white hover:bg-forest-700 focus-ring disabled:opacity-50"
            >
              <Send className="size-4" aria-hidden="true" />
            </button>
          </form>
          <p className="border-t border-divider bg-surface px-3 py-2 text-center text-[11px] leading-4 text-ink-faint">
            General guidance only, not a quotation or advice on your policy.
          </p>
        </div>
      ) : null}

      {/* The dock. One column, so the buttons can never sit on top of each other. */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2.5 pb-[env(safe-area-inset-bottom)] sm:bottom-5 sm:right-5">
        <a
          href={whatsapp}
          target="_blank"
          rel="noreferrer"
          aria-label="Chat with GoldOak on WhatsApp"
          className="group inline-flex size-13 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 focus-ring"
          style={{ width: '3.25rem', height: '3.25rem' }}
        >
          <MessageCircle className="size-6" aria-hidden="true" strokeWidth={2} />
        </a>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close the GoldOak assistant' : 'Ask the GoldOak assistant'}
          aria-expanded={open}
          className="inline-flex items-center justify-center rounded-full bg-forest text-gold shadow-lg transition-transform hover:scale-105 focus-ring"
          style={{ width: '3.25rem', height: '3.25rem' }}
        >
          {open ? <X className="size-6" aria-hidden="true" /> : <Sparkles className="size-6" aria-hidden="true" />}
        </button>
      </div>
    </>
  )
}

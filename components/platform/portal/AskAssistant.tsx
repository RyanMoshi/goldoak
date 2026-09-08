'use client'

import { Bot, RefreshCw, Send, UserRound } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Card } from '@/components/platform/ui/Card'
import { cn } from '@/lib/cn'
import type { ConversationMessage } from '@/types/platform'

const SUGGESTIONS = ['What does comprehensive motor cover exclude?', 'Do I need WIBA for three employees?', 'How does a claim work, step by step?', 'What is the difference between group and individual medical?']

interface Props {
  initialMessages: ConversationMessage[]
  initialPending: boolean
  agencyName: string
}

/**
 * The web assistant. The server owns the thread; this component only reads it
 * back and posts new questions. While a question is unanswered it polls, so a
 * refresh, a lost connection or returning days later shows the same thread.
 */
export function AskAssistant({ initialMessages, initialPending, agencyName }: Props) {
  const [messages, setMessages] = useState<ConversationMessage[]>(initialMessages)
  const [pending, setPending] = useState(initialPending)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [offline, setOffline] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const startedAt = useRef<number>(Date.now())

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/chat', { cache: 'no-store' })
      if (!res.ok) throw new Error(String(res.status))
      const data = (await res.json()) as { messages: ConversationMessage[]; pending: boolean }
      setMessages(data.messages)
      setPending(data.pending)
      setOffline(false)
      return data.pending
    } catch {
      setOffline(true)
      return true
    }
  }, [])

  // Poll while an answer is outstanding; also re-sync when the tab becomes visible again.
  useEffect(() => {
    if (!pending) return
    let cancelled = false
    const tick = async () => {
      if (cancelled) return
      const still = await refresh()
      if (still && !cancelled) setTimeout(tick, Date.now() - startedAt.current > 60_000 ? 8000 : 2500)
    }
    const t = setTimeout(tick, 2000)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [pending, refresh])

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') void refresh()
    }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('online', onVisible)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('online', onVisible)
    }
  }, [refresh])

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [messages.length, pending])

  async function ask(question: string) {
    const q = question.trim()
    if (!q || sending || pending) return
    setError(null)
    setSending(true)
    setDraft('')
    const optimistic: ConversationMessage = { id: `tmp-${Date.now()}`, phone: '', organizationId: null, userId: null, direction: 'in', role: 'user', body: q, at: new Date().toISOString() }
    setMessages((m) => [...m, optimistic])
    try {
      const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: q }) })
      const data = (await res.json()) as { id?: string; error?: string }
      if (!res.ok || !data.id) throw new Error(data.error ?? 'Could not send')
      startedAt.current = Date.now()
      setPending(true)
    } catch (e) {
      setMessages((m) => m.filter((x) => x.id !== optimistic.id))
      setDraft(q)
      setError(e instanceof Error ? e.message : 'Could not send your message. Check your connection and try again.')
    } finally {
      setSending(false)
    }
  }

  const waitingLong = pending && Date.now() - startedAt.current > 45_000

  return (
    <Card flush className="flex h-[calc(100dvh-14rem)] min-h-[420px] flex-col sm:h-[calc(100dvh-16rem)]">
      <ol className="flex-1 space-y-3 overflow-y-auto overscroll-contain bg-canvas/60 px-3 py-4 sm:px-4" aria-live="polite">
        {messages.length === 0 ? (
          <li className="rounded-card bg-surface p-4 text-[13.5px] text-ink-muted">
            <p className="font-semibold text-ink">Ask anything about insurance.</p>
            <p className="mt-1">What a cover includes, what a claim needs, what suits a business like yours. For a firm price or anything about a live claim, your {agencyName} adviser steps in.</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <li key={s}>
                  <button type="button" onClick={() => ask(s)} className="min-h-[36px] rounded-full border border-line bg-surface px-3 py-1.5 text-[12.5px] font-semibold text-forest hover:border-forest focus-ring">
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          </li>
        ) : null}
        {messages.map((m) => (
          <li key={m.id} className={cn('flex gap-2', m.role === 'user' ? 'justify-end' : 'justify-start')}>
            {m.role !== 'user' ? (
              <span className="mt-1 inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-forest text-gold">
                <Bot className="size-3.5" aria-hidden="true" />
              </span>
            ) : null}
            <div className={cn('max-w-[88%] rounded-card px-3.5 py-2.5 text-[13.5px] leading-5 shadow-sm sm:max-w-[75%]', m.role === 'user' ? 'bg-forest text-white' : 'bg-surface text-ink')}>
              <p className="whitespace-pre-wrap break-words">{m.body}</p>
              <p className={cn('mt-1 font-mono text-[10px]', m.role === 'user' ? 'text-white/60' : 'text-ink-faint')}>{new Date(m.at).toLocaleString('en-KE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            {m.role === 'user' ? (
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
            <div className="rounded-card bg-surface px-3.5 py-2.5 text-[13px] text-ink-muted shadow-sm">
              <span className="inline-flex items-center gap-2">
                <span className="typing-dots" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
                {waitingLong ? 'Still working on it. Your question is saved; the answer will appear here even if you leave.' : 'Super Agent is thinking…'}
              </span>
            </div>
          </li>
        ) : null}
        <div ref={endRef} />
      </ol>
      <form
        className="border-t border-line bg-surface p-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] sm:p-3"
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
              if (e.key === 'Enter' && !e.shiftKey && window.innerWidth > 640) {
                e.preventDefault()
                ask(draft)
              }
            }}
            rows={1}
            maxLength={2000}
            placeholder={pending ? 'Waiting for the answer…' : 'Type your question…'}
            className="min-h-[44px] max-h-40 flex-1 resize-y rounded-control border border-line bg-surface px-3 py-2.5 text-[16px] text-ink placeholder:text-ink-faint focus-ring sm:text-[14px]"
          />
          <button type="submit" disabled={sending || pending || !draft.trim()} className="inline-flex h-11 min-w-11 items-center justify-center gap-2 rounded-control bg-forest px-3 text-sm font-semibold text-white hover:bg-forest-700 disabled:opacity-50 focus-ring sm:px-4" aria-label="Send">
            {sending ? <RefreshCw className="size-4 animate-spin" aria-hidden="true" /> : <Send className="size-4" aria-hidden="true" />}
            <span className="hidden sm:inline">{sending ? 'Sending…' : 'Ask'}</span>
          </button>
        </div>
        {error ? <p className="mt-2 text-[13px] text-error">{error}</p> : null}
        {offline ? (
          <p className="mt-2 flex items-center gap-2 text-[12.5px] text-warning">
            Connection lost. Reconnecting…
            <button type="button" onClick={() => void refresh()} className="font-semibold underline underline-offset-2">
              Retry now
            </button>
          </p>
        ) : null}
      </form>
    </Card>
  )
}

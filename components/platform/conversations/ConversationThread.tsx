'use client'

import Link from 'next/link'
import { ArrowLeft, Bot, Send, UserRound } from 'lucide-react'
import { useEffect, useRef, useState, useTransition } from 'react'
import { Badge } from '@/components/platform/ui/Badge'
import { Button } from '@/components/platform/ui/Button'
import { Card } from '@/components/platform/ui/Card'
import { StatusLine } from '@/components/platform/ui/PageHeader'
import { replyConversationAction, resumeAssistantAction, takeOverConversationAction, type ActionState } from '@/lib/agency/actions'
import { cn } from '@/lib/cn'
import { formatPhone, relativeTime } from '@/lib/format'
import type { ConversationMessage, ConversationRow } from '@/types/platform'

/** One WhatsApp chat: the transcript, who has it, and a reply box that sends on WhatsApp. */
export function ConversationThread({ contact, messages }: { contact: ConversationRow; messages: ConversationMessage[] }) {
  const [state, setState] = useState<ActionState>({})
  const [pending, startTransition] = useTransition()
  const [draft, setDraft] = useState('')
  const endRef = useRef<HTMLDivElement>(null)
  const name = contact.clientName ?? contact.userName ?? contact.displayName ?? formatPhone(contact.phone)

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [messages.length])

  function send() {
    const text = draft.trim()
    if (!text) return
    setState({})
    startTransition(async () => {
      const result = await replyConversationAction(contact.phone, text)
      setState(result)
      if (result.success) setDraft('')
    })
  }

  function resume() {
    if (!window.confirm('Hand this chat back to the assistant? It will reply to the person again.')) return
    startTransition(async () => setState(await resumeAssistantAction(contact.phone)))
  }

  function takeOver() {
    startTransition(async () => setState(await takeOverConversationAction(contact.phone)))
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="lg:col-span-8">
        <Card flush className="flex min-h-[60vh] flex-col">
          <div className="flex items-center gap-3 border-b border-line px-4 py-3">
            <Link href="/agency/conversations" className="inline-flex size-9 items-center justify-center rounded-control text-ink-muted hover:bg-surface-2 hover:text-ink focus-ring" aria-label="Back to conversations">
              <ArrowLeft className="size-4" aria-hidden="true" />
            </Link>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-bold text-ink">{name}</p>
              <p className="truncate font-mono text-[11.5px] text-ink-muted">{formatPhone(contact.phone)}</p>
            </div>
            {contact.mode === 'human' ? <Badge tone="gold" dot>{contact.assignedName ? `With ${contact.assignedName.split(' ')[0]}` : 'Waiting for a person'}</Badge> : <Badge tone="forest" dot>Assistant</Badge>}
          </div>

          <ol className="flex-1 space-y-3 overflow-y-auto bg-canvas/60 px-4 py-4">
            {messages.map((m) => {
              const mine = m.direction === 'out'
              return (
                <li key={m.id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
                  <div className={cn('max-w-[85%] rounded-card px-3.5 py-2.5 text-[13.5px] leading-5 shadow-sm sm:max-w-[70%]', mine ? (m.role === 'agent' ? 'bg-forest text-white' : m.role === 'system' ? 'bg-surface-2 text-ink-muted' : 'bg-gold/15 text-ink') : 'bg-surface text-ink')}>
                    <p className="whitespace-pre-wrap break-words">{m.body}</p>
                    <p className={cn('mt-1 font-mono text-[10.5px]', mine ? (m.role === 'agent' ? 'text-white/60' : 'text-ink-faint') : 'text-ink-faint')}>
                      {m.role === 'agent' ? 'Adviser' : m.role === 'assistant' ? 'Assistant' : m.role === 'system' ? 'System' : name} · {relativeTime(m.at)}
                    </p>
                  </div>
                </li>
              )
            })}
            {messages.length === 0 ? <li className="py-8 text-center text-[13px] text-ink-muted">No messages yet.</li> : null}
            <div ref={endRef} />
          </ol>

          <div className="border-t border-line p-3">
            <label htmlFor="reply" className="sr-only">
              Reply on WhatsApp
            </label>
            <div className="flex items-end gap-2">
              <textarea
                id="reply"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) send()
                }}
                rows={2}
                placeholder={contact.mode === 'human' ? 'Write your reply. It goes to WhatsApp as you.' : 'Replying takes the chat over from the assistant.'}
                className="min-h-[44px] flex-1 resize-y rounded-control border border-line bg-surface px-3 py-2 text-[14px] text-ink placeholder:text-ink-faint focus-ring"
              />
              <Button variant="forest" onClick={send} disabled={pending || !draft.trim()} className="h-11">
                <Send className="size-4" aria-hidden="true" /> Send
              </Button>
            </div>
            <StatusLine success={state.success} error={state.error} onDismiss={() => setState({})} />
          </div>
        </Card>
      </div>

      <aside className="space-y-4 lg:col-span-4">
        <Card>
          <p className="label-caps text-ink-muted">Who has this chat</p>
          <div className="mt-3 flex items-center gap-3">
            <span className={cn('inline-flex size-10 items-center justify-center rounded-full', contact.mode === 'human' ? 'bg-gold/15 text-gold-700' : 'bg-forest-100 text-forest')}>
              {contact.mode === 'human' ? <UserRound className="size-5" aria-hidden="true" strokeWidth={1.75} /> : <Bot className="size-5" aria-hidden="true" strokeWidth={1.75} />}
            </span>
            <div className="min-w-0">
              <p className="text-[14px] font-bold text-ink">{contact.mode === 'human' ? (contact.assignedName ?? 'Nobody yet') : 'Super Agent assistant'}</p>
              <p className="text-[12.5px] text-ink-muted">{contact.mode === 'human' ? `Since ${contact.handoffAt ? relativeTime(contact.handoffAt) : 'now'}. The assistant stays quiet.` : contact.workflow ? `Currently: ${contact.workflow}` : 'Answering from the menu.'}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {contact.mode === 'human' ? (
              <Button variant="outline" size="sm" onClick={resume} disabled={pending}>
                Hand back to assistant
              </Button>
            ) : (
              <Button variant="primary" size="sm" onClick={takeOver} disabled={pending}>
                Take over this chat
              </Button>
            )}
          </div>
        </Card>

        <Card>
          <p className="label-caps text-ink-muted">Person</p>
          <dl className="mt-3 space-y-2 text-[13px]">
            <Row label="WhatsApp name" value={contact.displayName ?? '—'} />
            <Row label="Account" value={contact.userName ?? 'Not registered'} />
            <Row label="Client record" value={contact.clientName ?? '—'} />
            <Row label="First contact" value={relativeTime(contact.createdAt)} />
            <Row label="Messages received" value={String(contact.inboundCount)} />
          </dl>
          {contact.clientId ? (
            <Link href={`/agency/clients/${contact.clientId}`} className="mt-4 inline-flex h-9 items-center rounded-control border border-line px-3 text-[13px] font-semibold text-ink hover:border-ink-muted focus-ring">
              Open client record
            </Link>
          ) : null}
        </Card>
      </aside>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="truncate text-right font-medium text-ink">{value}</dd>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { MessagesSquare, Send } from 'lucide-react'
import { useState, useTransition } from 'react'
import { Badge } from '@/components/platform/ui/Badge'
import { Card } from '@/components/platform/ui/Card'
import { EmptyState } from '@/components/platform/ui/EmptyState'
import { StatusLine } from '@/components/platform/ui/PageHeader'
import { answerEnquiryAction, type ActionState } from '@/lib/agency/actions'
import { formatPhone, relativeTime } from '@/lib/format'
import type { EnquiryRow } from '@/types/platform'

/** Enquiries from WhatsApp and the portal. Answer here; the reply reaches the person where they are. */
export function Enquiries({ enquiries }: { enquiries: EnquiryRow[] }) {
  const [state, setState] = useState<ActionState>({})
  const [pending, startTransition] = useTransition()
  const [drafts, setDrafts] = useState<Record<string, string>>({})

  if (!enquiries.length) {
    return (
      <Card flush>
        <EmptyState icon={MessagesSquare} title="No enquiries yet" description="When someone sends an enquiry on WhatsApp (reply 4) or from their portal, it appears here with a reference." />
      </Card>
    )
  }

  function answer(id: string) {
    const text = drafts[id] ?? ''
    startTransition(async () => {
      const result = await answerEnquiryAction(id, text)
      setState(result)
      if (result.success) setDrafts((d) => ({ ...d, [id]: '' }))
    })
  }

  return (
    <div className="space-y-4">
      <StatusLine success={state.success} error={state.error} onDismiss={() => setState({})} />
      <ul className="grid gap-3">
        {enquiries.map((e) => (
          <li key={e.id}>
            <Card>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[14px] font-bold text-ink">{e.subject}</span>
                <Badge tone="gold" mono>
                  {e.reference}
                </Badge>
                <Badge tone={e.status === 'open' ? 'warning' : e.status === 'answered' ? 'success' : 'neutral'} dot>
                  {e.status === 'open' ? 'Waiting for a reply' : e.status}
                </Badge>
              </div>
              <p className="mt-1 text-[12.5px] text-ink-muted">
                {e.clientName ? (
                  <Link href={`/agency/clients/${e.clientId}`} className="font-semibold text-forest hover:underline">
                    {e.clientName}
                  </Link>
                ) : e.phone ? (
                  formatPhone(e.phone)
                ) : (
                  'Unknown'
                )}{' '}
                · via {e.channel} · {relativeTime(e.createdAt)}
              </p>
              <p className="mt-3 whitespace-pre-wrap text-[13.5px] text-ink">{e.body}</p>
              {e.answer ? (
                <div className="mt-3 rounded-control border-l-2 border-gold bg-gold/5 px-3 py-2 text-[13px] text-ink">
                  <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-gold-700">Answer{e.answeredAt ? ` · ${relativeTime(e.answeredAt)}` : ''}</p>
                  <p className="mt-1 whitespace-pre-wrap">{e.answer}</p>
                </div>
              ) : null}
              {e.status === 'open' ? (
                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
                  <textarea value={drafts[e.id] ?? ''} onChange={(ev) => setDrafts({ ...drafts, [e.id]: ev.target.value })} rows={2} placeholder="Write your answer. It goes to WhatsApp and the portal." className="min-h-[44px] flex-1 resize-y rounded-control border border-line bg-surface px-3 py-2 text-[13.5px] focus-ring" />
                  <button type="button" disabled={pending || !(drafts[e.id] ?? '').trim()} onClick={() => answer(e.id)} className="inline-flex h-10 items-center gap-1.5 rounded-control bg-forest px-4 text-[13px] font-semibold text-white hover:bg-forest-700 disabled:opacity-50 focus-ring">
                    <Send className="size-4" aria-hidden="true" /> Send answer
                  </button>
                </div>
              ) : null}
            </Card>
          </li>
        ))}
      </ul>
    </div>
  )
}

import Link from 'next/link'
import { Bot, MessageSquare, UserRound } from 'lucide-react'
import { Badge } from '@/components/platform/ui/Badge'
import { Card } from '@/components/platform/ui/Card'
import { EmptyState } from '@/components/platform/ui/EmptyState'
import { cn } from '@/lib/cn'
import { formatPhone, relativeTime } from '@/lib/format'
import type { ConversationRow } from '@/types/platform'

/** Every WhatsApp contact of the agency; the ones waiting for a person first. */
export function ConversationList({ rows, basePath = '/agency/conversations', showOrganization = false }: { rows: ConversationRow[]; basePath?: string; showOrganization?: boolean }) {
  if (!rows.length) {
    return (
      <Card flush>
        <EmptyState icon={MessageSquare} title="No conversations yet" description="When someone messages the Super Agent number and reaches your agency, the chat appears here." />
      </Card>
    )
  }
  const waiting = rows.filter((r) => r.mode === 'human')
  const others = rows.filter((r) => r.mode !== 'human')
  return (
    <div className="space-y-6">
      {waiting.length ? <Section title="Waiting for a person" count={waiting.length} rows={waiting} basePath={basePath} showOrganization={showOrganization} tone="gold" /> : null}
      <Section title={waiting.length ? 'Handled by the assistant' : 'All conversations'} count={others.length} rows={others} basePath={basePath} showOrganization={showOrganization} tone="neutral" />
    </div>
  )
}

function Section({ title, count, rows, basePath, showOrganization, tone }: { title: string; count: number; rows: ConversationRow[]; basePath: string; showOrganization: boolean; tone: 'gold' | 'neutral' }) {
  return (
    <Card as="section" flush>
      <div className="flex items-center justify-between px-5 pb-3 pt-5">
        <h2 className="font-serif text-[17px] font-semibold leading-6 text-forest">{title}</h2>
        <Badge tone={tone === 'gold' ? 'gold' : 'neutral'}>{count}</Badge>
      </div>
      <ul className="divide-y divide-divider border-t border-line">
        {rows.map((r) => {
          const name = r.clientName ?? r.userName ?? r.displayName ?? formatPhone(r.phone)
          return (
            <li key={r.phone}>
              <Link href={`${basePath}/${r.phone}`} className="flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-surface-3 focus-ring">
                <span className={cn('mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full', r.mode === 'human' ? 'bg-gold/15 text-gold-700' : 'bg-forest-100 text-forest')}>
                  {r.mode === 'human' ? <UserRound className="size-4" aria-hidden="true" strokeWidth={1.75} /> : <Bot className="size-4" aria-hidden="true" strokeWidth={1.75} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-[14px] font-bold text-ink">{name}</span>
                    {r.mode === 'human' ? <Badge tone="gold" dot>{r.assignedName ? `With ${r.assignedName.split(' ')[0]}` : 'Waiting'}</Badge> : r.workflow ? <Badge tone="info">{r.workflow === 'consult' ? 'Asking questions' : `In ${r.workflow}`}</Badge> : null}
                    {!r.userId ? <Badge>Not registered</Badge> : null}
                    {showOrganization ? <Badge tone={r.organizationName ? 'forest' : 'error'}>{r.organizationName ?? 'Unrouted'}</Badge> : null}
                  </span>
                  <span className="mt-0.5 block truncate text-[13px] text-ink-muted">{r.lastMessage ?? 'No messages yet'}</span>
                  <span className="mt-0.5 block font-mono text-[11px] text-ink-faint">
                    {formatPhone(r.phone)} · {r.lastMessageAt ? relativeTime(r.lastMessageAt) : relativeTime(r.updatedAt)} · {r.inboundCount} received
                  </span>
                </span>
              </Link>
            </li>
          )
        })}
        {rows.length === 0 ? <li className="px-5 py-6 text-[13px] text-ink-muted">Nothing here right now.</li> : null}
      </ul>
    </Card>
  )
}

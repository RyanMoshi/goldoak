'use client'

import { useState, useTransition } from 'react'
import { Badge } from '@/components/platform/ui/Badge'
import { Card, CardHeader } from '@/components/platform/ui/Card'
import { StatusLine } from '@/components/platform/ui/PageHeader'
import { assignConversationAction, type AdminActionState } from '@/lib/admin/actions'
import { formatPhone, relativeTime } from '@/lib/format'
import type { ConversationRow, Organization } from '@/types/platform'

/** Super admin sees every WhatsApp contact and can route the unassigned ones to an agency. */
export function AdminConversations({ rows, organizations }: { rows: ConversationRow[]; organizations: Organization[] }) {
  const [state, setState] = useState<AdminActionState>({})
  const [pending, startTransition] = useTransition()

  function route(phone: string, organizationId: string) {
    if (!organizationId) return
    startTransition(async () => setState(await assignConversationAction(phone, organizationId)))
  }

  return (
    <Card as="section" flush>
      <div className="px-5 pb-3 pt-5">
        <CardHeader title="All WhatsApp conversations" description="Unrouted chats first. Routing a chat links the number to that agency; the person then sees that agency's menu." />
        <StatusLine success={state.success} error={state.error} onDismiss={() => setState({})} />
      </div>
      <ul className="divide-y divide-divider border-t border-line">
        {rows.map((r) => {
          const name = r.clientName ?? r.userName ?? r.displayName ?? formatPhone(r.phone)
          return (
            <li key={r.phone} className="flex flex-col gap-2 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[14px] font-bold text-ink">{name}</span>
                  <Badge tone={r.organizationName ? 'forest' : 'error'}>{r.organizationName ?? 'Unrouted'}</Badge>
                  {r.mode === 'human' ? <Badge tone="gold" dot>Waiting for a person</Badge> : null}
                  {!r.userId ? <Badge>Not registered</Badge> : null}
                </div>
                <p className="truncate text-[13px] text-ink-muted">{r.lastMessage ?? 'No messages yet'}</p>
                <p className="font-mono text-[11px] text-ink-faint">
                  {formatPhone(r.phone)} · {relativeTime(r.lastMessageAt ?? r.updatedAt)} · {r.inboundCount} received
                </p>
              </div>
              <label className="flex shrink-0 items-center gap-2 text-[12.5px] text-ink-muted">
                Route to
                <select defaultValue={r.organizationId ?? ''} disabled={pending} onChange={(e) => route(r.phone, e.target.value)} className="h-8 rounded-control border border-line bg-surface px-2 text-[12.5px] font-semibold text-ink focus-ring">
                  <option value="">Choose agency…</option>
                  {organizations.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </label>
            </li>
          )
        })}
        {rows.length === 0 ? <li className="px-5 py-6 text-[13px] text-ink-muted">No WhatsApp conversations yet.</li> : null}
      </ul>
    </Card>
  )
}

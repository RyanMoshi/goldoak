import { Bell, MessageCircle } from 'lucide-react'
import { Card, CardHeader } from '@/components/platform/ui/Card'
import { EmptyState } from '@/components/platform/ui/EmptyState'
import { markUpdatesReadAction } from '@/lib/portal/actions'
import { cn } from '@/lib/cn'
import { relativeTime } from '@/lib/format'
import type { Notification } from '@/types/platform'

/** Everything we have told the client, with whether it also went to WhatsApp. */
export function UpdatesFeed({ items }: { items: Notification[] }) {
  const unread = items.filter((i) => !i.readAt).length
  return (
    <Card as="section" flush>
      <div className="flex items-start justify-between gap-3 px-5 pb-3 pt-5">
        <CardHeader title="Updates" description={unread ? `${unread} new` : 'You are up to date'} />
        {unread ? (
          <form action={markUpdatesReadAction}>
            <button type="submit" className="rounded-control text-[12.5px] font-semibold text-forest-500 hover:text-forest focus-ring">Mark all read</button>
          </form>
        ) : null}
      </div>
      {items.length === 0 ? (
        <EmptyState icon={Bell} title="No updates yet" description="Reminders, quote progress and claim updates appear here and on WhatsApp." className="py-6" />
      ) : (
        <ol className="divide-y divide-divider border-t border-line">
          {items.map((n) => (
            <li key={n.id} className={cn('px-5 py-3', !n.readAt && 'bg-surface-3')}>
              <div className="flex items-baseline justify-between gap-3">
                <p className={cn('text-[13.5px] text-ink', !n.readAt && 'font-bold')}>{n.title}</p>
                <time dateTime={n.createdAt} className="shrink-0 font-mono text-[11px] text-ink-faint">{relativeTime(n.createdAt)}</time>
              </div>
              <p className="mt-0.5 whitespace-pre-line text-[12.5px] leading-5 text-ink-muted">{n.body}</p>
              {n.whatsappStatus === 'sent' ? (
                <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-success">
                  <MessageCircle className="size-3" aria-hidden="true" /> Also sent on WhatsApp
                </p>
              ) : null}
            </li>
          ))}
        </ol>
      )}
    </Card>
  )
}

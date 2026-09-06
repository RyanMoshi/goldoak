import { Activity, FileCheck2, FileText, RefreshCw, Send, ShieldAlert, UserCheck, UserPlus, type LucideIcon } from 'lucide-react'
import { Card, CardHeader } from '@/components/platform/ui/Card'
import { EmptyState } from '@/components/platform/ui/EmptyState'
import { relativeTime } from '@/lib/format'
import type { ActivityItem, ActivityKind } from '@/types/platform'

const kindIcon: Record<ActivityKind, LucideIcon> = {
  'quote-received': FileText,
  'risk-profile': UserCheck,
  'proposal-sent': Send,
  'documents-uploaded': FileCheck2,
  renewal: RefreshCw,
  claim: ShieldAlert,
  signup: UserPlus,
}

export function RecentActivity({ items }: { items: ActivityItem[] }) {
  return (
    <Card as="section" flush aria-labelledby="recent-activity" className="animate-fade-up [animation-delay:240ms]">
      <div className="px-5 pb-3 pt-5">
        <CardHeader id="recent-activity" title="Recent activity" description="Across your clients and insurers." />
      </div>
      {items.length === 0 ? (
        <EmptyState icon={Activity} title="Nothing yet today" className="py-6" />
      ) : (
        <ol className="border-t border-line px-5 py-2">
          {items.map((item, index) => {
            const Icon = kindIcon[item.kind] ?? Activity
            const last = index === items.length - 1
            return (
              <li key={item.id} className="relative flex gap-3 py-2.5">
                {!last ? <span aria-hidden="true" className="absolute bottom-0 left-[13px] top-9 w-px bg-divider" /> : null}
                <span aria-hidden="true" className="relative z-10 inline-flex size-7 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-ink-muted">
                  <Icon className="size-3.5" strokeWidth={1.75} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13.5px] leading-5 text-ink">{item.title}</span>
                  <span className="block truncate text-[12.5px] text-ink-muted">{item.client}</span>
                </span>
                <time dateTime={item.at} className="shrink-0 pt-0.5 font-mono text-[11px] text-ink-faint">
                  {relativeTime(item.at)}
                </time>
              </li>
            )
          })}
        </ol>
      )}
    </Card>
  )
}

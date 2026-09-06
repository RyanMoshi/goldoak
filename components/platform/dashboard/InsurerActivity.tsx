import { Building2 } from 'lucide-react'
import { Badge, type BadgeTone } from '@/components/platform/ui/Badge'
import { Card, CardHeader } from '@/components/platform/ui/Card'
import { EmptyState } from '@/components/platform/ui/EmptyState'
import type { InsurerActivity as Row, InsurerActivityStatus } from '@/types/platform'

const statusMeta: Record<InsurerActivityStatus, { label: string; tone: BadgeTone }> = {
  awaiting: { label: 'Awaiting', tone: 'warning' },
  received: { label: 'Received', tone: 'success' },
  clarification: { label: 'Needs reply', tone: 'info' },
  ready: { label: 'Ready', tone: 'forest' },
}

function monogram(name: string): string {
  const words = name.split(/\s+/).filter(Boolean)
  if (words.length >= 2) return words.map((w) => w[0]).join('').slice(0, 3).toUpperCase()
  return name.slice(0, 3).toUpperCase()
}

export function InsurerActivity({ rows }: { rows: Row[] }) {
  return (
    <Card as="section" flush aria-labelledby="insurer-activity" className="animate-fade-up [animation-delay:200ms]">
      <div className="px-5 pb-3 pt-5">
        <CardHeader id="insurer-activity" title="Insurer activity" description={rows.length ? `${rows.length} desks active` : undefined} />
      </div>
      {rows.length === 0 ? (
        <EmptyState icon={Building2} title="No insurer activity" className="py-6" />
      ) : (
        <ul className="divide-y divide-divider border-t border-line">
          {rows.map((row) => {
            const status = statusMeta[row.status]
            return (
              <li key={row.insurer} className="flex items-center gap-3 px-5 py-3">
                <span aria-hidden="true" className="inline-flex h-8 w-9 shrink-0 items-center justify-center rounded-control bg-forest font-mono text-[10.5px] font-semibold tracking-wide text-gold">
                  {monogram(row.insurer)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13.5px] font-bold text-ink">{row.insurer}</span>
                  <span className="block truncate text-[12.5px] text-ink-muted">{row.summary}</span>
                </span>
                <Badge tone={status.tone}>{status.label}</Badge>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}

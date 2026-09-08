import Link from 'next/link'
import { FileText } from 'lucide-react'
import { Badge, type BadgeTone } from '@/components/platform/ui/Badge'
import { Card } from '@/components/platform/ui/Card'
import { EmptyState } from '@/components/platform/ui/EmptyState'
import { Money } from '@/components/platform/ui/Money'
import { formatShortDate, relativeTime } from '@/lib/format'
import type { QuoteRow } from '@/services/agency/workspace'
import type { QuoteStage } from '@/types/platform'

const stageMeta: Record<QuoteStage, { label: string; tone: BadgeTone }> = {
  requested: { label: 'With insurers', tone: 'warning' },
  compared: { label: 'Comparing', tone: 'info' },
  proposed: { label: 'Proposal out', tone: 'gold' },
  accepted: { label: 'Accepted', tone: 'success' },
  placed: { label: 'Placed', tone: 'success' },
  declined: { label: 'Declined', tone: 'neutral' },
}

const channelLabel: Record<string, string> = { web: 'Portal', whatsapp: 'WhatsApp', agency: 'Adviser' }

export function QuotesTable({ rows }: { rows: QuoteRow[] }) {
  if (!rows.length) {
    return (
      <Card flush>
        <EmptyState icon={FileText} title="No quote requests yet" description="Requests arrive from the portal, WhatsApp (reply 5) or the client record." />
      </Card>
    )
  }
  return (
    <>
      <ul className="grid grid-cols-[minmax(0,1fr)] gap-3 md:hidden">
        {rows.map((q) => {
          const meta = stageMeta[q.stage]
          const replied = q.submissions.filter((s) => s.status === 'received' || s.status === 'ready').length
          return (
            <li key={q.id}>
              <Link href={`/agency/clients/${q.clientId}`} className="block rounded-card border border-line bg-surface p-4 focus-ring hover:border-line-strong">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-bold text-ink">{q.clientName}</p>
                    <p className="text-[12.5px] text-ink-muted">
                      {q.product} · <span className="font-mono">{q.reference}</span>
                    </p>
                  </div>
                  <Badge tone={meta.tone} dot>
                    {meta.label}
                  </Badge>
                </div>
                <p className="mt-2 text-[12px] text-ink-muted">
                  {replied} of {q.submissions.length} insurers replied · {channelLabel[q.channel] ?? q.channel} · {relativeTime(q.updatedAt)}
                </p>
                {q.premiumEstimate ? <Money amount={q.premiumEstimate} className="mt-1 block text-[13px] text-forest" /> : null}
              </Link>
            </li>
          )
        })}
      </ul>
      <Card flush className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[760px] border-collapse text-[13.5px]">
          <thead>
            <tr className="border-b border-line text-left">
              <Th>Client</Th>
              <Th>Cover</Th>
              <Th>Reference</Th>
              <Th>Stage</Th>
              <Th>Insurers</Th>
              <Th className="text-right">Estimate</Th>
              <Th>Source</Th>
              <Th>Updated</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-divider">
            {rows.map((q) => {
              const meta = stageMeta[q.stage]
              const replied = q.submissions.filter((s) => s.status === 'received' || s.status === 'ready').length
              return (
                <tr key={q.id} className="hover:bg-surface-3">
                  <Td>
                    <Link href={`/agency/clients/${q.clientId}`} className="font-bold text-ink hover:underline focus-ring rounded-control">
                      {q.clientName}
                    </Link>
                  </Td>
                  <Td>{q.product}</Td>
                  <Td className="font-mono text-[12.5px] text-ink-muted">{q.reference}</Td>
                  <Td>
                    <Badge tone={meta.tone} dot>
                      {meta.label}
                    </Badge>
                  </Td>
                  <Td className="text-ink-muted">
                    {replied}/{q.submissions.length} replied
                  </Td>
                  <Td className="text-right">{q.premiumEstimate ? <Money amount={q.premiumEstimate} /> : <span className="text-ink-faint">—</span>}</Td>
                  <Td className="text-ink-muted">{channelLabel[q.channel] ?? q.channel}</Td>
                  <Td className="text-ink-muted" title={formatShortDate(q.updatedAt)}>
                    {relativeTime(q.updatedAt)}
                  </Td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>
    </>
  )
}

export function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-4 py-3 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-muted ${className}`}>{children}</th>
}

export function Td({ children, className = '', title }: { children: React.ReactNode; className?: string; title?: string }) {
  return (
    <td className={`px-4 py-3 align-middle ${className}`} title={title}>
      {children}
    </td>
  )
}

import Link from 'next/link'
import { ShieldAlert } from 'lucide-react'
import { Badge, type BadgeTone } from '@/components/platform/ui/Badge'
import { Card } from '@/components/platform/ui/Card'
import { EmptyState } from '@/components/platform/ui/EmptyState'
import { Money } from '@/components/platform/ui/Money'
import { Td, Th } from '@/components/platform/workspace/QuotesTable'
import { daysUntil, formatShortDate } from '@/lib/format'
import type { ClaimRow } from '@/services/agency/workspace'
import { CLAIM_STAGES, type ClaimStage } from '@/types/platform'

const tone: Record<ClaimStage, BadgeTone> = {
  notified: 'error',
  registered: 'warning',
  documenting: 'warning',
  'with-insurer': 'info',
  assessed: 'info',
  offer: 'gold',
  settled: 'success',
  closed: 'neutral',
}

export function ClaimsTable({ rows }: { rows: ClaimRow[] }) {
  if (!rows.length) {
    return (
      <Card flush>
        <EmptyState icon={ShieldAlert} title="No claims" description="Claims reported from the portal, WhatsApp (reply 6) or the client record appear here." />
      </Card>
    )
  }
  const label = (stage: ClaimStage) => CLAIM_STAGES.find((s) => s.id === stage)?.label ?? stage
  const due = (c: ClaimRow) => {
    if (!c.nextUpdateDue || c.stage === 'settled' || c.stage === 'closed') return null
    const d = daysUntil(c.nextUpdateDue)
    return d < 0 ? { text: `Update ${-d}d overdue`, tone: 'error' as BadgeTone } : d === 0 ? { text: 'Update due today', tone: 'warning' as BadgeTone } : { text: `Update in ${d}d`, tone: 'neutral' as BadgeTone }
  }
  return (
    <>
      <ul className="grid gap-3 md:hidden">
        {rows.map((c) => {
          const d = due(c)
          return (
            <li key={c.id}>
              <Link href={`/agency/clients/${c.clientId}`} className="block rounded-card border border-line bg-surface p-4 focus-ring hover:border-line-strong">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-bold text-ink">{c.clientName}</p>
                    <p className="text-[12.5px] text-ink-muted">
                      {c.product} · {c.insurer} · <span className="font-mono">{c.reference}</span>
                    </p>
                  </div>
                  <Badge tone={tone[c.stage]} dot>
                    {label(c.stage)}
                  </Badge>
                </div>
                <p className="mt-2 line-clamp-2 text-[12.5px] text-ink-muted">{c.description}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px] text-ink-muted">
                  <span>{c.daysOpen}d open</span>
                  {c.amount ? <Money amount={c.amount} compact className="text-ink" /> : null}
                  {d ? <Badge tone={d.tone}>{d.text}</Badge> : null}
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
      <Card flush className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[820px] border-collapse text-[13.5px]">
          <thead>
            <tr className="border-b border-line text-left">
              <Th>Client</Th>
              <Th>Claim</Th>
              <Th>Insurer</Th>
              <Th>Stage</Th>
              <Th>Reported</Th>
              <Th>Next update</Th>
              <Th className="text-right">Amount</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-divider">
            {rows.map((c) => {
              const d = due(c)
              return (
                <tr key={c.id} className="hover:bg-surface-3">
                  <Td>
                    <Link href={`/agency/clients/${c.clientId}`} className="font-bold text-ink hover:underline focus-ring rounded-control">
                      {c.clientName}
                    </Link>
                  </Td>
                  <Td>
                    <span className="block">{c.product}</span>
                    <span className="font-mono text-[12px] text-ink-muted">{c.reference}</span>
                  </Td>
                  <Td>{c.insurer}</Td>
                  <Td>
                    <Badge tone={tone[c.stage]} dot>
                      {label(c.stage)}
                    </Badge>
                  </Td>
                  <Td className="text-ink-muted">
                    {formatShortDate(c.notifiedAt)} · {c.daysOpen}d
                  </Td>
                  <Td>{d ? <Badge tone={d.tone}>{d.text}</Badge> : <span className="text-ink-faint">—</span>}</Td>
                  <Td className="text-right">{c.amount ? <Money amount={c.amount} /> : <span className="text-ink-faint">—</span>}</Td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>
    </>
  )
}

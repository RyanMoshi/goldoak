import Link from 'next/link'
import { RefreshCw } from 'lucide-react'
import { Badge, type BadgeTone } from '@/components/platform/ui/Badge'
import { Card } from '@/components/platform/ui/Card'
import { EmptyState } from '@/components/platform/ui/EmptyState'
import { Money } from '@/components/platform/ui/Money'
import { Td, Th } from '@/components/platform/workspace/QuotesTable'
import { formatShortDate } from '@/lib/format'
import type { RenewalRow } from '@/services/agency/workspace'

function window(days: number): { label: string; tone: BadgeTone } {
  if (days < 0) return { label: `Expired ${-days}d ago`, tone: 'error' }
  if (days === 0) return { label: 'Expires today', tone: 'error' }
  if (days <= 7) return { label: `${days} days`, tone: 'error' }
  if (days <= 30) return { label: `${days} days`, tone: 'warning' }
  if (days <= 45) return { label: `${days} days · review due`, tone: 'gold' }
  return { label: `${days} days`, tone: 'neutral' }
}

export function RenewalsTable({ rows }: { rows: RenewalRow[] }) {
  if (!rows.length) {
    return (
      <Card flush>
        <EmptyState icon={RefreshCw} title="Nothing renewing in the next 90 days" description="Policies appear here 90 days before expiry. Reminders go to clients at 30, 14, 7 and 1 days automatically." />
      </Card>
    )
  }
  return (
    <>
      <ul className="grid grid-cols-[minmax(0,1fr)] gap-3 md:hidden">
        {rows.map((p) => {
          const w = window(p.daysToExpiry)
          return (
            <li key={p.id}>
              <Link href={`/agency/clients/${p.clientId}`} className="block rounded-card border border-line bg-surface p-4 focus-ring hover:border-line-strong">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-bold text-ink">{p.clientName}</p>
                    <p className="text-[12.5px] text-ink-muted">
                      {p.product} · {p.insurer}
                    </p>
                  </div>
                  <Badge tone={w.tone} dot>
                    {w.label}
                  </Badge>
                </div>
                <p className="mt-2 text-[12px] text-ink-muted">
                  Expires {formatShortDate(p.expiryDate)} · <Money amount={p.premium} compact className="text-ink" />
                  /yr
                </p>
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
              <Th>Policy</Th>
              <Th>Insurer</Th>
              <Th>Expires</Th>
              <Th>Window</Th>
              <Th className="text-right">Premium</Th>
              <Th>Review</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-divider">
            {rows.map((p) => {
              const w = window(p.daysToExpiry)
              return (
                <tr key={p.id} className="hover:bg-surface-3">
                  <Td>
                    <Link href={`/agency/clients/${p.clientId}`} className="font-bold text-ink hover:underline focus-ring rounded-control">
                      {p.clientName}
                    </Link>
                  </Td>
                  <Td>
                    {p.product} <span className="font-mono text-[12px] text-ink-muted">{p.policyNumber}</span>
                  </Td>
                  <Td>{p.insurer}</Td>
                  <Td className="font-mono text-[12.5px]">{formatShortDate(p.expiryDate)}</Td>
                  <Td>
                    <Badge tone={w.tone} dot>
                      {w.label}
                    </Badge>
                  </Td>
                  <Td className="text-right">
                    <Money amount={p.premium} />
                  </Td>
                  <Td className="text-ink-muted">{p.hasTask ? 'On Today' : p.daysToExpiry <= 45 ? 'Opens tonight' : 'Not yet'}</Td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>
    </>
  )
}

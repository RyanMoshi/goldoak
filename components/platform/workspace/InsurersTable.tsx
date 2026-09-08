import { Building2 } from 'lucide-react'
import { Badge } from '@/components/platform/ui/Badge'
import { Card } from '@/components/platform/ui/Card'
import { EmptyState } from '@/components/platform/ui/EmptyState'
import { Money } from '@/components/platform/ui/Money'
import { Td, Th } from '@/components/platform/workspace/QuotesTable'
import type { InsurerRow } from '@/services/agency/workspace'

/** The panel as your own placements record it: premium, response record and claims conduct. */
export function InsurersTable({ rows }: { rows: InsurerRow[] }) {
  if (!rows.length) {
    return (
      <Card flush>
        <EmptyState icon={Building2} title="No insurers yet" description="Insurers appear as you record policies, send quote requests and register claims." />
      </Card>
    )
  }
  return (
    <>
      <ul className="grid grid-cols-[minmax(0,1fr)] gap-3 md:hidden">
        {rows.map((r) => (
          <li key={r.insurer} className="rounded-card border border-line bg-surface p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-[15px] font-bold text-ink">{r.insurer}</p>
              <Money amount={r.premium} compact className="text-[13px] text-forest" />
            </div>
            <dl className="mt-3 grid grid-cols-3 gap-2 text-[12px]">
              <div>
                <dt className="text-ink-faint">Policies</dt>
                <dd className="font-mono text-ink">{r.policies}</dd>
              </div>
              <div>
                <dt className="text-ink-faint">Awaiting</dt>
                <dd className="font-mono text-ink">{r.awaiting}</dd>
              </div>
              <div>
                <dt className="text-ink-faint">Turnaround</dt>
                <dd className="font-mono text-ink">{r.avgTurnaroundDays == null ? '—' : `${r.avgTurnaroundDays}d`}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
      <Card flush className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[820px] border-collapse text-[13.5px]">
          <thead>
            <tr className="border-b border-line text-left">
              <Th>Insurer</Th>
              <Th className="text-right">Policies</Th>
              <Th className="text-right">Premium in force</Th>
              <Th className="text-right">Quotes sent</Th>
              <Th>Response</Th>
              <Th className="text-right">Avg turnaround</Th>
              <Th>Claims</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-divider">
            {rows.map((r) => (
              <tr key={r.insurer} className="hover:bg-surface-3">
                <Td className="font-bold text-ink">{r.insurer}</Td>
                <Td className="text-right font-mono">{r.policies}</Td>
                <Td className="text-right">
                  <Money amount={r.premium} />
                </Td>
                <Td className="text-right font-mono">{r.submissions}</Td>
                <Td>
                  <span className="flex flex-wrap gap-1.5">
                    {r.awaiting ? <Badge tone="warning">{r.awaiting} awaiting</Badge> : null}
                    {r.received ? <Badge tone="success">{r.received} replied</Badge> : null}
                    {r.declined ? <Badge tone="neutral">{r.declined} declined</Badge> : null}
                    {!r.submissions ? <span className="text-ink-faint">—</span> : null}
                  </span>
                </Td>
                <Td className="text-right font-mono">{r.avgTurnaroundDays == null ? <span className="text-ink-faint">—</span> : `${r.avgTurnaroundDays}d`}</Td>
                <Td className="text-ink-muted">
                  {r.openClaims} open · {r.settledClaims} settled
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  )
}

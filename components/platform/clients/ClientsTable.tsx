import { ArrowRight, Users } from 'lucide-react'
import Link from 'next/link'
import { Badge, type BadgeTone } from '@/components/platform/ui/Badge'
import { Card } from '@/components/platform/ui/Card'
import { EmptyState } from '@/components/platform/ui/EmptyState'
import { Money } from '@/components/platform/ui/Money'
import { daysUntil, formatShortDate } from '@/lib/format'
import { JOURNEY_STAGES, type ClientListRow, type ClientType, type JourneyStage } from '@/types/platform'

const typeLabel: Record<ClientType, string> = { individual: 'Individual', sme: 'SME', corporate: 'Corporate' }

export function stageBadge(stage: JourneyStage): { label: string; tone: BadgeTone } {
  const index = JOURNEY_STAGES.findIndex((s) => s.id === stage)
  const label = `${index + 1} · ${JOURNEY_STAGES[index]?.label ?? stage}`
  if (stage === 'understand' || stage === 'solve') return { label, tone: 'gold' }
  if (stage === 'compare' || stage === 'implement') return { label, tone: 'info' }
  return { label, tone: 'success' }
}

/** Ledger-style client register. Square corners, hairline dividers, cards on phones. */
export function ClientsTable({ clients }: { clients: ClientListRow[] }) {
  if (clients.length === 0) {
    return (
      <Card flush>
        <EmptyState icon={Users} title="No clients yet" description="Clients appear here when they sign up on the website or when you add them." />
      </Card>
    )
  }

  return (
    <>
      {/* Phones: one card per client */}
      <ul className="grid gap-3 md:hidden">
        {clients.map((c) => {
          const stage = stageBadge(c.stage)
          return (
            <li key={c.id}>
              <Link href={`/agency/clients/${c.id}`} className="block rounded-card border border-line bg-surface p-4 focus-ring hover:border-line-strong">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-bold text-ink">{c.name}</p>
                    <p className="text-[12px] text-ink-muted">{typeLabel[c.type]}{c.adviserName ? ` · ${c.adviserName}` : ''}</p>
                  </div>
                  <Badge tone={stage.tone}>{stage.label}</Badge>
                </div>
                <dl className="mt-3 grid grid-cols-3 gap-2 text-[12px]">
                  <div><dt className="text-ink-faint">Policies</dt><dd className="font-mono text-ink">{c.policyCount}</dd></div>
                  <div><dt className="text-ink-faint">Quotes</dt><dd className="font-mono text-ink">{c.openQuoteCount}</dd></div>
                  <div><dt className="text-ink-faint">Claims</dt><dd className="font-mono text-ink">{c.openClaimCount}</dd></div>
                </dl>
                <div className="mt-3 flex items-center justify-between border-t border-divider pt-2 text-[12px] text-ink-muted">
                  <span>{c.nextExpiry ? `Next renewal ${formatShortDate(c.nextExpiry)}` : 'No policies in force'}</span>
                  <Money amount={c.annualPremium} compact className="text-ink" />
                </div>
              </Link>
            </li>
          )
        })}
      </ul>

      {/* Tablet and up: the register */}
      <div className="hidden overflow-x-auto rounded-card border border-line bg-surface md:block">
        <table className="w-full border-collapse text-[13.5px]">
          <thead>
            <tr className="bg-surface-2 text-left">
              <Th>Client</Th>
              <Th>Stage</Th>
              <Th className="text-right">Policies</Th>
              <Th className="text-right">Quotes</Th>
              <Th className="text-right">Claims</Th>
              <Th>Next renewal</Th>
              <Th className="text-right">Annual premium</Th>
              <Th><span className="sr-only">Open</span></Th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => {
              const stage = stageBadge(c.stage)
              const days = c.nextExpiry ? daysUntil(c.nextExpiry) : null
              return (
                <tr key={c.id} className="h-11 border-t border-divider hover:bg-surface-3">
                  <td className="px-4 py-2">
                    <Link href={`/agency/clients/${c.id}`} className="font-bold text-ink hover:underline focus-ring rounded-control">
                      {c.name}
                    </Link>
                    <span className="block text-[12px] text-ink-muted">{typeLabel[c.type]}{c.adviserName ? ` · ${c.adviserName}` : ''}</span>
                  </td>
                  <td className="px-4 py-2"><Badge tone={stage.tone}>{stage.label}</Badge></td>
                  <td className="px-4 py-2 text-right font-mono">{c.policyCount}</td>
                  <td className="px-4 py-2 text-right font-mono">{c.openQuoteCount}</td>
                  <td className="px-4 py-2 text-right font-mono">{c.openClaimCount}</td>
                  <td className="px-4 py-2">
                    {c.nextExpiry ? (
                      <span className={days !== null && days <= 30 ? 'font-semibold text-warning' : 'text-ink'}>
                        {formatShortDate(c.nextExpiry)}{days !== null ? <span className="ml-1 font-mono text-[11px] text-ink-faint">{days}d</span> : null}
                      </span>
                    ) : (
                      <span className="text-ink-faint">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right"><Money amount={c.annualPremium} className="text-[13px]" /></td>
                  <td className="px-3 py-2 text-right">
                    <Link href={`/agency/clients/${c.id}`} aria-label={`Open ${c.name}`} className="inline-flex size-8 items-center justify-center rounded-control text-ink-faint hover:bg-surface-2 hover:text-ink focus-ring">
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-muted ${className}`}>{children}</th>
}

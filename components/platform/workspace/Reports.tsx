import { BarChart3, FileText, MessageSquare, RefreshCw, ShieldAlert, Users, type LucideIcon } from 'lucide-react'
import { Card, CardHeader } from '@/components/platform/ui/Card'
import { Money } from '@/components/platform/ui/Money'
import { cn } from '@/lib/cn'
import { formatKESCompact } from '@/lib/format'
import type { ReportData } from '@/services/agency/workspace'

/** KPI tiles with tinted icon circles, then simple bar lists. All from live records. */
export function Reports({ data, downloadHref }: { data: ReportData; downloadHref: string }) {
  const kpis: { label: string; value: string; note: string; icon: LucideIcon; tone: string }[] = [
    { label: 'Premium in force', value: formatKESCompact(data.premiumInForce), note: `${data.policiesInForce} policies`, icon: BarChart3, tone: 'bg-forest-100 text-forest' },
    { label: 'Clients', value: String(data.clients), note: `${data.newClients30d} new in 30 days`, icon: Users, tone: 'bg-gold/15 text-gold-700' },
    { label: 'Quote conversion', value: data.conversion == null ? '—' : `${data.conversion}%`, note: `${data.quotesWon90d} of ${data.quotesRequested90d} in 90 days`, icon: FileText, tone: 'bg-info/10 text-info' },
    { label: 'Renewals · 90 days', value: String(data.renewalsDue90d), note: `${formatKESCompact(data.renewalPremium90d)} to retain`, icon: RefreshCw, tone: 'bg-warning/10 text-warning' },
    { label: 'Claims', value: String(data.openClaims), note: `${data.settledClaims90d} settled in 90 days`, icon: ShieldAlert, tone: 'bg-error/10 text-error' },
    { label: 'WhatsApp', value: String(data.conversations), note: `${data.waitingForHuman} waiting · ${data.consultations30d} questions answered`, icon: MessageSquare, tone: 'bg-success/10 text-success' },
  ]
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {kpis.map((k) => {
          const Icon = k.icon
          return (
            <Card key={k.label} className="p-4">
              <span className={cn('inline-flex size-9 items-center justify-center rounded-full', k.tone)}>
                <Icon className="size-4" aria-hidden="true" strokeWidth={1.75} />
              </span>
              <p data-numeric className="mt-3 font-serif text-[24px] font-bold leading-8 text-forest">
                {k.value}
              </p>
              <p className="label-caps mt-0.5 text-ink-muted">{k.label}</p>
              <p className="mt-1 text-[12px] text-ink-faint">{k.note}</p>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <BarList title="Premium by product" rows={data.byProduct.map((r) => ({ label: r.label, value: r.premium, note: `${r.count}` }))} money />
        <BarList title="Premium by insurer" rows={data.byInsurer.map((r) => ({ label: r.label, value: r.premium, note: `${r.count}` }))} money />
        <BarList title="Clients by journey stage" rows={data.byStage.map((r) => ({ label: r.label, value: r.count }))} />
        <BarList title="New clients by month" rows={data.signupsByMonth.map((r) => ({ label: r.month, value: r.count }))} />
      </div>

      <Card as="section">
        <CardHeader title="Agency report (PDF)" description="A one-page summary of these figures with your agency's branding, for partners and the board." aside={<a href={downloadHref} className="inline-flex h-9 items-center rounded-control bg-forest px-3 text-[13px] font-semibold text-white hover:bg-forest-700 focus-ring">Download PDF</a>} />
      </Card>
    </div>
  )
}

function BarList({ title, rows, money = false }: { title: string; rows: { label: string; value: number; note?: string }[]; money?: boolean }) {
  const max = Math.max(1, ...rows.map((r) => r.value))
  return (
    <Card as="section">
      <CardHeader title={title} level={3} />
      {rows.length === 0 ? (
        <p className="mt-4 text-[13px] text-ink-muted">No data yet.</p>
      ) : (
        <ol className="mt-4 space-y-2.5">
          {rows.map((r) => (
            <li key={r.label}>
              <div className="flex items-baseline justify-between gap-3 text-[13px]">
                <span className="min-w-0 truncate text-ink">{r.label}</span>
                <span className="shrink-0 font-mono text-[12.5px] text-ink-muted">
                  {money ? <Money amount={r.value} compact className="text-ink" /> : r.value}
                  {r.note ? ` · ${r.note}` : ''}
                </span>
              </div>
              <div className="mt-1 h-2 w-full overflow-hidden rounded-[3px] bg-surface-2">
                <div className="h-full rounded-[3px] bg-forest" style={{ width: `${Math.max(2, (r.value / max) * 100)}%` }} />
              </div>
            </li>
          ))}
        </ol>
      )}
    </Card>
  )
}

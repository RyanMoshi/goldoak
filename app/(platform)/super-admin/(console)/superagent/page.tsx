import type { Metadata } from 'next'
import Link from 'next/link'
import { Activity, AlertTriangle, Building2, Gauge, MessageSquare, Sparkles, ShieldQuestion } from 'lucide-react'
import { Badge } from '@/components/platform/ui/Badge'
import { Card, CardHeader } from '@/components/platform/ui/Card'
import { EmptyState } from '@/components/platform/ui/EmptyState'
import { requireSession } from '@/lib/auth/server'
import { relativeTime } from '@/lib/format'
import { aiModelLabel, aiVendor } from '@/lib/ai/provider'
import { agencyAiUsage, aiOverview, recentAiErrors } from '@/services/ai-insights'

export const metadata: Metadata = { title: 'Super Agent' }
export const dynamic = 'force-dynamic'

/** The AI product at a glance: is it answering, for whom, and how well. */
export default async function SuperAgentOverviewPage() {
  await requireSession('admin')
  const [overview, agencies, errors] = await Promise.all([aiOverview(), agencyAiUsage(), recentAiErrors(6)])
  const busiest = [...agencies].sort((a, b) => b.answers7d - a.answers7d).slice(0, 5)
  const peak = Math.max(1, ...overview.daily.map((d) => d.answers))

  const tiles = [
    { label: 'Answers · 24h', value: String(overview.answers24h), icon: Sparkles, hint: `${overview.answers7d} in 7 days` },
    { label: 'Success rate', value: `${Math.round(overview.successRate * 100)}%`, icon: Gauge, hint: overview.failures24h ? `${overview.failures24h} failed` : 'no failures' },
    { label: 'Median response', value: overview.medianLatencyMs == null ? '—' : `${(overview.medianLatencyMs / 1000).toFixed(1)}s`, icon: Activity, hint: 'model time, last 24h' },
    { label: 'Agencies served', value: String(overview.agenciesServed), icon: Building2, hint: `${overview.conversations7d} conversations in 7 days` },
  ]

  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <p className="label-caps flex items-center gap-2 text-gold-700">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-gold" />
          The AI product
        </p>
        <h1 className="mt-2 font-serif text-[26px] font-medium leading-8 text-forest sm:text-[34px] sm:leading-[2.75rem]">Super Agent</h1>
        <p className="mt-1 max-w-prose text-[14.5px] text-ink-muted">
          One assistant serving every agency on the platform. It takes its identity, products and tone from whichever agency it is answering for, and never carries one tenant&rsquo;s information into another&rsquo;s conversation.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map((t) => {
          const Icon = t.icon
          return (
            <Card key={t.label} className="p-4">
              <span className="inline-flex size-8 items-center justify-center rounded-full bg-gold/15 text-gold-700">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <p data-numeric className="mt-2.5 font-serif text-[24px] font-bold leading-8 text-forest">
                {t.value}
              </p>
              <p className="text-[12.5px] font-semibold text-ink">{t.label}</p>
              <p className="text-[12px] text-ink-faint">{t.hint}</p>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-7">
          <Card as="section">
            <CardHeader title="Answers over the last two weeks" description="Every model call the platform made, whoever it served." />
            {overview.daily.length === 0 ? (
              <p className="mt-5 text-[13.5px] text-ink-muted">No answers recorded yet. The chart fills in as agencies use the assistant.</p>
            ) : (
              <div className="mt-5 flex h-32 items-end gap-1.5" role="img" aria-label={`Daily answers: ${overview.daily.map((d) => `${d.day} ${d.answers}`).join(', ')}`}>
                {overview.daily.map((d) => (
                  <div key={d.day} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
                    <div className="flex w-full flex-1 items-end">
                      <div className="w-full rounded-t-sm bg-forest" style={{ height: `${Math.max(4, (d.answers / peak) * 100)}%` }} title={`${d.day}: ${d.answers} answers, ${d.failures} failed`} />
                    </div>
                    <span className="hidden text-[10px] text-ink-faint sm:block">{d.day.slice(8)}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card as="section" flush>
            <div className="p-5 pb-3">
              <CardHeader title="Busiest agencies" description="Answers in the last seven days." />
            </div>
            {busiest.length === 0 ? (
              <EmptyState icon={Building2} title="No agencies using the assistant yet" />
            ) : (
              <ul className="divide-y divide-divider border-t border-line">
                {busiest.map((a) => (
                  <li key={a.organizationId} className="flex items-center justify-between gap-3 px-5 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-bold text-ink">{a.name}</p>
                      <p className="text-[12px] text-ink-muted">
                        {a.assistantName ? `“${a.assistantName}”` : 'default assistant'} · {a.hasKnowledge ? 'knowledge set' : 'no knowledge yet'} · {a.channelConnected ? 'own number' : 'shared number'}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p data-numeric className="text-[15px] font-bold text-forest">
                        {a.answers7d}
                      </p>
                      <p className="text-[11.5px] text-ink-faint">{a.escalations7d} to a person</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-5">
          <Card as="section">
            <CardHeader title="Engine" description="What is answering right now." />
            <dl className="mt-4 space-y-2.5 text-[13.5px]">
              <Row label="Vendor" value={aiVendor()} />
              <Row label="Primary model" value={aiModelLabel()} />
              <Row label="Fallbacks used · 24h" value={String(overview.fallbacks24h)} />
              <Row label="Handed to a person · 24h" value={String(overview.escalations24h)} />
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/super-admin/superagent/configuration" className="inline-flex h-9 items-center rounded-control border border-line bg-surface px-3 text-[13px] font-semibold text-ink hover:border-ink-muted focus-ring">
                Configuration
              </Link>
              <Link href="/super-admin/superagent/knowledge" className="inline-flex h-9 items-center rounded-control border border-line bg-surface px-3 text-[13px] font-semibold text-ink hover:border-ink-muted focus-ring">
                Global knowledge
              </Link>
            </div>
          </Card>

          <Card as="section">
            <CardHeader title="Models in use" description="Last seven days." />
            {overview.byModel.length === 0 ? (
              <p className="mt-4 text-[13.5px] text-ink-muted">Nothing recorded yet.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {overview.byModel.map((m) => (
                  <li key={m.model} className="flex items-center justify-between gap-3 text-[13px]">
                    <span className="min-w-0 truncate font-mono text-[12px] text-ink">{m.model}</span>
                    <span className="shrink-0 text-ink-muted">
                      {m.count}
                      {m.failures ? <span className="text-error"> · {m.failures} failed</span> : null}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card as="section" flush>
            <div className="p-5 pb-3">
              <CardHeader title="Recent trouble" description="Failures and fallbacks, newest first." aside={<Link href="/super-admin/superagent/monitoring" className="text-[12.5px] font-semibold text-forest hover:underline focus-ring">All</Link>} />
            </div>
            {errors.length === 0 ? (
              <EmptyState icon={AlertTriangle} title="Nothing to report" description="No failures or fallbacks recorded." />
            ) : (
              <ul className="divide-y divide-divider border-t border-line">
                {errors.map((e, i) => (
                  <li key={`${e.at}-${i}`} className="px-5 py-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="min-w-0 text-[12.5px] text-ink">{e.error}</p>
                      <Badge tone="neutral">{e.kind}</Badge>
                    </div>
                    <p className="mt-0.5 text-[11.5px] text-ink-faint">
                      {e.organizationName ?? 'platform'} · {relativeTime(e.at)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      <Card as="section" className="border-gold/30 bg-gold/5">
        <div className="flex items-start gap-3">
          <ShieldQuestion className="mt-0.5 size-5 shrink-0 text-gold-700" aria-hidden="true" />
          <div>
            <p className="text-[14px] font-bold text-ink">Neutrality is enforced in the prompt, not by convention</p>
            <p className="mt-1 text-[13.5px] leading-6 text-ink-muted">
              The assistant is told, on every answer, to speak only for the agency it is serving, never to mention or compare another agency on the platform, and to describe itself as running on Super Agent rather than naming its owner. Agency knowledge is loaded per tenant; the shared layer below is the only thing every agency sees.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="min-w-0 truncate font-mono text-[12.5px] font-semibold text-ink">{value}</dd>
    </div>
  )
}

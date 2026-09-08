import type { Metadata } from 'next'
import { CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/platform/ui/Badge'
import { Card, CardHeader } from '@/components/platform/ui/Card'
import { EmptyState } from '@/components/platform/ui/EmptyState'
import { requireSession } from '@/lib/auth/server'
import { relativeTime } from '@/lib/format'
import { aiOverview, recentAiErrors } from '@/services/ai-insights'
import { jobStats, listJobs } from '@/services/jobs'

export const metadata: Metadata = { title: 'AI monitoring' }
export const dynamic = 'force-dynamic'

/** Errors, fallbacks and the background work the assistant depends on. */
export default async function SuperAgentMonitoringPage() {
  await requireSession('admin')
  const [overview, errors, stats, jobs] = await Promise.all([aiOverview(), recentAiErrors(40), jobStats(), listJobs('failed', 15)])

  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <p className="label-caps flex items-center gap-2 text-gold-700">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-gold" />
          Super Agent
        </p>
        <h1 className="mt-2 font-serif text-[26px] font-medium leading-8 text-forest sm:text-[32px] sm:leading-10">Monitoring</h1>
        <p className="mt-1 text-[14.5px] text-ink-muted">Failures, fallbacks and the queue that carries answers, emails and campaigns.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'Failures · 24h', value: String(overview.failures24h) },
          { label: 'Fallbacks · 24h', value: String(overview.fallbacks24h) },
          { label: 'Jobs queued', value: String(stats.queued) },
          { label: 'Jobs dead', value: String(stats.dead) },
        ].map((t) => (
          <Card key={t.label} className="p-4">
            <p className="label-caps text-ink-muted">{t.label}</p>
            <p data-numeric className="mt-1.5 font-serif text-[22px] font-bold leading-7 text-forest">
              {t.value}
            </p>
          </Card>
        ))}
      </div>

      <Card as="section" flush>
        <div className="p-5 pb-3">
          <CardHeader title="Model failures and fallbacks" description="A fallback means the primary model was busy and a second model answered — the person still got a reply." />
        </div>
        {errors.length === 0 ? (
          <EmptyState icon={CheckCircle2} title="Nothing to report" description="Every model call in the recorded window succeeded on the first model." />
        ) : (
          <ul className="divide-y divide-divider border-t border-line">
            {errors.map((e, i) => (
              <li key={`${e.at}-${i}`} className="flex flex-col gap-1 px-5 py-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-[13.5px] text-ink">{e.error}</p>
                  <p className="mt-0.5 text-[12px] text-ink-faint">
                    {e.organizationName ?? 'platform'} · {e.model ?? 'unknown model'} · {relativeTime(e.at)}
                  </p>
                </div>
                <Badge tone="neutral">{e.kind}</Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card as="section" flush>
        <div className="p-5 pb-3">
          <CardHeader title="Background work that failed" description="Retried automatically with backoff; dead jobs need a look." />
        </div>
        {jobs.length === 0 ? (
          <EmptyState icon={CheckCircle2} title="The queue is clean" description="No failed jobs recorded." />
        ) : (
          <ul className="divide-y divide-divider border-t border-line">
            {jobs.map((j) => (
              <li key={j.id} className="flex flex-col gap-1 px-5 py-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="font-mono text-[12.5px] font-semibold text-ink">{j.type}</p>
                  <p className="mt-0.5 text-[12px] text-ink-muted">{j.lastError ?? '—'}</p>
                </div>
                <div className="shrink-0 text-right">
                  <Badge tone={j.status === 'dead' ? 'error' : j.status === 'done' ? 'success' : 'gold'} dot>
                    {j.status}
                  </Badge>
                  <p className="mt-0.5 text-[11.5px] text-ink-faint">
                    {j.attempts} attempts · {relativeTime(j.createdAt)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}

'use client'

import { RefreshCw } from 'lucide-react'
import { useState, useTransition } from 'react'
import { Badge, type BadgeTone } from '@/components/platform/ui/Badge'
import { Card, CardHeader } from '@/components/platform/ui/Card'
import { StatusLine } from '@/components/platform/ui/PageHeader'
import { retryJobAction, type AdminActionState } from '@/lib/admin/actions'
import { relativeTime } from '@/lib/format'
import type { JobRow, JobStats } from '@/services/jobs'
import type { AuditEntry } from '@/types/platform'

const tone: Record<string, BadgeTone> = { queued: 'neutral', running: 'info', done: 'success', failed: 'warning', dead: 'error' }

/** Super admin: background jobs (with retry) and the platform audit trail. */
export function SystemPanel({ stats, jobs, audit }: { stats: JobStats; jobs: JobRow[]; audit: AuditEntry[] }) {
  const [state, setState] = useState<AdminActionState>({})
  const [pending, startTransition] = useTransition()
  const tiles = [
    { label: 'Queued', value: stats.queued },
    { label: 'Running', value: stats.running },
    { label: 'Done · 24h', value: stats.done24h },
    { label: 'Errors · 24h', value: stats.failed24h },
    { label: 'Dead', value: stats.dead },
  ]
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {tiles.map((t) => (
          <Card key={t.label} className="p-4">
            <p className="label-caps text-ink-muted">{t.label}</p>
            <p data-numeric className="mt-1.5 font-serif text-[26px] font-bold leading-8 text-forest">
              {t.value}
            </p>
          </Card>
        ))}
      </div>
      <StatusLine success={state.success} error={state.error} onDismiss={() => setState({})} />
      <Card as="section" flush>
        <div className="px-5 pb-3 pt-5">
          <CardHeader title="Background jobs" description="OCR, memory summaries, retried WhatsApp sends. Dead jobs exhausted their retries; retry after fixing the cause." />
        </div>
        <ul className="divide-y divide-divider border-t border-line">
          {jobs.map((j) => (
            <li key={j.id} className="flex flex-col gap-1 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[12.5px] font-semibold text-ink">{j.type}</span>
                  <Badge tone={tone[j.status] ?? 'neutral'}>{j.status}</Badge>
                  <span className="text-[12px] text-ink-faint">
                    {j.attempts} attempt{j.attempts === 1 ? '' : 's'} · {relativeTime(j.createdAt)}
                  </span>
                </div>
                {j.lastError ? <p className="truncate text-[12px] text-error">{j.lastError}</p> : null}
              </div>
              {j.status === 'dead' || j.status === 'failed' ? (
                <button type="button" disabled={pending} onClick={() => startTransition(async () => setState(await retryJobAction(j.id)))} className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-control border border-line px-2.5 text-[12.5px] font-semibold text-ink hover:border-ink-muted focus-ring disabled:opacity-60">
                  <RefreshCw className="size-3.5" aria-hidden="true" /> Retry
                </button>
              ) : null}
            </li>
          ))}
          {jobs.length === 0 ? <li className="px-5 py-6 text-[13px] text-ink-muted">No jobs yet.</li> : null}
        </ul>
      </Card>
      <Card as="section" flush>
        <div className="px-5 pb-3 pt-5">
          <CardHeader title="Audit trail" description="Sensitive actions across every agency." />
        </div>
        <ul className="divide-y divide-divider border-t border-line">
          {audit.map((e) => (
            <li key={e.id} className="px-5 py-2.5 text-[13px]">
              <span className="font-semibold text-ink">{e.action}</span>
              <span className="text-ink-muted">
                {' '}
                · {e.organizationId ?? 'platform'} · {e.target ?? ''} · {relativeTime(e.at)}
              </span>
            </li>
          ))}
          {audit.length === 0 ? <li className="px-5 py-6 text-[13px] text-ink-muted">Nothing recorded yet.</li> : null}
        </ul>
      </Card>
    </div>
  )
}

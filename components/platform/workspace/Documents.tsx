'use client'

import Link from 'next/link'
import { FileText, RefreshCw } from 'lucide-react'
import { useState, useTransition } from 'react'
import { Badge, type BadgeTone } from '@/components/platform/ui/Badge'
import { Card, CardHeader } from '@/components/platform/ui/Card'
import { EmptyState } from '@/components/platform/ui/EmptyState'
import { StatusLine } from '@/components/platform/ui/PageHeader'
import { retryUploadAction, reviewUploadAction, type ActionState } from '@/lib/agency/actions'
import { formatPhone, relativeTime } from '@/lib/format'
import type { UploadRow } from '@/types/platform'

const STATUS: Record<UploadRow['ocrStatus'], { label: string; tone: BadgeTone }> = {
  queued: { label: 'Waiting to be read', tone: 'neutral' },
  processing: { label: 'Reading', tone: 'info' },
  done: { label: 'Read', tone: 'success' },
  failed: { label: 'Could not read', tone: 'error' },
  skipped: { label: 'Not readable', tone: 'warning' },
}

const KINDS = ['id', 'policy', 'claim', 'vehicle', 'receipt', 'photo', 'form', 'other']

function fields(u: UploadRow): [string, string][] {
  const f = (u.confirmedData && !u.confirmedData.rejected ? u.confirmedData : (u.extracted?.fields as Record<string, unknown>)) ?? {}
  return Object.entries(f)
    .filter(([, v]) => v != null && String(v).trim())
    .slice(0, 10)
    .map(([k, v]) => [k.replace(/_/g, ' '), String(v)])
}

/** Every document sent to the agency, what the OCR read, and whether the person confirmed it. */
export function Documents({ uploads }: { uploads: UploadRow[] }) {
  const [state, setState] = useState<ActionState>({})
  const [pending, startTransition] = useTransition()
  const [open, setOpen] = useState<string | null>(uploads[0]?.id ?? null)

  if (!uploads.length) {
    return (
      <Card flush>
        <EmptyState icon={FileText} title="No documents yet" description="Documents clients send on WhatsApp or upload in their portal appear here, with what the assistant read from them." />
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <StatusLine success={state.success} error={state.error} onDismiss={() => setState({})} />
      <ul className="grid gap-3">
        {uploads.map((u) => {
          const meta = STATUS[u.ocrStatus]
          const isOpen = open === u.id
          const rows = fields(u)
          const type = (u.extracted?.documentType as string | undefined)?.replace(/-/g, ' ')
          return (
            <li key={u.id}>
              <Card flush>
                <button type="button" onClick={() => setOpen(isOpen ? null : u.id)} className="flex w-full items-start gap-3 px-5 py-4 text-left focus-ring rounded-card">
                  <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-forest-100 text-forest">
                    <FileText className="size-4" aria-hidden="true" strokeWidth={1.75} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-[14px] font-bold text-ink">{u.filename}</span>
                      <Badge tone={meta.tone} dot>
                        {meta.label}
                      </Badge>
                      {type ? <Badge tone="forest">{type}</Badge> : null}
                      {u.confirmedAt ? <Badge tone={u.confirmedData?.rejected ? 'warning' : 'success'}>{u.confirmedData?.rejected ? 'Client corrected' : 'Client confirmed'}</Badge> : null}
                      {u.reviewedAt ? <Badge>Reviewed</Badge> : null}
                    </span>
                    <span className="mt-0.5 block text-[12.5px] text-ink-muted">
                      {u.clientName ? (
                        <Link href={`/agency/clients/${u.clientId}`} className="font-semibold text-forest hover:underline">
                          {u.clientName}
                        </Link>
                      ) : u.phone ? (
                        formatPhone(u.phone)
                      ) : (
                        'Unknown sender'
                      )}{' '}
                      · via {u.source} · {relativeTime(u.createdAt)} · {Math.round(u.sizeBytes / 1024)} KB
                    </span>
                  </span>
                </button>
                {isOpen ? (
                  <div className="border-t border-line px-5 py-4">
                    {u.extracted?.summary ? <p className="text-[13.5px] text-ink">{String(u.extracted.summary)}</p> : null}
                    {rows.length ? (
                      <dl className="mt-3 grid gap-x-6 gap-y-1.5 text-[13px] sm:grid-cols-2">
                        {rows.map(([k, v]) => (
                          <div key={k} className="flex justify-between gap-3 border-b border-divider py-1">
                            <dt className="capitalize text-ink-muted">{k}</dt>
                            <dd className="text-right font-medium text-ink">{v}</dd>
                          </div>
                        ))}
                      </dl>
                    ) : (
                      <p className="mt-2 text-[13px] text-ink-muted">{u.ocrStatus === 'done' ? 'No structured fields were found.' : 'Nothing read yet.'}</p>
                    )}
                    {u.confirmedData?.correction ? <p className="mt-3 rounded-control bg-warning/10 px-3 py-2 text-[13px] text-ink">Client says: {String(u.confirmedData.correction)}</p> : null}
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <a href={`/api/uploads/${u.id}?file=1`} target="_blank" rel="noopener" className="inline-flex h-9 items-center rounded-control bg-forest px-3 text-[13px] font-semibold text-white hover:bg-forest-700 focus-ring">
                        Open file
                      </a>
                      <label className="flex items-center gap-2 text-[13px] text-ink-muted">
                        Type
                        <select
                          defaultValue={u.kind}
                          onChange={(e) => startTransition(async () => setState(await reviewUploadAction(u.id, e.target.value)))}
                          disabled={pending}
                          className="h-9 rounded-control border border-line bg-surface px-2 text-[13px] font-semibold text-ink focus-ring"
                        >
                          {KINDS.map((k) => (
                            <option key={k} value={k}>
                              {k}
                            </option>
                          ))}
                        </select>
                      </label>
                      {!u.reviewedAt ? (
                        <button type="button" disabled={pending} onClick={() => startTransition(async () => setState(await reviewUploadAction(u.id, u.kind)))} className="inline-flex h-9 items-center rounded-control border border-line px-3 text-[13px] font-semibold text-ink hover:border-ink-muted focus-ring">
                          Mark reviewed
                        </button>
                      ) : null}
                      {u.ocrStatus !== 'processing' ? (
                        <button type="button" disabled={pending} onClick={() => startTransition(async () => setState(await retryUploadAction(u.id)))} className="inline-flex h-9 items-center gap-1.5 rounded-control border border-line px-3 text-[13px] font-semibold text-ink-muted hover:text-ink focus-ring">
                          <RefreshCw className="size-3.5" aria-hidden="true" /> Read again
                        </button>
                      ) : null}
                    </div>
                    {u.ocrText ? (
                      <details className="mt-3">
                        <summary className="cursor-pointer text-[12.5px] font-semibold text-ink-muted">Raw text</summary>
                        <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded-control bg-surface-2 p-3 font-mono text-[11.5px] text-ink">{u.ocrText.slice(0, 4000)}</pre>
                      </details>
                    ) : null}
                  </div>
                ) : null}
              </Card>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

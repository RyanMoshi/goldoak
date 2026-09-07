'use client'

import { CheckCircle2, FileText, Upload as UploadIcon } from 'lucide-react'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Badge, type BadgeTone } from '@/components/platform/ui/Badge'
import { Card, CardHeader } from '@/components/platform/ui/Card'
import { EmptyState } from '@/components/platform/ui/EmptyState'
import { cn } from '@/lib/cn'
import { relativeTime } from '@/lib/format'
import type { Upload } from '@/types/platform'

const KINDS: { id: string; label: string }[] = [
  { id: 'id', label: 'ID or passport' },
  { id: 'policy', label: 'Policy document' },
  { id: 'claim', label: 'Claim form' },
  { id: 'vehicle', label: 'Logbook or vehicle document' },
  { id: 'receipt', label: 'Receipt or invoice' },
  { id: 'photo', label: 'Photo of damage or property' },
  { id: 'other', label: 'Something else' },
]

const STATUS: Record<Upload['ocrStatus'], { label: string; tone: BadgeTone }> = {
  queued: { label: 'Waiting to be read', tone: 'neutral' },
  processing: { label: 'Reading…', tone: 'info' },
  done: { label: 'Read', tone: 'success' },
  failed: { label: 'Could not read', tone: 'error' },
  skipped: { label: 'Saved for an adviser', tone: 'warning' },
}

function fields(u: Upload): [string, string][] {
  const f = (u.confirmedData && !u.confirmedData.rejected ? u.confirmedData : (u.extracted?.fields as Record<string, unknown>)) ?? {}
  return Object.entries(f)
    .filter(([, v]) => v != null && String(v).trim())
    .slice(0, 10)
    .map(([k, v]) => [k.replace(/_/g, ' '), String(v)])
}

/** Upload from the portal, watch it being read, confirm or correct what was found. Same pipeline as WhatsApp. */
export function PortalDocuments({ uploads, storageReady }: { uploads: Upload[]; storageReady: boolean }) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [kind, setKind] = useState('other')
  const [busy, setBusy] = useState<string | null>(null)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)
  const [correction, setCorrection] = useState<Record<string, string>>({})

  async function upload(e: React.FormEvent) {
    e.preventDefault()
    const file = fileRef.current?.files?.[0]
    if (!file) return setMessage({ ok: false, text: 'Choose a photo or PDF first.' })
    setBusy('upload')
    setMessage(null)
    try {
      const fd = new FormData()
      fd.set('file', file)
      fd.set('kind', kind)
      const res = await fetch('/api/uploads', { method: 'POST', body: fd })
      const data = (await res.json()) as { error?: string; id?: string }
      if (!res.ok) throw new Error(data.error ?? 'Upload failed')
      setMessage({ ok: true, text: 'Uploaded. Reading it now; this page refreshes when it is done.' })
      if (fileRef.current) fileRef.current.value = ''
      setTimeout(() => router.refresh(), 6000)
      setTimeout(() => router.refresh(), 20000)
    } catch (err) {
      setMessage({ ok: false, text: err instanceof Error ? err.message : 'Upload failed.' })
    } finally {
      setBusy(null)
    }
  }

  async function confirm(u: Upload, confirmed: boolean) {
    setBusy(u.id)
    try {
      const res = await fetch(`/api/uploads/${u.id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ confirmed, corrections: confirmed ? undefined : { correction: correction[u.id] ?? '' } }) })
      if (!res.ok) throw new Error('Could not save')
      setMessage({ ok: true, text: confirmed ? 'Saved to your file. Your adviser can see it.' : 'Noted. An adviser will correct the details.' })
      router.refresh()
    } catch (err) {
      setMessage({ ok: false, text: err instanceof Error ? err.message : 'Could not save.' })
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-6">
      <Card as="section">
        <CardHeader title="Upload a document" description="ID, logbook, policy schedule, claim form, receipt, or a photo of damage. Photos (JPG, PNG) or PDF, up to 15 MB." />
        {storageReady ? (
          <form onSubmit={upload} className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-end">
            <label className="block">
              <span className="mb-1 block text-[12px] font-bold uppercase tracking-[0.08em] text-ink-muted">File</span>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="block w-full text-[13px] file:mr-3 file:rounded-control file:border-0 file:bg-forest file:px-3 file:py-2 file:text-[13px] file:font-semibold file:text-white" />
            </label>
            <label className="block">
              <span className="mb-1 block text-[12px] font-bold uppercase tracking-[0.08em] text-ink-muted">What is it?</span>
              <select value={kind} onChange={(e) => setKind(e.target.value)} className="h-10 rounded-control border border-line bg-surface px-3 text-[13.5px] focus-ring">
                {KINDS.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.label}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" disabled={busy === 'upload'} className="inline-flex h-10 items-center justify-center gap-2 rounded-control bg-gold px-4 text-[13.5px] font-semibold text-white hover:bg-gold-500 disabled:opacity-60 focus-ring">
              <UploadIcon className="size-4" aria-hidden="true" /> {busy === 'upload' ? 'Uploading…' : 'Upload'}
            </button>
          </form>
        ) : (
          <p className="mt-3 text-[13px] text-ink-muted">Document uploads are not switched on yet. Send documents on WhatsApp or to your adviser.</p>
        )}
        {message ? (
          <p role="status" className={cn('mt-3 rounded-control border px-3 py-2 text-[13px]', message.ok ? 'border-success/25 bg-success/10 text-ink' : 'border-error/25 bg-error/10 text-error')}>
            {message.text}
          </p>
        ) : null}
      </Card>

      {uploads.length === 0 ? (
        <Card flush>
          <EmptyState icon={FileText} title="No documents yet" description="Documents you upload here or send on WhatsApp appear here, with what we read from them." />
        </Card>
      ) : (
        <ul className="grid gap-3">
          {uploads.map((u) => {
            const meta = STATUS[u.ocrStatus]
            const rows = fields(u)
            const needsConfirm = u.ocrStatus === 'done' && !u.confirmedAt && rows.length > 0
            return (
              <li key={u.id}>
                <Card>
                  <div className="flex flex-wrap items-center gap-2">
                    <FileText className="size-4 text-forest" aria-hidden="true" />
                    <span className="text-[14px] font-bold text-ink">{u.filename}</span>
                    <Badge tone={meta.tone} dot>
                      {meta.label}
                    </Badge>
                    {u.confirmedAt ? (
                      <Badge tone="success">
                        <CheckCircle2 className="size-3" aria-hidden="true" /> Confirmed
                      </Badge>
                    ) : null}
                    <span className="text-[12px] text-ink-faint">{relativeTime(u.createdAt)}</span>
                  </div>
                  {u.extracted?.summary ? <p className="mt-2 text-[13.5px] text-ink">{String(u.extracted.summary)}</p> : null}
                  {rows.length ? (
                    <dl className="mt-3 grid gap-x-6 gap-y-1.5 text-[13px] sm:grid-cols-2">
                      {rows.map(([k, v]) => (
                        <div key={k} className="flex justify-between gap-3 border-b border-divider py-1">
                          <dt className="capitalize text-ink-muted">{k}</dt>
                          <dd className="text-right font-medium text-ink">{v}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : null}
                  {needsConfirm ? (
                    <div className="mt-4 space-y-2">
                      <p className="text-[13.5px] font-semibold text-ink">Is this correct?</p>
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <button type="button" disabled={busy === u.id} onClick={() => confirm(u, true)} className="inline-flex h-9 items-center justify-center rounded-control bg-forest px-4 text-[13px] font-semibold text-white hover:bg-forest-700 disabled:opacity-60 focus-ring">
                          Yes, save it
                        </button>
                        <input value={correction[u.id] ?? ''} onChange={(e) => setCorrection({ ...correction, [u.id]: e.target.value })} placeholder="No: tell us what is wrong" className="h-9 flex-1 rounded-control border border-line bg-surface px-3 text-[13px] focus-ring" />
                        <button type="button" disabled={busy === u.id || !(correction[u.id] ?? '').trim()} onClick={() => confirm(u, false)} className="inline-flex h-9 items-center justify-center rounded-control border border-line px-4 text-[13px] font-semibold text-ink hover:border-ink-muted disabled:opacity-50 focus-ring">
                          Send correction
                        </button>
                      </div>
                    </div>
                  ) : null}
                  <a href={`/api/uploads/${u.id}?file=1`} target="_blank" rel="noopener" className="mt-3 inline-block text-[12.5px] font-semibold text-forest underline-offset-2 hover:underline">
                    Open file
                  </a>
                </Card>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

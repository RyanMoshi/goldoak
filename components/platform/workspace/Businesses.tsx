'use client'

import Link from 'next/link'
import { Building2, Check, Plus, X } from 'lucide-react'
import { useState, useTransition } from 'react'
import { Field, inputClass } from '@/components/platform/auth/AuthShell'
import { Badge } from '@/components/platform/ui/Badge'
import { Card, CardHeader } from '@/components/platform/ui/Card'
import { EmptyState } from '@/components/platform/ui/EmptyState'
import { StatusLine } from '@/components/platform/ui/PageHeader'
import { createBusinessAction, reviewBusinessClaimAction, type ActionState } from '@/lib/agency/actions'
import { formatPhone, relativeTime } from '@/lib/format'
import type { Business, BusinessClaim } from '@/types/platform'

/** The businesses this agency serves, and the people asking to be linked to them. */
export function Businesses({ businesses, claims }: { businesses: Business[]; claims: BusinessClaim[] }) {
  const [state, setState] = useState<ActionState>({})
  const [pending, startTransition] = useTransition()
  const [showForm, setShowForm] = useState(businesses.length === 0)
  const [formKey, setFormKey] = useState(0)
  const [note, setNote] = useState<Record<string, string>>({})
  const pendingClaims = claims.filter((c) => c.status === 'pending')
  const decided = claims.filter((c) => c.status !== 'pending')

  function submit(fd: FormData) {
    setState({})
    startTransition(async () => {
      const result = await createBusinessAction(fd)
      setState(result)
      if (result.success) {
        setFormKey((k) => k + 1)
        setShowForm(false)
      }
    })
  }

  function review(claim: BusinessClaim, decision: 'approved' | 'rejected') {
    if (!window.confirm(`${decision === 'approved' ? 'Approve' : 'Reject'} ${claim.applicantName}'s claim on ${claim.businessName}?`)) return
    startTransition(async () => setState(await reviewBusinessClaimAction(claim.id, decision, note[claim.id] ?? '')))
  }

  return (
    <div className="space-y-6">
      <StatusLine success={state.success} error={state.error} onDismiss={() => setState({})} />

      <Card as="section" flush>
        <div className="flex items-center justify-between px-5 pb-3 pt-5">
          <CardHeader title="Claims waiting for review" description="People asking to be linked to a business. Verify, then approve or reject; they are told on WhatsApp." />
          <Badge tone={pendingClaims.length ? 'gold' : 'neutral'}>{pendingClaims.length}</Badge>
        </div>
        {pendingClaims.length === 0 ? (
          <p className="border-t border-line px-5 py-6 text-[13px] text-ink-muted">Nothing waiting. When a client claims a business on WhatsApp or the portal, it appears here.</p>
        ) : (
          <ul className="divide-y divide-divider border-t border-line">
            {pendingClaims.map((c) => (
              <li key={c.id} className="px-5 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[14px] font-bold text-ink">{c.applicantName}</span>
                  <Badge tone="gold" mono>
                    {c.reference}
                  </Badge>
                  <span className="text-[13px] text-ink-muted">claims</span>
                  <span className="text-[14px] font-semibold text-forest">{c.businessName}</span>
                </div>
                <p className="mt-1 text-[13px] text-ink-muted">
                  {c.relationship} · {c.phone ? formatPhone(c.phone) : 'no phone'} · via {c.channel} · {relativeTime(c.createdAt)}
                </p>
                {c.verification ? <p className="mt-1 text-[13px] text-ink">Verification: {c.verification}</p> : null}
                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <input value={note[c.id] ?? ''} onChange={(e) => setNote({ ...note, [c.id]: e.target.value })} placeholder="Note to the applicant (optional)" className="h-9 flex-1 rounded-control border border-line bg-surface px-3 text-[13px] focus-ring" />
                  <div className="flex gap-2">
                    <button type="button" disabled={pending} onClick={() => review(c, 'approved')} className="inline-flex h-9 items-center gap-1.5 rounded-control bg-forest px-3 text-[13px] font-semibold text-white hover:bg-forest-700 disabled:opacity-60 focus-ring">
                      <Check className="size-4" aria-hidden="true" /> Approve
                    </button>
                    <button type="button" disabled={pending} onClick={() => review(c, 'rejected')} className="inline-flex h-9 items-center gap-1.5 rounded-control border border-line px-3 text-[13px] font-semibold text-ink hover:border-error hover:text-error disabled:opacity-60 focus-ring">
                      <X className="size-4" aria-hidden="true" /> Reject
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="grid gap-6 lg:grid-cols-12">
        <Card as="section" flush className="lg:col-span-7">
          <div className="flex items-center justify-between px-5 pb-3 pt-5">
            <CardHeader title="Businesses" description={`${businesses.length} on file. Clients search these when they claim a business.`} />
            <button type="button" onClick={() => setShowForm((v) => !v)} className="inline-flex h-9 items-center gap-1.5 rounded-control bg-gold px-3 text-[13px] font-semibold text-white hover:bg-gold-500 focus-ring">
              <Plus className="size-4" aria-hidden="true" /> Add
            </button>
          </div>
          {showForm ? (
            <form key={formKey} action={submit} className="grid gap-3 border-t border-line px-5 py-4 sm:grid-cols-2" noValidate>
              <Field label="Business name" htmlFor="bz-name">
                <input id="bz-name" name="name" required className={inputClass} placeholder="Mwangi Hardware Ltd" />
              </Field>
              <Field label="Registration number" htmlFor="bz-reg">
                <input id="bz-reg" name="registrationNo" className={inputClass} placeholder="PVT-XXXX" />
              </Field>
              <Field label="Sector" htmlFor="bz-sector">
                <input id="bz-sector" name="sector" className={inputClass} placeholder="Retail" />
              </Field>
              <Field label="Phone" htmlFor="bz-phone">
                <input id="bz-phone" name="phone" type="tel" className={inputClass} placeholder="0712 345 678" />
              </Field>
              <Field label="Email" htmlFor="bz-email">
                <input id="bz-email" name="email" type="email" className={inputClass} />
              </Field>
              <Field label="Address" htmlFor="bz-address">
                <input id="bz-address" name="address" className={inputClass} />
              </Field>
              <div className="sm:col-span-2">
                <button type="submit" disabled={pending} className="inline-flex h-10 items-center rounded-control bg-forest px-4 text-[13.5px] font-semibold text-white hover:bg-forest-700 disabled:opacity-60 focus-ring">
                  {pending ? 'Saving…' : 'Save business'}
                </button>
              </div>
            </form>
          ) : null}
          {businesses.length === 0 ? (
            <div className="border-t border-line">
              <EmptyState icon={Building2} title="No businesses yet" description="Add the businesses you serve so clients can find and claim them." />
            </div>
          ) : (
            <ul className="divide-y divide-divider border-t border-line">
              {businesses.map((b) => (
                <li key={b.id} className="flex flex-col gap-1 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[14px] font-bold text-ink">{b.name}</span>
                      {b.verified ? <Badge tone="success">Verified</Badge> : null}
                      {b.clientId ? (
                        <Link href={`/agency/clients/${b.clientId}`} className="text-[12px] font-semibold text-forest hover:underline">
                          Linked client
                        </Link>
                      ) : (
                        <Badge>Unclaimed</Badge>
                      )}
                    </div>
                    <p className="text-[12.5px] text-ink-muted">
                      {[b.registrationNo, b.sector, b.phone ? formatPhone(b.phone) : null, b.email].filter(Boolean).join(' · ') || 'No details yet'}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card as="section" flush className="lg:col-span-5">
          <div className="px-5 pb-3 pt-5">
            <CardHeader title="Decided claims" description="Approved and rejected, most recent first." />
          </div>
          <ul className="divide-y divide-divider border-t border-line">
            {decided.slice(0, 20).map((c) => (
              <li key={c.id} className="px-5 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[13.5px] font-semibold text-ink">{c.applicantName}</span>
                  <span className="text-[13px] text-ink-muted">→ {c.businessName}</span>
                  <Badge tone={c.status === 'approved' ? 'success' : 'error'}>{c.status}</Badge>
                </div>
                <p className="text-[12px] text-ink-faint">
                  {c.reference} · {c.reviewedAt ? relativeTime(c.reviewedAt) : ''}
                  {c.reviewNote ? ` · ${c.reviewNote}` : ''}
                </p>
              </li>
            ))}
            {decided.length === 0 ? <li className="px-5 py-6 text-[13px] text-ink-muted">No decisions yet.</li> : null}
          </ul>
        </Card>
      </div>
    </div>
  )
}

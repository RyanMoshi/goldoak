'use client'

import { Building2, MessagesSquare, Search } from 'lucide-react'
import { useState, useTransition } from 'react'
import { Field, inputClass } from '@/components/platform/auth/AuthShell'
import { Badge } from '@/components/platform/ui/Badge'
import { Card, CardHeader } from '@/components/platform/ui/Card'
import { StatusLine } from '@/components/platform/ui/PageHeader'
import { claimBusinessAction, enquiryAction, searchBusinessesAction, type PortalRequestState } from '@/lib/portal/requests'
import { cn } from '@/lib/cn'
import { formatShortDate } from '@/lib/format'
import type { RequestItem } from '@/services/requests'
import type { Business } from '@/types/platform'

const RELATIONSHIPS = ['Owner or director', 'Manager or staff', 'Authorised representative']

/** Claim a business (search → pick → relationship → verify), make an enquiry, and see every request. Same services as WhatsApp. */
export function RequestForms({ requests }: { requests: RequestItem[] }) {
  const [tab, setTab] = useState<'claim' | 'enquiry'>('claim')
  const [state, setState] = useState<PortalRequestState>({})
  const [pending, startTransition] = useTransition()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Business[] | null>(null)
  const [picked, setPicked] = useState<Business | null>(null)
  const [formKey, setFormKey] = useState(0)

  function search() {
    if (query.trim().length < 2) return
    startTransition(async () => setResults(await searchBusinessesAction(query)))
  }

  function submitClaim(fd: FormData) {
    if (!picked) return setState({ error: 'Choose the business first.' })
    fd.set('businessId', picked.id)
    setState({})
    startTransition(async () => {
      const result = await claimBusinessAction(fd)
      setState(result)
      if (result.success) {
        setPicked(null)
        setResults(null)
        setQuery('')
        setFormKey((k) => k + 1)
      }
    })
  }

  function submitEnquiry(fd: FormData) {
    setState({})
    startTransition(async () => {
      const result = await enquiryAction(fd)
      setState(result)
      if (result.success) setFormKey((k) => k + 1)
    })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <div className="space-y-4 lg:col-span-7">
        <div role="tablist" className="grid grid-cols-2 gap-2 rounded-card border border-line bg-surface p-1">
          {(['claim', 'enquiry'] as const).map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} type="button" onClick={() => setTab(t)} className={cn('flex h-10 items-center justify-center gap-2 rounded-control text-[13.5px] font-semibold focus-ring', tab === t ? 'bg-forest text-white' : 'text-ink-muted hover:bg-surface-2')}>
              {t === 'claim' ? <Building2 className="size-4" aria-hidden="true" /> : <MessagesSquare className="size-4" aria-hidden="true" />}
              {t === 'claim' ? 'Claim a business' : 'Make an enquiry'}
            </button>
          ))}
        </div>
        <StatusLine success={state.success} error={state.error} onDismiss={() => setState({})} />

        {tab === 'claim' ? (
          <Card as="section">
            <CardHeader title="Claim a business" description="Find your business on your agency's register and ask to be linked to it. The agency verifies before approving." />
            <div className="mt-4 flex gap-2">
              <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), search())} placeholder="Business name or registration number" className={inputClass} />
              <button type="button" onClick={search} disabled={pending} className="inline-flex h-11 shrink-0 items-center gap-2 rounded-control bg-forest px-4 text-[13.5px] font-semibold text-white hover:bg-forest-700 disabled:opacity-60 focus-ring">
                <Search className="size-4" aria-hidden="true" /> Search
              </button>
            </div>
            {results ? (
              results.length ? (
                <ul className="mt-3 divide-y divide-divider rounded-card border border-line">
                  {results.map((b) => (
                    <li key={b.id}>
                      <button type="button" onClick={() => setPicked(b)} className={cn('flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-[13.5px] focus-ring', picked?.id === b.id ? 'bg-forest-100 text-forest' : 'hover:bg-surface-3')}>
                        <span className="font-semibold">{b.name}</span>
                        <span className="text-[12px] text-ink-muted">{b.registrationNo ?? b.sector ?? ''}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-[13px] text-ink-muted">Nothing matched. Check the spelling, or ask your adviser to add the business.</p>
              )
            ) : null}
            {picked ? (
              <form key={formKey} action={submitClaim} className="mt-4 space-y-4" noValidate>
                <p className="text-[13.5px]">
                  Claiming <span className="font-bold text-ink">{picked.name}</span>
                </p>
                <Field label="Your relationship" htmlFor="cb-rel">
                  <select id="cb-rel" name="relationship" className={inputClass} defaultValue={RELATIONSHIPS[0]}>
                    {RELATIONSHIPS.map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                </Field>
                <Field label="How can the agency verify you?" htmlFor="cb-ver" hint="Registration number, a business phone or email, or the adviser who knows you.">
                  <input id="cb-ver" name="verification" className={inputClass} />
                </Field>
                <button type="submit" disabled={pending} className="inline-flex h-11 items-center justify-center rounded-control bg-gold px-5 text-[14px] font-semibold text-white hover:bg-gold-500 disabled:opacity-60 focus-ring">
                  {pending ? 'Submitting…' : 'Submit claim'}
                </button>
              </form>
            ) : null}
          </Card>
        ) : (
          <Card as="section">
            <CardHeader title="Make an enquiry" description="Anything for your agency. You get a reference, and the answer arrives here and on WhatsApp." />
            <form key={formKey} action={submitEnquiry} className="mt-4 space-y-4" noValidate>
              <Field label="Subject" htmlFor="enq-subject">
                <input id="enq-subject" name="subject" required className={inputClass} placeholder="Motor cover for a new car" />
              </Field>
              <Field label="Details" htmlFor="enq-body">
                <textarea id="enq-body" name="body" required rows={4} className={`${inputClass} min-h-[110px] resize-y py-2`} placeholder="Include anything that helps the agency answer in one go." />
              </Field>
              <button type="submit" disabled={pending} className="inline-flex h-11 items-center justify-center rounded-control bg-gold px-5 text-[14px] font-semibold text-white hover:bg-gold-500 disabled:opacity-60 focus-ring">
                {pending ? 'Sending…' : 'Send enquiry'}
              </button>
            </form>
          </Card>
        )}
      </div>

      <Card as="section" flush className="lg:col-span-5">
        <div className="px-5 pb-3 pt-5">
          <CardHeader title="Your requests" description="Quotes, claims, business claims, enquiries and documents, with where each stands." />
        </div>
        <ul className="divide-y divide-divider border-t border-line">
          {requests.map((r) => (
            <li key={`${r.kind}-${r.reference}`} className="px-5 py-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="gold" mono>
                  {r.reference}
                </Badge>
                <span className="text-[13.5px] font-semibold text-ink">{r.title}</span>
              </div>
              <p className="mt-0.5 text-[12.5px] text-ink-muted">
                {r.status}
                {r.detail ? ` · ${r.detail}` : ''} · {formatShortDate(r.createdAt)}
              </p>
            </li>
          ))}
          {requests.length === 0 ? <li className="px-5 py-6 text-[13px] text-ink-muted">No requests yet. Ask for cover, report a claim, claim a business or send an enquiry, and it appears here.</li> : null}
        </ul>
      </Card>
    </div>
  )
}

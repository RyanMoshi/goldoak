'use client'

import { CheckCircle2, FileSearch, ShieldAlert, X } from 'lucide-react'
import { useState, useTransition } from 'react'
import { Field, inputClass } from '@/components/platform/auth/AuthShell'
import { Card, CardHeader } from '@/components/platform/ui/Card'
import { cn } from '@/lib/cn'
import { reportClaimAction, requestQuoteAction, type PortalActionState } from '@/lib/portal/actions'
import type { Policy } from '@/types/platform'
import { PRODUCT_LINES } from '@/types/platform'

/** The two things a client can start themselves: ask for cover, report a claim. Same as the WhatsApp QUOTE and CLAIM commands. */
export function PortalActions({ policies, hasClient }: { policies: Policy[]; hasClient: boolean }) {
  const [open, setOpen] = useState<'quote' | 'claim' | null>(null)
  const [state, setState] = useState<PortalActionState>({})
  const [pending, startTransition] = useTransition()
  const [formKey, setFormKey] = useState(0)
  const livePolicies = policies.filter((p) => p.status === 'live' || p.status === 'renewal-due')

  function submit(action: (fd: FormData) => Promise<PortalActionState>) {
    return (fd: FormData) => {
      setState({})
      startTransition(async () => {
        const result = await action(fd)
        setState(result)
        if (result.success) {
          setOpen(null)
          setFormKey((k) => k + 1)
        }
      })
    }
  }

  return (
    <Card as="section">
      <CardHeader title="Need something?" description="Ask here or send the same word on WhatsApp." />
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button type="button" onClick={() => setOpen(open === 'quote' ? null : 'quote')} aria-expanded={open === 'quote'} disabled={!hasClient} className={cn('flex items-center gap-2 rounded-control border px-3 py-3 text-left text-[13.5px] font-semibold transition-colors focus-ring disabled:opacity-50', open === 'quote' ? 'border-forest bg-forest text-white' : 'border-line bg-surface text-ink hover:border-line-strong')}>
          <FileSearch className={cn('size-4', open === 'quote' ? 'text-gold' : 'text-ink-muted')} aria-hidden="true" /> Ask for cover
        </button>
        <button type="button" onClick={() => setOpen(open === 'claim' ? null : 'claim')} aria-expanded={open === 'claim'} disabled={!livePolicies.length} className={cn('flex items-center gap-2 rounded-control border px-3 py-3 text-left text-[13.5px] font-semibold transition-colors focus-ring disabled:opacity-50', open === 'claim' ? 'border-forest bg-forest text-white' : 'border-line bg-surface text-ink hover:border-line-strong')}>
          <ShieldAlert className={cn('size-4', open === 'claim' ? 'text-gold' : 'text-ink-muted')} aria-hidden="true" /> Report a claim
        </button>
      </div>
      {!hasClient ? <p className="mt-2 text-[12px] text-ink-faint">Available once your adviser has opened your file.</p> : null}
      {hasClient && !livePolicies.length ? <p className="mt-2 text-[12px] text-ink-faint">Claims become available once a policy is in force.</p> : null}

      {open === 'quote' ? (
        <form key={`q-${formKey}`} action={submit(requestQuoteAction)} className="mt-4 space-y-4">
          <Field label="What would you like cover for?" htmlFor="rq-product">
            <select id="rq-product" name="product" className={inputClass} defaultValue="Motor Comprehensive">
              {PRODUCT_LINES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </Field>
          <Field label="Anything we should know?" htmlFor="rq-notes" hint="Vehicle, value, staff numbers, location. Optional.">
            <textarea id="rq-notes" name="notes" rows={3} maxLength={500} className={inputClass + ' h-auto py-2.5'} />
          </Field>
          <button type="submit" disabled={pending} className="inline-flex h-11 w-full items-center justify-center rounded-control bg-forest text-[14px] font-semibold text-white hover:bg-forest-700 disabled:opacity-60 focus-ring">
            {pending ? 'Sending…' : 'Send request'}
          </button>
        </form>
      ) : null}

      {open === 'claim' ? (
        <form key={`c-${formKey}`} action={submit(reportClaimAction)} className="mt-4 space-y-4">
          <Field label="Which policy?" htmlFor="rc-policy">
            <select id="rc-policy" name="policyId" className={inputClass} defaultValue={livePolicies[0]?.id}>
              {livePolicies.map((p) => <option key={p.id} value={p.id}>{p.product} — {p.insurer} ({p.policyNumber})</option>)}
            </select>
          </Field>
          <Field label="When did it happen?" htmlFor="rc-date">
            <input id="rc-date" name="incidentDate" type="date" className={inputClass} />
          </Field>
          <Field label="What happened?" htmlFor="rc-desc" hint="A few words are enough. We call you for the rest.">
            <textarea id="rc-desc" name="description" rows={3} maxLength={1000} required className={inputClass + ' h-auto py-2.5'} placeholder="e.g. Shop broken into last night, stock taken" />
          </Field>
          <button type="submit" disabled={pending} className="inline-flex h-11 w-full items-center justify-center rounded-control bg-gold text-[14px] font-semibold text-white hover:bg-gold-500 disabled:opacity-60 focus-ring">
            {pending ? 'Sending…' : 'Report claim'}
          </button>
        </form>
      ) : null}

      {state.success || state.error ? (
        <div role="status" className={cn('mt-4 flex items-start gap-2 rounded-control border px-3 py-2 text-[13px]', state.success ? 'border-success/25 bg-success/10 text-ink' : 'border-error/25 bg-error/10 text-error')}>
          <CheckCircle2 className={cn('mt-0.5 size-4 shrink-0', state.success ? 'text-success' : 'text-error')} aria-hidden="true" />
          <span className="flex-1">{state.success ?? state.error}</span>
          <button type="button" onClick={() => setState({})} aria-label="Dismiss" className="rounded-control text-ink-muted hover:text-ink focus-ring">
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      ) : null}
    </Card>
  )
}

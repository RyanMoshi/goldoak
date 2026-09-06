'use client'

import { CheckCircle2, MessageSquare, Plus, X } from 'lucide-react'
import { useState, useTransition } from 'react'
import { Field, inputClass } from '@/components/platform/auth/AuthShell'
import { Card, CardHeader } from '@/components/platform/ui/Card'
import { addPolicyAction, messageClientAction, updateClaimStageAction, updateQuoteStageAction, updateStageAction, type ActionState } from '@/lib/agency/actions'
import { cn } from '@/lib/cn'
import type { Claim, Client, QuoteRequest } from '@/types/platform'
import { CLAIM_STAGES, JOURNEY_STAGES, PRODUCT_LINES } from '@/types/platform'

const QUOTE_STAGES = ['requested', 'compared', 'proposed', 'accepted', 'placed', 'declined'] as const

/** Everything the agency changes on a client, all of which tells the client on the site and WhatsApp. */
export function ClientWorkbench({ client, quotes, claims }: { client: Client; quotes: QuoteRequest[]; claims: Claim[] }) {
  const [state, setState] = useState<ActionState>({})
  const [pending, startTransition] = useTransition()
  const [showPolicy, setShowPolicy] = useState(false)
  const [message, setMessage] = useState('')
  const [policyKey, setPolicyKey] = useState(0)

  function run(fn: () => Promise<ActionState>) {
    setState({})
    startTransition(async () => setState(await fn()))
  }

  return (
    <div className="space-y-4">
      {state.success || state.error ? (
        <div role="status" className={cn('flex items-start gap-2 rounded-control border px-3 py-2 text-[13px]', state.success ? 'border-success/25 bg-success/10 text-ink' : 'border-error/25 bg-error/10 text-error')}>
          <CheckCircle2 className={cn('mt-0.5 size-4 shrink-0', state.success ? 'text-success' : 'text-error')} aria-hidden="true" />
          <span className="flex-1">{state.success ?? state.error}</span>
          <button type="button" onClick={() => setState({})} aria-label="Dismiss" className="rounded-control text-ink-muted hover:text-ink focus-ring">
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      ) : null}

      <Card as="section">
        <CardHeader title="Stage" description="Where this client is in the GoldOak process. Changing it tells them." />
        <div className="mt-3 flex flex-wrap gap-2">
          {JOURNEY_STAGES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              disabled={pending || s.id === client.stage}
              onClick={() => run(() => updateStageAction(client.id, s.id))}
              className={cn('inline-flex h-8 items-center gap-1.5 rounded-control border px-2.5 text-[12.5px] font-semibold transition-colors focus-ring disabled:cursor-default', s.id === client.stage ? 'border-forest bg-forest text-white' : 'border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink')}
            >
              <span className="font-mono text-[11px]">{i + 1}</span> {s.label}
            </button>
          ))}
        </div>
      </Card>

      <Card as="section">
        <CardHeader title="Message the client" description="Goes to their portal and, if they have a number, WhatsApp." />
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const body = message
            setMessage('')
            run(() => messageClientAction(client.id, body))
          }}
          className="mt-3 flex flex-col gap-2 sm:flex-row"
        >
          <input value={message} onChange={(e) => setMessage(e.target.value)} className={inputClass} placeholder="e.g. Jubilee has replied; comparison ready by Thursday." aria-label="Message" />
          <button type="submit" disabled={pending || message.trim().length < 2} className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-control bg-forest px-4 text-[14px] font-semibold text-white hover:bg-forest-700 disabled:opacity-60 focus-ring">
            <MessageSquare className="size-4" aria-hidden="true" /> Send
          </button>
        </form>
      </Card>

      {quotes.length ? (
        <Card as="section" flush>
          <div className="px-5 pb-3 pt-5"><CardHeader title="Quote stages" description="Move a quote along; the client is told at each step." /></div>
          <ul className="divide-y divide-divider border-t border-line">
            {quotes.map((q) => (
              <QuoteRow key={q.id} clientId={client.id} quote={q} pending={pending} onRun={run} />
            ))}
          </ul>
        </Card>
      ) : null}

      {claims.length ? (
        <Card as="section" flush>
          <div className="px-5 pb-3 pt-5"><CardHeader title="Claim stages" description="Weekly updates are due; use the note to say what happened." /></div>
          <ul className="divide-y divide-divider border-t border-line">
            {claims.filter((c) => c.stage !== 'closed').map((c) => (
              <ClaimRow key={c.id} clientId={client.id} claim={c} pending={pending} onRun={run} />
            ))}
          </ul>
        </Card>
      ) : null}

      <Card as="section">
        <div className="flex items-center justify-between gap-3">
          <CardHeader title="Record a policy" description="When cover is placed. Renewal reminders start automatically." />
          <button type="button" onClick={() => setShowPolicy((v) => !v)} className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-control border border-line bg-surface px-2.5 text-[12.5px] font-semibold text-ink hover:border-ink-muted focus-ring">
            <Plus className="size-3.5" aria-hidden="true" /> {showPolicy ? 'Hide' : 'Add policy'}
          </button>
        </div>
        {showPolicy ? (
          <form
            key={policyKey}
            action={(fd) => {
              run(async () => {
                const r = await addPolicyAction(client.id, fd)
                if (r.success) {
                  setShowPolicy(false)
                  setPolicyKey((k) => k + 1)
                }
                return r
              })
            }}
            className="mt-4 grid gap-4 sm:grid-cols-2"
          >
            <Field label="Insurer" htmlFor="pol-insurer"><input id="pol-insurer" name="insurer" required className={inputClass} placeholder="e.g. APA" /></Field>
            <Field label="Product" htmlFor="pol-product">
              <select id="pol-product" name="product" className={inputClass} defaultValue="Motor Comprehensive">
                {PRODUCT_LINES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="Policy number" htmlFor="pol-number"><input id="pol-number" name="policyNumber" required className={inputClass + ' font-mono'} placeholder="APA/FIR/2026/00123" /></Field>
            <Field label="Annual premium (KES)" htmlFor="pol-premium"><input id="pol-premium" name="premium" inputMode="numeric" required className={inputClass + ' font-mono'} placeholder="48600" /></Field>
            <Field label="Sum insured (KES)" htmlFor="pol-si"><input id="pol-si" name="sumInsured" inputMode="numeric" className={inputClass + ' font-mono'} placeholder="5500000" /></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Start" htmlFor="pol-start"><input id="pol-start" name="startDate" type="date" required className={inputClass} /></Field>
              <Field label="Expiry" htmlFor="pol-expiry"><input id="pol-expiry" name="expiryDate" type="date" required className={inputClass} /></Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Exclusions the client must know" htmlFor="pol-excl"><input id="pol-excl" name="keyExclusions" className={inputClass} placeholder="e.g. Stock held outside the premises is not covered." /></Field>
            </div>
            <div className="sm:col-span-2">
              <button type="submit" disabled={pending} className="inline-flex h-11 items-center justify-center rounded-control bg-gold px-5 text-[14px] font-semibold text-white hover:bg-gold-500 disabled:opacity-60 focus-ring">
                {pending ? 'Saving…' : 'Record policy'}
              </button>
            </div>
          </form>
        ) : null}
      </Card>
    </div>
  )
}

function QuoteRow({ clientId, quote, pending, onRun }: { clientId: string; quote: QuoteRequest; pending: boolean; onRun: (fn: () => Promise<ActionState>) => void }) {
  const [stage, setStage] = useState<string>(quote.stage)
  const [premium, setPremium] = useState('')
  return (
    <li className="flex flex-col gap-2 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-[14px] font-bold text-ink">{quote.product} <span className="font-mono text-[12px] font-normal text-ink-muted">{quote.reference}</span></p>
        <p className="text-[12px] text-ink-muted">{quote.channel === 'whatsapp' ? 'Asked on WhatsApp' : 'Asked on the site'}{quote.notes ? ` · ${quote.notes}` : ''}</p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        <select value={stage} onChange={(e) => setStage(e.target.value)} className="h-9 rounded-control border border-line bg-surface px-2 text-[13px] focus-ring" aria-label="Quote stage">
          {QUOTE_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <input value={premium} onChange={(e) => setPremium(e.target.value)} inputMode="numeric" placeholder="Premium KES" className="h-9 w-32 rounded-control border border-line bg-surface px-2 font-mono text-[13px] focus-ring" aria-label="Premium estimate" />
        <button type="button" disabled={pending || (stage === quote.stage && !premium)} onClick={() => onRun(() => updateQuoteStageAction(clientId, quote.id, stage, premium))} className="inline-flex h-9 items-center rounded-control bg-forest px-3 text-[12.5px] font-semibold text-white hover:bg-forest-700 disabled:opacity-50 focus-ring">
          Update
        </button>
      </div>
    </li>
  )
}

function ClaimRow({ clientId, claim, pending, onRun }: { clientId: string; claim: Claim; pending: boolean; onRun: (fn: () => Promise<ActionState>) => void }) {
  const [stage, setStage] = useState<string>(claim.stage)
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  return (
    <li className="flex flex-col gap-2 px-5 py-3">
      <div className="min-w-0">
        <p className="text-[14px] font-bold text-ink">{claim.product} · {claim.insurer} <span className="font-mono text-[12px] font-normal text-ink-muted">{claim.reference}</span></p>
        {claim.description ? <p className="text-[12.5px] text-ink-muted">{claim.description}</p> : null}
      </div>
      <div className="flex flex-wrap gap-2">
        <select value={stage} onChange={(e) => setStage(e.target.value)} className="h-9 rounded-control border border-line bg-surface px-2 text-[13px] focus-ring" aria-label="Claim stage">
          {CLAIM_STAGES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
        <input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="numeric" placeholder="Amount KES" className="h-9 w-32 rounded-control border border-line bg-surface px-2 font-mono text-[13px] focus-ring" aria-label="Claim amount" />
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Update for the client (optional)" className="h-9 min-w-[200px] flex-1 rounded-control border border-line bg-surface px-2 text-[13px] focus-ring" aria-label="Update note" />
        <button type="button" disabled={pending} onClick={() => onRun(() => updateClaimStageAction(clientId, claim.id, stage, amount, note))} className="inline-flex h-9 items-center rounded-control bg-forest px-3 text-[12.5px] font-semibold text-white hover:bg-forest-700 disabled:opacity-50 focus-ring">
          Send update
        </button>
      </div>
    </li>
  )
}

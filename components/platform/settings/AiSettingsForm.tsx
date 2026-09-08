'use client'

import { Loader2, Save } from 'lucide-react'
import { useState, useTransition } from 'react'
import { Field, inputClass } from '@/components/platform/auth/AuthShell'
import { Card, CardHeader } from '@/components/platform/ui/Card'
import { StatusLine } from '@/components/platform/ui/PageHeader'
import { updateAiSettingsAction, type ActionState } from '@/lib/agency/actions'
import type { AiSettings } from '@/types/platform'

const area = `${inputClass} h-auto min-h-[110px] resize-y py-2.5 text-[16px] sm:text-[14px]`

/** What the assistant knows and how it speaks for this agency. The global safety rules stay fixed. */
export function AiSettingsForm({ settings, agencyName, canEdit, modelLabel }: { settings: AiSettings; agencyName: string; canEdit: boolean; modelLabel: string }) {
  const [state, setState] = useState<ActionState>({})
  const [pending, startTransition] = useTransition()

  function submit(formData: FormData) {
    setState({})
    startTransition(async () => setState(await updateAiSettingsAction(formData)))
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <Card as="section" className="lg:col-span-8">
        <CardHeader title={`How the assistant works for ${agencyName}`} description={canEdit ? 'Everything here is used only for your clients. Other agencies never see it.' : 'Only agency admins can change these.'} />
        <form action={submit} className="mt-5 space-y-4" noValidate>
          <fieldset disabled={!canEdit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Assistant name" htmlFor="ai-name" hint="How it introduces itself. Default: Super Agent.">
                <input id="ai-name" name="assistantName" defaultValue={settings.assistantName ?? ''} className={inputClass} placeholder="Super Agent" />
              </Field>
              <Field label="Tone" htmlFor="ai-tone" hint="A few words.">
                <input id="ai-tone" name="tone" defaultValue={settings.tone ?? ''} className={inputClass} placeholder="warm, clear, professional, brief" />
              </Field>
            </div>
            <Field label="Products and services you offer" htmlFor="ai-services" hint="Plain text or bullet points. The assistant recommends from this list first.">
              <textarea id="ai-services" name="services" defaultValue={settings.services ?? ''} maxLength={4000} className={area} placeholder={'• Motor comprehensive and third party\n• Medical: individual and group\n• Business packages for shops and SMEs…'} />
            </Field>
            <Field label="Frequently asked questions" htmlFor="ai-faqs" hint="Question on one line, answer on the next. The assistant answers these exactly as you wrote them.">
              <textarea id="ai-faqs" name="faqs" defaultValue={settings.faqs ?? ''} maxLength={6000} className={area} placeholder={'Q: What are your office hours?\nA: Monday to Friday 8am to 5pm, Saturdays 9am to 1pm.'} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="When to hand over to a person" htmlFor="ai-esc" hint="In addition to the built-in rules (prices, claim decisions, complaints).">
                <textarea id="ai-esc" name="escalation" defaultValue={settings.escalation ?? ''} maxLength={1500} className={area} placeholder="Corporate clients, anything about commissions, requests to cancel a policy…" />
              </Field>
              <Field label="Never say or do" htmlFor="ai-dont" hint="Topics, promises or wording to avoid.">
                <textarea id="ai-dont" name="doNotSay" defaultValue={settings.doNotSay ?? ''} maxLength={1000} className={area} placeholder="Do not discuss other agencies. Do not quote rates from last year’s schedule…" />
              </Field>
            </div>
            <label className="flex items-start gap-3 rounded-card border border-line bg-surface-3 p-3 text-[13.5px] text-ink">
              <input type="checkbox" name="useGeneralCatalogue" value="on" defaultChecked={settings.useGeneralCatalogue !== false} className="mt-0.5 size-4 accent-forest" />
              <span>
                <span className="font-semibold">Use general insurance knowledge as background.</span>
                <span className="block text-ink-muted">A neutral description of product types (motor, medical, WIBA, fire…). It never names another agency. Untick to answer only from your own text above.</span>
              </span>
            </label>
            <input type="hidden" name="useGeneralCatalogue" value="off" />
          </fieldset>
          {canEdit ? (
            <button type="submit" disabled={pending} className="inline-flex h-11 items-center justify-center gap-2 rounded-control bg-forest px-5 text-[14px] font-semibold text-white hover:bg-forest-700 disabled:opacity-60 focus-ring">
              {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Save className="size-4" aria-hidden="true" />}
              {pending ? 'Saving…' : 'Save assistant settings'}
            </button>
          ) : null}
        </form>
        <StatusLine success={state.success} error={state.error} onDismiss={() => setState({})} />
      </Card>
      <div className="space-y-6 lg:col-span-4">
        <Card as="section">
          <CardHeader title="Fixed for every agency" level={3} />
          <ul className="mt-3 space-y-2 text-[13px] text-ink-muted">
            <li>· Speaks only for your agency; never mentions or compares another agency.</li>
            <li>· Never quotes a firm premium or promises a claim outcome.</li>
            <li>· Says when it does not know and offers a person.</li>
            <li>· Hands over to your team for complaints, disputes and live claim decisions.</li>
            <li>· Uses each client’s own records only for that client.</li>
          </ul>
          <p className="mt-4 text-[12px] text-ink-faint">Model in use: {modelLabel}</p>
        </Card>
      </div>
    </div>
  )
}

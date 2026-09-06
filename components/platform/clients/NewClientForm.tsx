'use client'

import { useState, useTransition } from 'react'
import { Field, inputClass } from '@/components/platform/auth/AuthShell'
import { Card } from '@/components/platform/ui/Card'
import { createClientAction, type ActionState } from '@/lib/agency/actions'

/** Agency adds a lead by hand (walk-in, referral, phone call). */
export function NewClientForm() {
  const [state, setState] = useState<ActionState>({})
  const [pending, startTransition] = useTransition()

  function submit(formData: FormData) {
    setState({})
    startTransition(async () => {
      const result = await createClientAction(formData)
      if (result) setState(result)
    })
  }

  return (
    <Card as="section" className="max-w-xl">
      <form action={submit} className="space-y-4" noValidate>
        <Field label="Client or business name" htmlFor="nc-name">
          <input id="nc-name" name="name" required className={inputClass} placeholder="e.g. Otieno Bakery Ltd" />
        </Field>
        <Field label="Type" htmlFor="nc-type">
          <select id="nc-type" name="type" className={inputClass} defaultValue="sme">
            <option value="individual">Individual or family</option>
            <option value="sme">SME</option>
            <option value="corporate">Corporate</option>
          </select>
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="WhatsApp number" htmlFor="nc-phone" hint="Reminders and updates go here.">
            <input id="nc-phone" name="phone" type="tel" className={inputClass} placeholder="0712 345 678" />
          </Field>
          <Field label="Email" htmlFor="nc-email">
            <input id="nc-email" name="email" type="email" className={inputClass} placeholder="owner@business.co.ke" />
          </Field>
        </div>
        <Field label="What do they want to protect?" htmlFor="nc-notes">
          <textarea id="nc-notes" name="notes" rows={3} maxLength={1000} className={inputClass + ' h-auto py-2.5'} placeholder="Premises, stock, vehicles, staff, contracts…" />
        </Field>
        {state.error ? <p role="alert" className="rounded-control border border-error/25 bg-error/10 px-3 py-2 text-[13px] text-error">{state.error}</p> : null}
        <button type="submit" disabled={pending} className="inline-flex h-11 items-center justify-center rounded-control bg-forest px-5 text-[14px] font-semibold text-white hover:bg-forest-700 disabled:opacity-60 focus-ring">
          {pending ? 'Adding…' : 'Add lead'}
        </button>
      </form>
    </Card>
  )
}

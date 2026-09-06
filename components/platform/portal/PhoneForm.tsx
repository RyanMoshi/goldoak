'use client'

import { useState, useTransition } from 'react'
import { Field, inputClass } from '@/components/platform/auth/AuthShell'
import { cn } from '@/lib/cn'
import { updatePhoneAction, type PortalActionState } from '@/lib/portal/actions'

export function PhoneForm({ current }: { current: string | null }) {
  const [state, setState] = useState<PortalActionState>({})
  const [pending, startTransition] = useTransition()
  return (
    <form
      action={(fd) => {
        setState({})
        startTransition(async () => setState(await updatePhoneAction(fd)))
      }}
      className="flex flex-col gap-3 sm:flex-row sm:items-end"
    >
      <div className="flex-1">
        <Field label="WhatsApp number" htmlFor="pf-phone" hint="The number you message us from.">
          <input id="pf-phone" name="phone" type="tel" defaultValue={current ? `+${current}` : ''} className={inputClass} placeholder="+255 742 473 493" />
        </Field>
      </div>
      <button type="submit" disabled={pending} className="inline-flex h-11 items-center justify-center rounded-control bg-forest px-4 text-[14px] font-semibold text-white hover:bg-forest-700 disabled:opacity-60 focus-ring">
        {pending ? 'Saving…' : 'Save'}
      </button>
      {state.success || state.error ? <p role="status" className={cn('text-[13px] sm:basis-full', state.success ? 'text-success' : 'text-error')}>{state.success ?? state.error}</p> : null}
    </form>
  )
}

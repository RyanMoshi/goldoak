'use client'

import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useState, useTransition } from 'react'
import { Field, inputClass } from '@/components/platform/auth/AuthShell'
import { changePasswordAction, type PasswordState } from '@/lib/auth/actions'

/** Mandatory on first login (temporary password); also reachable from the profile. */
export function ChangePasswordForm({ first }: { first: boolean }) {
  const [state, setState] = useState<PasswordState>({})
  const [pending, startTransition] = useTransition()
  const [show, setShow] = useState(false)

  function submit(formData: FormData) {
    setState({})
    startTransition(async () => {
      const result = await changePasswordAction(formData)
      if (result) setState(result)
    })
  }

  const type = show ? 'text' : 'password'
  return (
    <div className="animate-fade-up">
      <p className="label-caps text-gold-700">{first ? 'First sign-in' : 'Security'}</p>
      <h2 className="mt-2 font-serif text-[26px] font-medium leading-tight text-forest sm:text-[28px]">{first ? 'Create your new password' : 'Change password'}</h2>
      <form action={submit} className="mt-6 space-y-5" noValidate>
        <Field label={first ? 'Temporary password' : 'Current password'} htmlFor="current">
          <input id="current" name="current" type={type} autoComplete="current-password" required className={inputClass} />
        </Field>
        <Field label="New password" htmlFor="password" hint="At least 10 characters, with a letter and a number.">
          <div className="relative">
            <input id="password" name="password" type={type} autoComplete="new-password" required minLength={10} className={`${inputClass} pr-11`} />
            <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? 'Hide passwords' : 'Show passwords'} className="absolute right-1.5 top-1/2 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-control text-ink-muted hover:text-ink focus-ring">
              {show ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
            </button>
          </div>
        </Field>
        <Field label="Repeat new password" htmlFor="confirm">
          <input id="confirm" name="confirm" type={type} autoComplete="new-password" required className={inputClass} />
        </Field>
        {state.error ? (
          <p role="alert" className="rounded-control border border-error/25 bg-error/10 px-3 py-2 text-[13px] text-error">
            {state.error}
          </p>
        ) : null}
        <button type="submit" disabled={pending} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-control bg-forest text-[15px] font-semibold text-white hover:bg-forest-700 disabled:opacity-60 focus-ring">
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
          {pending ? 'Saving…' : first ? 'Save and continue' : 'Change password'}
        </button>
      </form>
    </div>
  )
}

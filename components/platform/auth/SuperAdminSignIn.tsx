'use client'

import { Loader2, LogIn } from 'lucide-react'
import { useState, useTransition } from 'react'
import { Field, inputClass } from '@/components/platform/auth/AuthShell'
import { superAdminSignInAction, type AuthState } from '@/lib/auth/actions'

/**
 * The platform operator's sign-in form. It posts to an action that only
 * accepts a platform administrator, so an agency or client password typed
 * here fails exactly like a wrong password — no hint that the account exists
 * somewhere else.
 */
export function SuperAdminSignIn({ next }: { next?: string }) {
  const [state, setState] = useState<AuthState>({})
  const [pending, startTransition] = useTransition()

  return (
    <form
      action={(formData) =>
        startTransition(async () => {
          const result = await superAdminSignInAction(formData)
          if (result) setState(result)
        })
      }
      className="mt-6 space-y-4"
      noValidate
    >
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <Field label="Email" htmlFor="sa-email" error={state.field === 'email' ? state.error : undefined}>
        <input id="sa-email" name="email" type="email" autoComplete="username" required className={inputClass} placeholder="you@example.com" aria-invalid={state.field === 'email'} />
      </Field>
      <Field label="Password" htmlFor="sa-password" error={state.field === 'password' ? state.error : undefined}>
        <input id="sa-password" name="password" type="password" autoComplete="current-password" required className={inputClass} aria-invalid={state.field === 'password'} />
      </Field>

      {state.error && !state.field ? (
        <p role="alert" className="rounded-control border border-error/25 bg-error/10 px-3 py-2 text-[13px] text-error">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-control bg-forest text-[14.5px] font-semibold text-white hover:bg-forest-700 disabled:opacity-60 focus-ring"
      >
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <LogIn className="size-4" aria-hidden="true" />}
        {pending ? 'Signing in…' : 'Sign in'}
      </button>

      <p className="text-center text-[12px] leading-5 text-ink-faint">
        Locked out? Set a new <code className="font-mono">ADMIN_PASSWORD</code> on the deployment and re-run the bootstrap endpoint.
      </p>
    </form>
  )
}

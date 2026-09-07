'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { Field, inputClass } from '@/components/platform/auth/AuthShell'
import { requestPasswordResetAction, resetPasswordAction, type ResetState } from '@/lib/auth/actions'

export function ForgotPasswordForm() {
  const [state, setState] = useState<ResetState>({})
  const [pending, startTransition] = useTransition()
  return (
    <div className="animate-fade-up">
      <p className="label-caps text-gold-700">Forgot password</p>
      <h2 className="mt-2 font-serif text-[28px] font-medium leading-tight text-forest">We will email you a reset link.</h2>
      <form
        action={(fd) => {
          setState({})
          startTransition(async () => setState(await requestPasswordResetAction(fd)))
        }}
        className="mt-6 space-y-4"
        noValidate
      >
        <Field label="Email on your account" htmlFor="fp-email">
          <input id="fp-email" name="email" type="email" autoComplete="email" required className={inputClass} placeholder="you@example.com" />
        </Field>
        {state.error ? (
          <p role="alert" className="rounded-control border border-error/25 bg-error/10 px-3 py-2 text-[13px] text-error">
            {state.error}
          </p>
        ) : null}
        {state.success ? (
          <p role="status" className="rounded-control border border-success/25 bg-success/10 px-3 py-2 text-[13px] text-ink">
            {state.success}
          </p>
        ) : null}
        <button type="submit" disabled={pending} className="inline-flex h-11 w-full items-center justify-center rounded-control bg-forest text-[14px] font-semibold text-white hover:bg-forest-700 disabled:opacity-60 focus-ring">
          {pending ? 'Sending…' : 'Send reset link'}
        </button>
      </form>
      <p className="mt-6 text-[13.5px] text-ink-muted">
        <Link href="/signin" className="font-semibold text-forest underline-offset-2 hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  )
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, setState] = useState<ResetState>({})
  const [pending, startTransition] = useTransition()
  return (
    <div className="animate-fade-up">
      <p className="label-caps text-gold-700">Reset password</p>
      <h2 className="mt-2 font-serif text-[28px] font-medium leading-tight text-forest">Choose a new password.</h2>
      {state.success ? (
        <div className="mt-6 space-y-4">
          <p role="status" className="rounded-control border border-success/25 bg-success/10 px-3 py-2 text-[13px] text-ink">
            {state.success}
          </p>
          <Link href="/signin" className="inline-flex h-11 w-full items-center justify-center rounded-control bg-forest text-[14px] font-semibold text-white hover:bg-forest-700 focus-ring">
            Sign in
          </Link>
        </div>
      ) : (
        <form
          action={(fd) => {
            setState({})
            startTransition(async () => setState(await resetPasswordAction(fd)))
          }}
          className="mt-6 space-y-4"
          noValidate
        >
          <input type="hidden" name="token" value={token} />
          <Field label="New password" htmlFor="rp-password" hint="At least 8 characters.">
            <input id="rp-password" name="password" type="password" autoComplete="new-password" required className={inputClass} />
          </Field>
          <Field label="Confirm new password" htmlFor="rp-confirm">
            <input id="rp-confirm" name="confirm" type="password" autoComplete="new-password" required className={inputClass} />
          </Field>
          {state.error ? (
            <p role="alert" className="rounded-control border border-error/25 bg-error/10 px-3 py-2 text-[13px] text-error">
              {state.error}
            </p>
          ) : null}
          <button type="submit" disabled={pending} className="inline-flex h-11 w-full items-center justify-center rounded-control bg-forest text-[14px] font-semibold text-white hover:bg-forest-700 disabled:opacity-60 focus-ring">
            {pending ? 'Saving…' : 'Set new password'}
          </button>
        </form>
      )}
    </div>
  )
}

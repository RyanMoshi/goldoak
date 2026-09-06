'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { Field, inputClass } from '@/components/platform/auth/AuthShell'
import { signUpAction, type AuthState } from '@/lib/auth/actions'
import { cn } from '@/lib/cn'

type ClientType = 'individual' | 'sme' | 'corporate'

const types: { id: ClientType; label: string; hint: string }[] = [
  { id: 'individual', label: 'Myself and family', hint: 'Car, home, health, life' },
  { id: 'sme', label: 'My business', hint: 'Staff, stock, premises, vehicles' },
  { id: 'corporate', label: 'An organisation', hint: 'Multiple classes of cover' },
]

/** Clients only. Agency accounts are provisioned by GoldOak. */
export function SignUpForm() {
  const [clientType, setClientType] = useState<ClientType>('individual')
  const [state, setState] = useState<AuthState>({})
  const [pending, startTransition] = useTransition()

  function submit(formData: FormData) {
    setState({})
    startTransition(async () => {
      const result = await signUpAction(formData)
      if (result) setState(result)
    })
  }

  const err = (field: AuthState['field']) => (state.field === field ? state.error : undefined)

  return (
    <div className="animate-fade-up">
      <p className="label-caps text-gold-700">Create account</p>
      <h2 className="mt-2 font-serif text-[28px] font-medium leading-tight text-forest">Tell us what you want to protect.</h2>
      <p className="mt-2 text-[14px] text-ink-muted">Free. Your adviser books a short risk conversation, then you can follow every step here or on WhatsApp.</p>

      <form action={submit} className="mt-6 space-y-5" noValidate>
        <input type="hidden" name="clientType" value={clientType} />
        <div role="radiogroup" aria-label="I am insuring" className="grid gap-2">
          {types.map((t) => (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={clientType === t.id}
              onClick={() => setClientType(t.id)}
              className={cn(
                'flex items-center justify-between rounded-control border px-3 py-2.5 text-left transition-colors focus-ring',
                clientType === t.id ? 'border-forest bg-forest text-white' : 'border-line bg-surface text-ink hover:border-line-strong',
              )}
            >
              <span>
                <span className="block text-[13.5px] font-bold">{t.label}</span>
                <span className={cn('block text-[12px]', clientType === t.id ? 'text-white/70' : 'text-ink-faint')}>{t.hint}</span>
              </span>
              <span aria-hidden="true" className={cn('size-4 rounded-full border-2', clientType === t.id ? 'border-gold bg-gold' : 'border-line-strong')} />
            </button>
          ))}
        </div>

        <Field label="Your full name" htmlFor="name" error={err('name')}>
          <input id="name" name="name" autoComplete="name" required className={inputClass} placeholder="e.g. Peter Mwangi" aria-invalid={state.field === 'name'} />
        </Field>
        {clientType !== 'individual' ? (
          <Field label={clientType === 'sme' ? 'Business name' : 'Organisation name'} htmlFor="businessName">
            <input id="businessName" name="businessName" autoComplete="organization" className={inputClass} placeholder={clientType === 'sme' ? 'e.g. Mwangi Hardware' : 'e.g. Nairobi Heights Ltd'} />
          </Field>
        ) : null}
        <Field label="Email" htmlFor="email" error={err('email')}>
          <input id="email" name="email" type="email" autoComplete="email" required className={inputClass} placeholder="you@example.com" aria-invalid={state.field === 'email'} />
        </Field>
        <Field label="WhatsApp number" htmlFor="phone" error={err('phone')} hint="We recognise you by this number on WhatsApp, and send reminders and updates there.">
          <input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" required className={inputClass} placeholder="0712 345 678 or +255 742 473 493" aria-invalid={state.field === 'phone'} />
        </Field>
        <Field label="What would you like to protect?" htmlFor="protect" hint="Optional. A sentence is enough; your adviser starts from here.">
          <textarea id="protect" name="protect" rows={2} maxLength={500} className={inputClass + ' h-auto py-2.5'} placeholder="e.g. Two delivery vans, a shop in Kariobangi and 6 staff" />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Password" htmlFor="password" error={err('password')} hint="At least 8 characters.">
            <input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} className={inputClass} aria-invalid={state.field === 'password'} />
          </Field>
          <Field label="Confirm password" htmlFor="confirm" error={err('confirm')}>
            <input id="confirm" name="confirm" type="password" autoComplete="new-password" required className={inputClass} aria-invalid={state.field === 'confirm'} />
          </Field>
        </div>
        {state.error && !state.field ? (
          <p role="alert" className="rounded-control border border-error/25 bg-error/10 px-3 py-2 text-[13px] text-error">
            {state.error}
          </p>
        ) : null}
        <button type="submit" disabled={pending} className="inline-flex h-12 w-full items-center justify-center rounded-control bg-gold text-[15px] font-semibold text-white transition-colors hover:bg-gold-500 disabled:opacity-60 focus-ring">
          {pending ? 'Creating your account…' : 'Create my account'}
        </button>
        <p className="text-[12px] leading-relaxed text-ink-faint">
          By creating an account you agree to be contacted by GoldOak about your insurance. We hold your details under the Data Protection Act 2019 and never share them with anyone except the insurers you ask us to approach.
        </p>
      </form>

      <p className="mt-6 text-[13.5px] text-ink-muted">
        Already have an account?{' '}
        <Link href="/signin?as=client" className="font-semibold text-forest underline-offset-2 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}

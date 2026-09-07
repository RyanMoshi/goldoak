'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { Field, inputClass } from '@/components/platform/auth/AuthShell'
import { agencySignUpAction, type AgencySignUpState } from '@/lib/auth/actions'
import { cn } from '@/lib/cn'

const TYPES = ['Insurance agency', 'Insurance broker', 'Bancassurance', 'Other intermediary']

/** Two short steps: the agency, then your login. Progressive, validated, one clear next step. */
export function AgencySignUpForm() {
  const [step, setStep] = useState<1 | 2>(1)
  const [state, setState] = useState<AgencySignUpState>({})
  const [pending, startTransition] = useTransition()
  const [agency, setAgency] = useState({ name: '', shortName: '', type: TYPES[0], code: '', phone: '', email: '', address: '', description: '' })

  const err = (field: AgencySignUpState['field']) => (state.field === field ? state.error : undefined)

  function next() {
    setState({})
    if (agency.name.trim().length < 2) return setState({ error: 'Enter the agency name.', field: 'name' })
    const code = agency.code.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '')
    if (code.length < 3 || code.length > 12) return setState({ error: 'Choose a join code of 3 to 12 letters or digits.', field: 'code' })
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(agency.email.trim())) return setState({ error: 'Enter the agency contact email.', field: 'email' })
    setAgency((a) => ({ ...a, code }))
    setStep(2)
  }

  function submit(formData: FormData) {
    setState({})
    for (const [k, v] of Object.entries(agency)) formData.set(k, v)
    startTransition(async () => {
      const result = await agencySignUpAction(formData)
      if (result) {
        setState(result)
        if (result.field && ['name', 'code', 'email'].includes(result.field)) setStep(1)
      }
    })
  }

  return (
    <div className="animate-fade-up">
      <p className="label-caps text-gold-700">For agencies · Step {step} of 2</p>
      <h2 className="mt-2 font-serif text-[28px] font-medium leading-tight text-forest">{step === 1 ? 'Tell us about your agency.' : 'Create your admin login.'}</h2>
      <p className="mt-2 text-[14px] text-ink-muted">{step === 1 ? 'Clients reach you on the shared Super Agent WhatsApp with your join code. GoldOak approves new agencies before they go live.' : 'You will invite your team from the workspace.'}</p>

      <div className="mt-5 flex gap-1.5" aria-hidden="true">
        <span className={cn('h-1.5 flex-1 rounded-full', 'bg-gold')} />
        <span className={cn('h-1.5 flex-1 rounded-full', step === 2 ? 'bg-gold' : 'bg-line')} />
      </div>

      {step === 1 ? (
        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            next()
          }}
          noValidate
        >
          <Field label="Agency name" htmlFor="ag-name" error={err('name')}>
            <input id="ag-name" className={inputClass} value={agency.name} onChange={(e) => setAgency({ ...agency, name: e.target.value })} placeholder="Acme Insurance Agency" required />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Short name" htmlFor="ag-short" hint="Used in WhatsApp messages.">
              <input id="ag-short" className={inputClass} value={agency.shortName} onChange={(e) => setAgency({ ...agency, shortName: e.target.value })} placeholder="Acme" />
            </Field>
            <Field label="Type" htmlFor="ag-type">
              <select id="ag-type" className={inputClass} value={agency.type} onChange={(e) => setAgency({ ...agency, type: e.target.value })}>
                {TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="WhatsApp join code" htmlFor="ag-code" error={err('code')} hint="Clients send JOIN <code> to reach you.">
              <input id="ag-code" className={`${inputClass} font-mono uppercase`} value={agency.code} onChange={(e) => setAgency({ ...agency, code: e.target.value.toUpperCase() })} placeholder="ACME" required />
            </Field>
            <Field label="Agency phone" htmlFor="ag-phone">
              <input id="ag-phone" type="tel" className={inputClass} value={agency.phone} onChange={(e) => setAgency({ ...agency, phone: e.target.value })} placeholder="+254 7xx xxx xxx" />
            </Field>
          </div>
          <Field label="Agency email" htmlFor="ag-email" error={err('email')}>
            <input id="ag-email" type="email" className={inputClass} value={agency.email} onChange={(e) => setAgency({ ...agency, email: e.target.value })} placeholder="info@acme.co.ke" required />
          </Field>
          <Field label="Address" htmlFor="ag-address">
            <input id="ag-address" className={inputClass} value={agency.address} onChange={(e) => setAgency({ ...agency, address: e.target.value })} placeholder="Nairobi" />
          </Field>
          <Field label="What you do" htmlFor="ag-desc" hint="One or two sentences. Shown to the platform admin.">
            <textarea id="ag-desc" className={`${inputClass} min-h-[72px] resize-y py-2`} value={agency.description} onChange={(e) => setAgency({ ...agency, description: e.target.value })} maxLength={600} />
          </Field>
          <button type="submit" className="inline-flex h-11 w-full items-center justify-center rounded-control bg-forest text-[14px] font-semibold text-white hover:bg-forest-700 focus-ring">
            Continue
          </button>
        </form>
      ) : (
        <form action={submit} className="mt-6 space-y-4" noValidate>
          <Field label="Your full name" htmlFor="ag-admin-name" error={err('adminName')}>
            <input id="ag-admin-name" name="adminName" className={inputClass} required placeholder="Jane Otieno" />
          </Field>
          <Field label="Your email (username)" htmlFor="ag-admin-email" error={err('adminEmail')}>
            <input id="ag-admin-email" name="adminEmail" type="email" className={inputClass} required placeholder="jane@acme.co.ke" />
          </Field>
          <Field label="Your WhatsApp number" htmlFor="ag-admin-phone" error={err('phone')} hint="Lets you run the workspace from WhatsApp.">
            <input id="ag-admin-phone" name="adminPhone" type="tel" className={inputClass} placeholder="0712 345 678" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Password" htmlFor="ag-password" error={err('password')} hint="At least 8 characters.">
              <input id="ag-password" name="password" type="password" autoComplete="new-password" className={inputClass} required />
            </Field>
            <Field label="Confirm password" htmlFor="ag-confirm" error={err('confirm')}>
              <input id="ag-confirm" name="confirm" type="password" autoComplete="new-password" className={inputClass} required />
            </Field>
          </div>
          {state.error && !state.field ? (
            <p role="alert" className="rounded-control border border-error/25 bg-error/10 px-3 py-2 text-[13px] text-error">
              {state.error}
            </p>
          ) : null}
          <div className="flex gap-2">
            <button type="button" onClick={() => setStep(1)} className="inline-flex h-11 items-center justify-center rounded-control border border-line px-4 text-[14px] font-semibold text-ink hover:border-ink-muted focus-ring">
              Back
            </button>
            <button type="submit" disabled={pending} className="inline-flex h-11 flex-1 items-center justify-center rounded-control bg-forest text-[14px] font-semibold text-white hover:bg-forest-700 disabled:opacity-60 focus-ring">
              {pending ? 'Creating your agency…' : 'Create agency'}
            </button>
          </div>
          <p className="text-[12px] text-ink-muted">
            By continuing you agree to the <Link href="/terms" className="underline">terms</Link> and <Link href="/privacy" className="underline">privacy notice</Link>.
          </p>
        </form>
      )}
      <p className="mt-6 text-[13.5px] text-ink-muted">
        Already have a login?{' '}
        <Link href="/signin?as=agency" className="font-semibold text-forest underline-offset-2 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}

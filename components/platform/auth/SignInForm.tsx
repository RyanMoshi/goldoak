'use client'

import Link from 'next/link'
import { Building2, UserRound } from 'lucide-react'
import { useState, useTransition } from 'react'
import { Field, inputClass } from '@/components/platform/auth/AuthShell'
import { signInAction, type AuthState } from '@/lib/auth/actions'
import { cn } from '@/lib/cn'

type Role = 'client' | 'agency'

export function SignInForm({ initialRole, next }: { initialRole: Role; next: string | null }) {
  const [role, setRole] = useState<Role>(initialRole)
  const [state, setState] = useState<AuthState>({})
  const [pending, startTransition] = useTransition()

  function submit(formData: FormData) {
    setState({})
    startTransition(async () => {
      const result = await signInAction(formData)
      if (result) setState(result)
    })
  }

  return (
    <div className="animate-fade-up">
      <p className="label-caps text-gold-700">Sign in</p>
      <h2 className="mt-2 font-serif text-[28px] font-medium leading-tight text-forest">Welcome back.</h2>

      <div role="radiogroup" aria-label="I am signing in as" className="mt-6 grid grid-cols-2 gap-2 rounded-card border border-line bg-surface p-1">
        <RoleTab active={role === 'client'} onClick={() => setRole('client')} icon={UserRound} label="Client" hint="See my progress" />
        <RoleTab active={role === 'agency'} onClick={() => setRole('agency')} icon={Building2} label="Agency" hint="Manage clients" />
      </div>

      <form action={submit} className="mt-6 space-y-5" noValidate>
        <input type="hidden" name="role" value={role} />
        {next ? <input type="hidden" name="next" value={next} /> : null}
        <Field label="Email" htmlFor="email" error={state.field === 'email' ? state.error : undefined}>
          <input id="email" name="email" type="email" autoComplete="email" required className={inputClass} placeholder={role === 'agency' ? 'you@youragency.co.ke' : 'you@example.com'} aria-invalid={state.field === 'email'} />
        </Field>
        <Field label="Password" htmlFor="password" error={state.field === 'password' ? state.error : undefined}>
          <input id="password" name="password" type="password" autoComplete="current-password" required className={inputClass} aria-invalid={state.field === 'password'} />
        </Field>
        {state.error && !state.field ? (
          <p role="alert" className="rounded-control border border-error/25 bg-error/10 px-3 py-2 text-[13px] text-error">
            {state.error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-12 w-full items-center justify-center rounded-control bg-forest text-[15px] font-semibold text-white transition-colors hover:bg-forest-700 disabled:opacity-60 focus-ring"
        >
          {pending ? 'Signing in…' : role === 'agency' ? 'Sign in to Super Agent' : 'Sign in'}
        </button>
      </form>

      <div className="mt-6 space-y-2 text-[13.5px] text-ink-muted">
        {role === 'client' ? (
          <p>
            New to GoldOak?{' '}
            <Link href="/signup" className="font-semibold text-forest underline-offset-2 hover:underline">
              Create your account
            </Link>
          </p>
        ) : (
          <p>Agency accounts are set up by GoldOak. Ask your principal if you need one.</p>
        )}
        <p>
          Forgot your password? Message us on{' '}
          <a href="https://wa.me/254729911311" target="_blank" rel="noopener noreferrer" className="font-semibold text-forest underline-offset-2 hover:underline">
            WhatsApp
          </a>{' '}
          and we will reset it.
        </p>
      </div>
    </div>
  )
}

function RoleTab({ active, onClick, icon: Icon, label, hint }: { active: boolean; onClick: () => void; icon: typeof UserRound; label: string; hint: string }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={cn('flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-left transition-colors focus-ring', active ? 'bg-forest text-white' : 'text-ink-muted hover:bg-surface-2')}
    >
      <Icon className={cn('size-5 shrink-0', active ? 'text-gold' : 'text-ink-faint')} aria-hidden="true" strokeWidth={1.75} />
      <span className="min-w-0">
        <span className="block text-[13.5px] font-bold">{label}</span>
        <span className={cn('block text-[11.5px]', active ? 'text-white/70' : 'text-ink-faint')}>{hint}</span>
      </span>
    </button>
  )
}

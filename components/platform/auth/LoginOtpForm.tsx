'use client'

import { Loader2, MailCheck, ShieldCheck } from 'lucide-react'
import { useEffect, useRef, useState, useTransition } from 'react'
import { cancelLoginAction, resendLoginOtpAction, verifyLoginAction, type LoginOtpState } from '@/lib/auth/login-actions'

/**
 * The code step of signing in. A code is sent the moment this appears, the
 * countdown shows how long it lasts, and resending is held back for a minute so
 * a stuck inbox does not turn into a flood.
 */
export function LoginOtpForm({ email }: { email: string }) {
  const [state, setState] = useState<LoginOtpState>({})
  const [pending, startTransition] = useTransition()
  const [code, setCode] = useState('')
  const [expiresAt, setExpiresAt] = useState<number | null>(null)
  const [now, setNow] = useState(Date.now())
  const sentOnce = useRef(false)

  useEffect(() => {
    if (sentOnce.current) return
    sentOnce.current = true
    startTransition(async () => {
      const r = await resendLoginOtpAction()
      setState(r)
      if (r.expiresAt) setExpiresAt(new Date(r.expiresAt).getTime())
    })
  }, [])

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const remaining = expiresAt ? Math.max(0, Math.floor((expiresAt - now) / 1000)) : null
  const clock = remaining != null ? `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}` : null
  // A code lasts ten minutes; resend opens up after the first minute.
  const resendIn = remaining != null && remaining > 540 ? remaining - 540 : 0

  function verify(value: string) {
    if (value.length !== 6 || pending) return
    setState({})
    startTransition(async () => {
      const r = await verifyLoginAction(value)
      if (r) setState(r)
    })
  }

  return (
    <div className="animate-fade-up">
      <p className="label-caps text-gold-700">Two-step sign-in</p>
      <h2 className="mt-2 font-serif text-[26px] font-medium leading-tight text-forest sm:text-[28px]">Enter your code</h2>
      <p className="mt-2 flex items-center gap-2 text-[14px] text-ink-muted">
        <MailCheck className="size-4 text-forest" aria-hidden="true" /> Sent to <span className="font-semibold text-ink">{email}</span>
      </p>

      <form
        className="mt-6 space-y-5"
        onSubmit={(e) => {
          e.preventDefault()
          verify(code)
        }}
        noValidate
      >
        <label htmlFor="login-otp" className="block text-[13px] font-semibold text-ink">
          Six-digit code
        </label>
        <input
          id="login-otp"
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus
          pattern="[0-9]*"
          maxLength={6}
          value={code}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, '').slice(0, 6)
            setCode(v)
            if (v.length === 6) verify(v)
          }}
          className="h-14 w-full rounded-control border border-line bg-surface text-center font-mono text-[28px] tracking-[0.5em] text-ink focus-ring"
          placeholder="••••••"
          aria-describedby="login-otp-expiry"
        />
        <p id="login-otp-expiry" className="text-[13px] text-ink-muted">
          {clock ? (remaining ? `This code expires in ${clock}.` : 'That code has expired. Send a new one.') : 'Sending your code…'}
        </p>

        {state.error ? (
          <p role="alert" className="rounded-control border border-error/25 bg-error/10 px-3 py-2 text-[13px] text-error">
            {state.error}
          </p>
        ) : null}
        {state.success ? <p className="rounded-control border border-success/25 bg-success/10 px-3 py-2 text-[13px] text-ink">{state.success}</p> : null}

        <button
          type="submit"
          disabled={pending || code.length !== 6}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-control bg-forest text-[15px] font-semibold text-white transition-colors hover:bg-forest-700 disabled:opacity-60 focus-ring"
        >
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <ShieldCheck className="size-4" aria-hidden="true" />}
          {pending ? 'Checking…' : 'Sign in'}
        </button>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => {
              setState({})
              startTransition(async () => {
                const r = await resendLoginOtpAction()
                setState(r)
                if (r.expiresAt) setExpiresAt(new Date(r.expiresAt).getTime())
              })
            }}
            disabled={pending || resendIn > 0}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-control border border-line text-[14px] font-semibold text-ink transition-colors hover:border-ink-muted disabled:opacity-50 focus-ring"
          >
            {resendIn > 0 ? `Resend in ${resendIn}s` : "Didn't get it? Resend"}
          </button>
          <button
            type="button"
            onClick={() => startTransition(async () => void (await cancelLoginAction()))}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-control text-[14px] font-semibold text-ink-muted transition-colors hover:text-ink focus-ring"
          >
            Use a different account
          </button>
        </div>
      </form>
    </div>
  )
}

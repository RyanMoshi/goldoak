'use client'

import { Loader2, MailCheck } from 'lucide-react'
import { useEffect, useRef, useState, useTransition } from 'react'
import { resendOtpAction, verifyEmailAction, type OtpState } from '@/lib/auth/otp-actions'

/** Six-digit code entry with expiry countdown and rate-limited resend. */
export function OtpForm({ email, next }: { email: string; next: string }) {
  const [state, setState] = useState<OtpState>({})
  const [pending, startTransition] = useTransition()
  const [code, setCode] = useState('')
  const [expiresAt, setExpiresAt] = useState<number | null>(null)
  const [now, setNow] = useState(Date.now())
  const sentOnce = useRef(false)

  useEffect(() => {
    if (sentOnce.current) return
    sentOnce.current = true
    startTransition(async () => {
      const r = await resendOtpAction()
      setState(r)
      if (r.expiresAt) setExpiresAt(new Date(r.expiresAt).getTime())
    })
  }, [])

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const remaining = expiresAt ? Math.max(0, Math.floor((expiresAt - now) / 1000)) : null
  const mm = remaining != null ? `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}` : null

  function verify(value: string) {
    if (value.length !== 6 || pending) return
    setState({})
    startTransition(async () => {
      const r = await verifyEmailAction(value, next)
      if (r) setState(r)
    })
  }

  function resend() {
    setState({})
    startTransition(async () => {
      const r = await resendOtpAction()
      setState(r)
      if (r.expiresAt) setExpiresAt(new Date(r.expiresAt).getTime())
    })
  }

  return (
    <div className="animate-fade-up">
      <p className="label-caps text-gold-700">Email verification</p>
      <h2 className="mt-2 font-serif text-[26px] font-medium leading-tight text-forest sm:text-[28px]">Verify your email</h2>
      <p className="mt-2 flex items-center gap-2 text-[14px] text-ink-muted">
        <MailCheck className="size-4 text-forest" aria-hidden="true" /> We sent a code to <span className="font-semibold text-ink">{email}</span>
      </p>
      <form
        className="mt-6 space-y-5"
        onSubmit={(e) => {
          e.preventDefault()
          verify(code)
        }}
        noValidate
      >
        <label htmlFor="otp" className="block text-[13px] font-semibold text-ink">
          Six-digit code
        </label>
        <input
          id="otp"
          inputMode="numeric"
          autoComplete="one-time-code"
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
          aria-describedby="otp-expiry"
        />
        <p id="otp-expiry" className="text-[13px] text-ink-muted">
          {mm ? (remaining ? `Code expires in ${mm}.` : 'That code has expired. Send a new one.') : 'Sending your code…'}
        </p>
        {state.error ? (
          <p role="alert" className="rounded-control border border-error/25 bg-error/10 px-3 py-2 text-[13px] text-error">
            {state.error}
          </p>
        ) : null}
        {state.success ? <p className="rounded-control border border-success/25 bg-success/10 px-3 py-2 text-[13px] text-ink">{state.success}</p> : null}
        <button type="submit" disabled={pending || code.length !== 6} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-control bg-forest text-[15px] font-semibold text-white hover:bg-forest-700 disabled:opacity-60 focus-ring">
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
          {pending ? 'Checking…' : 'Verify email'}
        </button>
        <button type="button" onClick={resend} disabled={pending || (remaining != null && remaining > 540)} className="inline-flex h-11 w-full items-center justify-center rounded-control border border-line text-[14px] font-semibold text-ink hover:border-ink-muted disabled:opacity-50 focus-ring">
          {remaining != null && remaining > 540 ? `Resend available in ${remaining - 540}s` : 'Resend code'}
        </button>
      </form>
    </div>
  )
}

import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { AuthShell } from '@/components/platform/auth/AuthShell'
import { LoginOtpForm } from '@/components/platform/auth/LoginOtpForm'
import { readPending } from '@/lib/auth/pending'

export const metadata: Metadata = { title: 'Enter your code' }
export const dynamic = 'force-dynamic'

/**
 * The code step. Reachable only with a valid challenge cookie, so a stale link
 * or a direct visit lands back at the password screen rather than here.
 */
export default function VerifyLoginPage() {
  const pending = readPending()
  if (!pending) redirect('/signin')
  return (
    <AuthShell
      title="One more step."
      intro="Your password was right. For your protection we email a six-digit code every time you sign in. It lasts ten minutes."
      aside={null}
    >
      <LoginOtpForm email={pending.email} />
    </AuthShell>
  )
}

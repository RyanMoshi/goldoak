import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { AuthShell } from '@/components/platform/auth/AuthShell'
import { OtpForm } from '@/components/platform/auth/OtpForm'
import { requireAnySession } from '@/lib/auth/server'
import { homeFor } from '@/lib/auth/session'
import { getUser } from '@/services/users'

export const metadata: Metadata = { title: 'Verify your email' }
export const dynamic = 'force-dynamic'

export default async function VerifyEmailPage({ searchParams }: { searchParams: { next?: string } }) {
  const session = await requireAnySession()
  const user = await getUser(session.uid)
  const next = searchParams.next && searchParams.next.startsWith('/') ? searchParams.next : homeFor(session.role)
  if (!user) redirect('/signin')
  if (user.emailVerifiedAt) redirect(next)
  return (
    <AuthShell title="Confirm it's really you." intro="We sent a six-digit code to your email address. Enter it below to activate your account. The code expires in 10 minutes." aside={null}>
      <OtpForm email={user.email} next={next} />
    </AuthShell>
  )
}

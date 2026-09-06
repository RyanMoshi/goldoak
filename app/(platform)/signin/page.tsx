import type { Metadata } from 'next'
import { AuthShell } from '@/components/platform/auth/AuthShell'
import { SignInForm } from '@/components/platform/auth/SignInForm'

export const metadata: Metadata = { title: 'Sign in' }

export default function SignInPage({ searchParams }: { searchParams: { as?: string; next?: string } }) {
  const role = searchParams.as === 'agency' ? 'agency' : 'client'
  const next = searchParams.next && searchParams.next.startsWith('/') ? searchParams.next : null
  return (
    <AuthShell
      title="Understand the risk first. The policy comes after."
      intro="Clients see exactly where their cover stands: the stage we are at, every policy, every quote, every claim. Agencies run the whole book from one workspace."
      aside={
        <ul className="space-y-2 text-[13.5px] text-white/80">
          <li>· Same-day acknowledgement, options within 5 working days</li>
          <li>· Claims registered within 24 hours, updated weekly</li>
          <li>· Ask on WhatsApp any time: status, policies, quotes, claims</li>
        </ul>
      }
    >
      <SignInForm initialRole={role} next={next} />
    </AuthShell>
  )
}

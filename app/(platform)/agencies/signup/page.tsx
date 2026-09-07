import type { Metadata } from 'next'
import { AgencySignUpForm } from '@/components/platform/auth/AgencySignUpForm'
import { AuthShell } from '@/components/platform/auth/AuthShell'

export const metadata: Metadata = { title: 'Register your agency' }
export const dynamic = 'force-dynamic'

export default function AgencySignUpPage() {
  return (
    <AuthShell
      title="Run your agency on Super Agent."
      intro="One workspace for clients, WhatsApp conversations, quotes, renewals, claims and documents. An AI assistant that signs clients up, reads their documents and hands the hard questions to your team."
      aside={
        <ol className="space-y-2 text-[13.5px] text-white/80">
          <li>1. Register your agency and choose a join code.</li>
          <li>2. GoldOak approves it, usually within a working day.</li>
          <li>3. Invite your team, share your WhatsApp link, start working the queue.</li>
        </ol>
      }
    >
      <AgencySignUpForm />
    </AuthShell>
  )
}

import type { Metadata } from 'next'
import { AuthShell } from '@/components/platform/auth/AuthShell'
import { SignUpForm } from '@/components/platform/auth/SignUpForm'

export const metadata: Metadata = { title: 'Create your account' }

export default function SignUpPage() {
  return (
    <AuthShell
      title="Your insurance, in one place."
      intro="Create a free account and follow your risk review from the first conversation to the policy, the renewal and the claim. No jargon, no chasing."
      aside={
        <ol className="space-y-2 text-[13.5px] text-white/80">
          <li>1. Tell us who you are and what you want to protect.</li>
          <li>2. Your adviser books a short risk conversation.</li>
          <li>3. Watch options arrive, compared on identical terms.</li>
          <li>4. Check anything from WhatsApp with one word.</li>
        </ol>
      }
    >
      <SignUpForm />
    </AuthShell>
  )
}

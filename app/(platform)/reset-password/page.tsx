import type { Metadata } from 'next'
import { AuthShell } from '@/components/platform/auth/AuthShell'
import { ResetPasswordForm } from '@/components/platform/auth/PasswordResetForms'

export const metadata: Metadata = { title: 'Reset password' }
export const dynamic = 'force-dynamic'

export default function ResetPasswordPage({ searchParams }: { searchParams: { token?: string } }) {
  return (
    <AuthShell title="Choose a new password." intro="Pick something you do not use anywhere else. After this you sign in as usual.">
      <ResetPasswordForm token={typeof searchParams.token === 'string' ? searchParams.token : ''} />
    </AuthShell>
  )
}

import type { Metadata } from 'next'
import { AuthShell } from '@/components/platform/auth/AuthShell'
import { ForgotPasswordForm } from '@/components/platform/auth/PasswordResetForms'

export const metadata: Metadata = { title: 'Forgot password' }

export default function ForgotPasswordPage() {
  return (
    <AuthShell title="Locked out? It happens." intro="Enter the email on your account and we will send a link that lets you choose a new password. The link works for one hour.">
      <ForgotPasswordForm />
    </AuthShell>
  )
}

import type { Metadata } from 'next'
import { AuthShell } from '@/components/platform/auth/AuthShell'
import { ChangePasswordForm } from '@/components/platform/auth/ChangePasswordForm'
import { requireAnySession } from '@/lib/auth/server'

export const metadata: Metadata = { title: 'Create a new password' }
export const dynamic = 'force-dynamic'

export default async function PasswordPage({ searchParams }: { searchParams: { first?: string } }) {
  const session = await requireAnySession()
  const first = searchParams.first === '1' || Boolean(session.mcp)
  return (
    <AuthShell
      title={first ? 'One more step: choose your own password.' : 'Change your password.'}
      intro={first ? 'You signed in with a temporary password. Pick one only you know; it replaces the temporary one straight away.' : 'Use at least 10 characters with a letter and a number. A short sentence works well.'}
      aside={
        <ul className="space-y-2 text-[13.5px] text-white/80">
          <li>· At least 10 characters, one letter and one number</li>
          <li>· Not one you use elsewhere</li>
          <li>· We email you whenever it changes</li>
        </ul>
      }
    >
      <ChangePasswordForm first={first} />
    </AuthShell>
  )
}

import type { Metadata } from 'next'
import { Dashboard } from '@/components/platform/dashboard/Dashboard'
import { OnboardingChecklist } from '@/components/platform/onboarding/OnboardingChecklist'
import { requireSession } from '@/lib/auth/server'
import { greetingFor } from '@/lib/format'
import { onboardingState } from '@/services/agency-onboarding'
import { getDashboardData } from '@/services/agency/dashboard'
import { getOrganization, getUser, placeholderOrganization } from '@/services/users'

export const metadata: Metadata = { title: 'Today' }

export default async function TodayPage() {
  const session = await requireSession('agency')
  const [data, agent, organization] = await Promise.all([getDashboardData(session.oid), getUser(session.uid), getOrganization(session.oid)])
  const org = organization ?? placeholderOrganization(session.oid)
  const setup = await onboardingState(org).catch(() => null)
  // The checklist leads until the essentials are done, then gets out of the way.
  const showSetup = setup && !setup.finished && !setup.dismissed

  return (
    <div className="space-y-6">
      {showSetup ? <OnboardingChecklist state={setup} compact /> : null}
      <Dashboard
        data={data}
        agent={agent ?? { id: session.uid, role: 'agency', organizationId: session.oid, name: session.name, email: '', phone: null, title: null, active: true, whatsappOptIn: true, mustChangePassword: false }}
        organization={org}
        greeting={greetingFor(new Date())}
      />
    </div>
  )
}

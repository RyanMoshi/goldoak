import type { Metadata } from 'next'
import { Dashboard } from '@/components/platform/dashboard/Dashboard'
import { requireSession } from '@/lib/auth/server'
import { greetingFor } from '@/lib/format'
import { getDashboardData } from '@/services/agency/dashboard'
import { getOrganization, getUser } from '@/services/users'

export const metadata: Metadata = { title: 'Today' }

export default async function TodayPage() {
  const session = await requireSession('agency')
  const [data, agent, organization] = await Promise.all([getDashboardData(session.oid), getUser(session.uid), getOrganization(session.oid)])
  return (
    <Dashboard
      data={data}
      agent={agent ?? { id: session.uid, role: 'agency', organizationId: session.oid, name: session.name, email: '', phone: null, title: null }}
      organization={organization ?? { id: session.oid, name: 'Agency', shortName: 'Agency', phone: '', email: '', whatsapp: '' }}
      greeting={greetingFor(new Date())}
    />
  )
}

import { AppShell } from '@/components/platform/shell/AppShell'
import { requireSession } from '@/lib/auth/server'
import { formatLongDate } from '@/lib/format'
import { getOrganization, getUser } from '@/services/users'

export const dynamic = 'force-dynamic'

/** Every agency route shares the workspace shell and requires an agency session. */
export default async function AgencyLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession('agency')
  const [agent, organization] = await Promise.all([getUser(session.uid), getOrganization(session.oid)])

  const safeAgent = agent ?? { id: session.uid, role: 'agency' as const, organizationId: session.oid, name: session.name, email: '', phone: null, title: null, active: true, whatsappOptIn: true }
  const safeOrg = organization ?? { id: session.oid, name: 'Agency', shortName: 'Agency', phone: '', email: '', whatsapp: '' }

  return (
    <AppShell organization={safeOrg} agent={safeAgent} dateLabel={formatLongDate(new Date())}>
      {children}
    </AppShell>
  )
}

import { AppShell } from '@/components/platform/shell/AppShell'
import { requireSession } from '@/lib/auth/server'
import { formatLongDate } from '@/lib/format'
import { countWaitingForHuman } from '@/services/conversations'
import { getOrganization, getUser, placeholderOrganization } from '@/services/users'

export const dynamic = 'force-dynamic'

/** Every agency route shares the workspace shell and requires an agency session. */
export default async function AgencyLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession('agency')
  const [agent, organization, waiting] = await Promise.all([getUser(session.uid), getOrganization(session.oid), countWaitingForHuman(session.oid).catch(() => 0)])

  const safeAgent = agent ?? { id: session.uid, role: 'agency' as const, organizationId: session.oid, name: session.name, email: '', phone: null, title: null, active: true, whatsappOptIn: true }
  const safeOrg = organization ?? placeholderOrganization(session.oid)

  return (
    <AppShell organization={safeOrg} agent={safeAgent} dateLabel={formatLongDate(new Date())} waiting={waiting}>
      {children}
    </AppShell>
  )
}

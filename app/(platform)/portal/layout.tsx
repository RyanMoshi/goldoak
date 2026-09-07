import { PortalShell } from '@/components/platform/portal/PortalShell'
import { requireSession } from '@/lib/auth/server'
import { getOrganization, getUser, placeholderOrganization, DEFAULT_ORGANIZATION_ID } from '@/services/users'

export const dynamic = 'force-dynamic'

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession('client')
  const [user, organization] = await Promise.all([getUser(session.uid), getOrganization(session.oid || DEFAULT_ORGANIZATION_ID)])
  const safeUser = user ?? { id: session.uid, role: 'client' as const, organizationId: session.oid, name: session.name, email: '', phone: null, title: null, active: true, whatsappOptIn: true }
  const safeOrg = organization ?? placeholderOrganization(DEFAULT_ORGANIZATION_ID, 'GoldOak')
  return (
    <PortalShell user={safeUser} organization={safeOrg}>
      {children}
    </PortalShell>
  )
}

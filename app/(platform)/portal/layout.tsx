import { PortalShell } from '@/components/platform/portal/PortalShell'
import { requireSession } from '@/lib/auth/server'
import { getOrganization, getUser, DEFAULT_ORGANIZATION_ID } from '@/services/users'

export const dynamic = 'force-dynamic'

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession('client')
  const [user, organization] = await Promise.all([getUser(session.uid), getOrganization(session.oid || DEFAULT_ORGANIZATION_ID)])
  const safeUser = user ?? { id: session.uid, role: 'client' as const, organizationId: session.oid, name: session.name, email: '', phone: null, title: null }
  const safeOrg = organization ?? { id: DEFAULT_ORGANIZATION_ID, name: 'GoldOak Insurance Agency', shortName: 'GoldOak', phone: '+254 729 911 311', email: 'info@goldoak.co.ke', whatsapp: '254729911311' }
  return (
    <PortalShell user={safeUser} organization={safeOrg}>
      {children}
    </PortalShell>
  )
}

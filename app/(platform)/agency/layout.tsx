import { AppShell } from '@/components/platform/shell/AppShell'
import { requireSession } from '@/lib/auth/server'
import { formatLongDate } from '@/lib/format'
import { countWaitingForHuman } from '@/services/conversations'
import { listMemberships } from '@/services/memberships'
import { getOrganization, getUser, placeholderOrganization } from '@/services/users'

export const dynamic = 'force-dynamic'

/** Every agency route shares the workspace shell and requires an agency session. */
export default async function AgencyLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession('agency')
  const [agent, organization, waiting, memberships, impersonator] = await Promise.all([getUser(session.uid), getOrganization(session.oid), countWaitingForHuman(session.oid).catch(() => 0), listMemberships(session.uid).catch(() => []), session.imp ? getUser(session.imp) : Promise.resolve(null)])

  const safeAgent = agent ?? { id: session.uid, role: 'agency' as const, organizationId: session.oid, name: session.name, email: '', phone: null, title: null, active: true, whatsappOptIn: true, mustChangePassword: false }
  const safeOrg = organization ?? placeholderOrganization(session.oid)

  return (
    <AppShell organization={safeOrg} agent={safeAgent} dateLabel={formatLongDate(new Date())} waiting={waiting} memberships={memberships.length} impersonatedBy={impersonator?.name ?? null}>
      {safeOrg.status === 'pending' ? (
        <div role="status" className="mb-5 rounded-card border border-warning/30 bg-warning/10 px-4 py-3 text-[13.5px] text-ink">
          <span className="font-semibold">Your agency is awaiting approval.</span> You can set up your profile, join code and team now. Clients can reach you on the shared WhatsApp number as soon as GoldOak approves the agency, usually within one working day.
        </div>
      ) : null}
      {children}
    </AppShell>
  )
}

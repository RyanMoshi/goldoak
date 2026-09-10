import type { Metadata } from 'next'
import { UserDirectory } from '@/components/platform/admin/UserDirectory'
import { Card } from '@/components/platform/ui/Card'
import { PageHeader } from '@/components/platform/ui/PageHeader'
import { requireSession } from '@/lib/auth/server'
import { listDirectory, platformCounts, type DirectoryRole } from '@/services/directory'
import { listOrganizationSummaries } from '@/services/users'

export const metadata: Metadata = { title: 'Everyone on the platform' }
export const dynamic = 'force-dynamic'

const ROLES = new Set(['admin', 'agency_admin', 'agency', 'client', 'staff'])
const SORTS = new Set(['newest', 'oldest', 'name', 'seen'])

/**
 * One directory for every account, whatever it is. Customers, agents, agency
 * administrators and operators are all people on this platform, and Super
 * Admin should not have to guess which tenant to look inside to find one.
 */
export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { q?: string; role?: string; org?: string; status?: string; sort?: string; page?: string }
}) {
  await requireSession('admin')

  const page = Number(searchParams.page ?? 1)
  const [directory, counts, agencies] = await Promise.all([
    listDirectory({
      search: searchParams.q,
      role: ROLES.has(searchParams.role ?? '') ? (searchParams.role as DirectoryRole) : 'all',
      organizationId: searchParams.org,
      status: searchParams.status === 'active' ? 'active' : searchParams.status === 'inactive' ? 'inactive' : 'all',
      sort: SORTS.has(searchParams.sort ?? '') ? (searchParams.sort as 'newest') : 'newest',
      page: Number.isFinite(page) ? page : 1,
    }),
    platformCounts(),
    listOrganizationSummaries(),
  ])

  const tiles = [
    { label: 'Accounts', value: counts.users },
    { label: 'Customers', value: counts.customers },
    { label: 'Agency staff', value: counts.staff },
    { label: 'Agencies', value: counts.agencies },
    { label: 'Deactivated', value: counts.inactive },
    { label: 'New this week', value: counts.newThisWeek },
  ]

  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader
        eyebrow="Platform"
        title="Everyone"
        description="Every account on GoldOak, whatever it is: customers, agents, agency administrators and operators. Search, filter, and act."
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {tiles.map((t) => (
          <Card key={t.label} className="p-4">
            <p className="label-caps text-ink-muted">{t.label}</p>
            <p className="mt-1 font-serif text-[26px] leading-none text-forest tabular">{t.value.toLocaleString('en-KE')}</p>
          </Card>
        ))}
      </div>

      <UserDirectory page={directory} agencies={agencies.map((a) => ({ id: a.id, name: a.name }))} />
    </div>
  )
}

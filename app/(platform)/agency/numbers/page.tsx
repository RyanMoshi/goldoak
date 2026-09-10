import type { Metadata } from 'next'
import { ImportNumbers } from '@/components/platform/numbers/ImportNumbers'
import { NumberBook } from '@/components/platform/numbers/NumberBook'
import { Card } from '@/components/platform/ui/Card'
import { PageHeader } from '@/components/platform/ui/PageHeader'
import { requireSession } from '@/lib/auth/server'
import { isAgencyAdmin } from '@/lib/auth/session'
import { callingCodes, defaultCountry } from '@/lib/phone'
import { listNames, listNumbers, numberStats, type NumberStatus } from '@/services/numbers'
import { listStaffMemberships } from '@/services/memberships'
import { getOrganization } from '@/services/users'

export const metadata: Metadata = { title: 'Phone numbers' }
export const dynamic = 'force-dynamic'

const SORTS = new Set(['newest', 'oldest', 'name', 'phone', 'activity'])
const STATUSES = new Set(['active', 'unsubscribed', 'invalid', 'bounced'])

/**
 * The agency's number book: everyone it can message, whether or not they have
 * become a client. Filters live in the URL so a view can be shared, and every
 * query is answered a page at a time.
 */
export default async function NumbersPage({
  searchParams,
}: {
  searchParams: { q?: string; list?: string; status?: string; sort?: string; page?: string }
}) {
  const session = await requireSession('agency')
  const canEdit = isAgencyAdmin(session.role)

  const page = Number(searchParams.page ?? 1)
  const [book, lists, stats, org, team] = await Promise.all([
    listNumbers(session.oid, {
      search: searchParams.q,
      list: searchParams.list,
      status: STATUSES.has(searchParams.status ?? '') ? (searchParams.status as NumberStatus) : 'all',
      sort: SORTS.has(searchParams.sort ?? '') ? (searchParams.sort as 'newest') : 'newest',
      page: Number.isFinite(page) ? page : 1,
    }),
    listNames(session.oid),
    numberStats(session.oid),
    getOrganization(session.oid),
    listStaffMemberships(session.oid).catch(() => []),
  ])

  const countries = callingCodes().map((c) => ({ code: c.country, label: `${c.country} +${c.code}` }))
  const tiles = [
    { label: 'Numbers', value: stats.total.toLocaleString('en-KE') },
    { label: 'Reachable', value: stats.active.toLocaleString('en-KE') },
    { label: 'Opted out', value: stats.optedOut.toLocaleString('en-KE') },
    { label: 'Lists', value: stats.lists.toLocaleString('en-KE') },
  ]

  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader
        eyebrow="Campaigns"
        title="Phone numbers"
        description="Everyone this agency can message. Numbers live here whether or not the person has become a client, and a campaign can be sent to any list."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map((t) => (
          <Card key={t.label} className="p-4">
            <p className="label-caps text-ink-muted">{t.label}</p>
            <p className="mt-1 font-serif text-[26px] leading-none text-forest tabular">{t.value}</p>
          </Card>
        ))}
      </div>

      {canEdit ? (
        <ImportNumbers
          countries={countries}
          defaultCountry={org?.country ?? defaultCountry()}
          lists={lists.map((l) => l.name)}
        />
      ) : null}

      <NumberBook
        page={book}
        lists={lists}
        owners={team.map((m) => ({ id: m.userId, name: m.userId }))}
        canEdit={canEdit}
      />
    </div>
  )
}

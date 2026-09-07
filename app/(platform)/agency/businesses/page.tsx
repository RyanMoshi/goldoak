import type { Metadata } from 'next'
import { PageHeader } from '@/components/platform/ui/PageHeader'
import { Businesses } from '@/components/platform/workspace/Businesses'
import { requireSession } from '@/lib/auth/server'
import { listBusinessClaims, listBusinesses } from '@/services/businesses'

export const metadata: Metadata = { title: 'Businesses' }
export const dynamic = 'force-dynamic'

export default async function BusinessesPage() {
  const session = await requireSession('agency')
  const [businesses, claims] = await Promise.all([listBusinesses(session.oid), listBusinessClaims(session.oid)])
  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader eyebrow="Clients" title="Businesses" description="The businesses you serve and the people asking to be linked to them." />
      <Businesses businesses={businesses} claims={claims} />
    </div>
  )
}

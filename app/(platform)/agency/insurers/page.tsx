import type { Metadata } from 'next'
import { InsurersTable } from '@/components/platform/workspace/InsurersTable'
import { PageHeader } from '@/components/platform/ui/PageHeader'
import { requireSession } from '@/lib/auth/server'
import { listInsurers } from '@/services/agency/workspace'

export const metadata: Metadata = { title: 'Insurers' }
export const dynamic = 'force-dynamic'

export default async function InsurersPage() {
  const session = await requireSession('agency')
  const data = await listInsurers(session.oid)
  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader eyebrow="Panel" title="Insurers" description="Your panel as your own placements record it: premium, response record and claims conduct." />
      <InsurersTable rows={data} />
    </div>
  )
}

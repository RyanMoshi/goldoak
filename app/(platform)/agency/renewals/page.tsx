import type { Metadata } from 'next'
import { RenewalsTable } from '@/components/platform/workspace/RenewalsTable'
import { PageHeader } from '@/components/platform/ui/PageHeader'
import { requireSession } from '@/lib/auth/server'
import { listRenewals } from '@/services/agency/workspace'

export const metadata: Metadata = { title: 'Renewals' }
export const dynamic = 'force-dynamic'

export default async function RenewalsPage() {
  const session = await requireSession('agency')
  const data = await listRenewals(session.oid)
  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader eyebrow="Retention" title="Renewals" description="Policies expiring in the next 90 days and anything that lapsed in the last 30. Client reminders go out automatically at 30, 14, 7 and 1 days; the review task opens at 45." />
      <RenewalsTable rows={data} />
    </div>
  )
}

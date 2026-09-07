import type { Metadata } from 'next'
import { Reports } from '@/components/platform/workspace/Reports'
import { PageHeader } from '@/components/platform/ui/PageHeader'
import { requireSession } from '@/lib/auth/server'
import { getReport } from '@/services/agency/workspace'

export const metadata: Metadata = { title: 'Reports' }
export const dynamic = 'force-dynamic'

export default async function ReportsPage() {
  const session = await requireSession('agency')
  const data = await getReport(session.oid)
  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader eyebrow="Analytics" title="Reports" description="Premium, clients, conversion, renewals, claims and WhatsApp, from your live records." />
      <Reports data={data} downloadHref="/api/documents/agency-report" />
    </div>
  )
}

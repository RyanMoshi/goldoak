import type { Metadata } from 'next'
import { ClaimsTable } from '@/components/platform/workspace/ClaimsTable'
import { PageHeader } from '@/components/platform/ui/PageHeader'
import { requireSession } from '@/lib/auth/server'
import { listClaims } from '@/services/agency/workspace'

export const metadata: Metadata = { title: 'Claims' }
export const dynamic = 'force-dynamic'

export default async function ClaimsPage() {
  const session = await requireSession('agency')
  const data = await listClaims(session.oid)
  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader eyebrow="Support" title="Claims" description="Open claims first, ordered by the next client update due. Register within 24 hours, update weekly." />
      <ClaimsTable rows={data} />
    </div>
  )
}

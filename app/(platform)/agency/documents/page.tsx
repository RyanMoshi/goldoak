import type { Metadata } from 'next'
import { PageHeader } from '@/components/platform/ui/PageHeader'
import { Documents } from '@/components/platform/workspace/Documents'
import { requireSession } from '@/lib/auth/server'
import { listUploads } from '@/services/uploads'

export const metadata: Metadata = { title: 'Documents' }
export const dynamic = 'force-dynamic'

export default async function DocumentsPage() {
  const session = await requireSession('agency')
  const uploads = await listUploads(session.oid)
  const waiting = uploads.filter((u) => !u.reviewedAt).length
  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader eyebrow="Received" title="Documents" description={waiting ? `${waiting} not yet reviewed. Open one to see what the assistant read and whether the client confirmed it.` : 'Everything clients sent on WhatsApp or uploaded in their portal, with what the assistant read.'} />
      <Documents uploads={uploads} />
    </div>
  )
}

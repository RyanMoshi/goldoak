import type { Metadata } from 'next'
import { PageHeader } from '@/components/platform/ui/PageHeader'
import { Enquiries } from '@/components/platform/workspace/Enquiries'
import { requireSession } from '@/lib/auth/server'
import { listEnquiries } from '@/services/enquiries'

export const metadata: Metadata = { title: 'Enquiries' }
export const dynamic = 'force-dynamic'

export default async function EnquiriesPage() {
  const session = await requireSession('agency')
  const enquiries = await listEnquiries(session.oid)
  const open = enquiries.filter((e) => e.status === 'open').length
  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader eyebrow="Requests" title="Enquiries" description={open ? `${open} waiting for a reply. Answers reach the person on WhatsApp and in their portal.` : 'Every enquiry with its reference and answer.'} />
      <Enquiries enquiries={enquiries} />
    </div>
  )
}

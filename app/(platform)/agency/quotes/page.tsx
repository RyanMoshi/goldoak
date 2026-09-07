import type { Metadata } from 'next'
import { QuotesTable } from '@/components/platform/workspace/QuotesTable'
import { PageHeader } from '@/components/platform/ui/PageHeader'
import { requireSession } from '@/lib/auth/server'
import { listQuotes } from '@/services/agency/workspace'

export const metadata: Metadata = { title: 'Quotes' }
export const dynamic = 'force-dynamic'

export default async function QuotesPage() {
  const session = await requireSession('agency')
  const data = await listQuotes(session.oid)
  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader eyebrow="Placement" title="Quotes" description="Every quote request and where each insurer stands. Open a client to update stages and capture insurer replies." />
      <QuotesTable rows={data} />
    </div>
  )
}

import type { Metadata } from 'next'
import { PipelineBoard } from '@/components/platform/workspace/PipelineBoard'
import { PageHeader } from '@/components/platform/ui/PageHeader'
import { requireSession } from '@/lib/auth/server'
import { getPipeline } from '@/services/agency/workspace'

export const metadata: Metadata = { title: 'Pipeline' }
export const dynamic = 'force-dynamic'

export default async function PipelinePage() {
  const session = await requireSession('agency')
  const data = await getPipeline(session.oid)
  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader eyebrow="Opportunities" title="Pipeline" description="Every client by journey stage, left to right. Open a card to move it." />
      <PipelineBoard columns={data} />
    </div>
  )
}

import type { Metadata } from 'next'
import { AiSettingsForm } from '@/components/platform/settings/AiSettingsForm'
import { PageHeader } from '@/components/platform/ui/PageHeader'
import { requireSession } from '@/lib/auth/server'
import { isAgencyAdmin } from '@/lib/auth/session'
import { assistantLabel } from '@/services/consult'
import { getOrganization, placeholderOrganization } from '@/services/users'

export const metadata: Metadata = { title: 'Assistant' }
export const dynamic = 'force-dynamic'

export default async function AiPage() {
  const session = await requireSession('agency')
  const org = (await getOrganization(session.oid)) ?? placeholderOrganization(session.oid)
  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader eyebrow="Super Agent" title="Assistant" description="Teach the assistant your products, answers and rules. It speaks as your agency on WhatsApp and in the client portal." />
      <AiSettingsForm settings={org.aiSettings} agencyName={org.shortName} canEdit={isAgencyAdmin(session.role)} modelLabel={assistantLabel()} />
    </div>
  )
}

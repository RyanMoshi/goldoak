import type { Metadata } from 'next'
import { TemplateEditor } from '@/components/platform/emails/TemplateEditor'
import { PageHeader } from '@/components/platform/ui/PageHeader'
import { requireAgencyAdmin } from '@/lib/auth/server'
import { listTemplateOverrides } from '@/services/emails'

export const metadata: Metadata = { title: 'Email templates' }
export const dynamic = 'force-dynamic'

export default async function AgencyTemplatesPage() {
  const session = await requireAgencyAdmin()
  const templates = await listTemplateOverrides(session.oid)
  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader eyebrow="Communications" title="Email templates" description="Put your own words on the emails your clients receive. Codes, links and security wording stay fixed." />
      <TemplateEditor templates={templates} scope="agency" />
    </div>
  )
}

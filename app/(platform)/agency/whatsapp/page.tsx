import type { Metadata } from 'next'
import { WhatsAppChannel } from '@/components/platform/settings/WhatsAppChannel'
import { PageHeader } from '@/components/platform/ui/PageHeader'
import { requireSession } from '@/lib/auth/server'
import { isAgencyAdmin } from '@/lib/auth/session'
import { botNumber } from '@/lib/whatsapp/provider'
import { getOrganization } from '@/services/users'

export const metadata: Metadata = { title: 'WhatsApp' }
export const dynamic = 'force-dynamic'

export default async function WhatsAppPage() {
  const session = await requireSession('agency')
  const org = await getOrganization(session.oid)
  const shared = botNumber()
  const joinLink = shared && org?.code ? `https://wa.me/${shared}?text=${encodeURIComponent(`JOIN ${org.code}`)}` : null
  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader eyebrow="Channels" title="WhatsApp" description="Your own number for your clients. The assistant, your team and every reminder use it." />
      <WhatsAppChannel canEdit={isAgencyAdmin(session.role)} sharedJoinLink={joinLink} />
    </div>
  )
}

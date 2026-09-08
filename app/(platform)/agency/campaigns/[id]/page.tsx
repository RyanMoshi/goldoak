import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { CampaignDetail } from '@/components/platform/campaigns/CampaignDetail'
import { requireAgencyAdmin } from '@/lib/auth/server'
import { getCampaign, listRecipients, resolveAudience } from '@/services/campaigns'

export const metadata: Metadata = { title: 'Campaign' }
export const dynamic = 'force-dynamic'

export default async function CampaignPage({ params, searchParams }: { params: { id: string }; searchParams: { created?: string } }) {
  const session = await requireAgencyAdmin()
  const campaign = await getCampaign(session.oid, params.id)
  if (!campaign) notFound()
  const [recipients, members] = await Promise.all([campaign.totalRecipients ? listRecipients(session.oid, campaign.id) : Promise.resolve([]), resolveAudience(session.oid, campaign.audience)])
  const reachable = members.filter((m) => (campaign.channel === 'whatsapp' ? m.phone : campaign.channel === 'both' ? m.email || m.phone : m.email))

  return (
    <div className="animate-fade-up space-y-6">
      <Link href="/agency/campaigns" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-muted hover:text-ink focus-ring">
        <ArrowLeft className="size-4" aria-hidden="true" /> Campaigns
      </Link>
      {searchParams.created ? (
        <p role="status" className="rounded-control border border-success/25 bg-success/10 px-3.5 py-2.5 text-[13.5px] text-ink">
          Saved. Check the audience below, then send when you are ready.
        </p>
      ) : null}
      <CampaignDetail campaign={campaign} recipients={recipients} audienceSize={reachable.length} />
    </div>
  )
}

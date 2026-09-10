import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { CampaignComposer } from '@/components/platform/campaigns/CampaignComposer'
import { listNames } from '@/services/numbers'
import { callingCodes, defaultCountry } from '@/lib/phone'
import { getOrganization } from '@/services/users'
import { PageHeader } from '@/components/platform/ui/PageHeader'
import { requireAgencyAdmin } from '@/lib/auth/server'
import { getCampaign } from '@/services/campaigns'

export const metadata: Metadata = { title: 'Edit campaign' }
export const dynamic = 'force-dynamic'

export default async function EditCampaignPage({ params }: { params: { id: string } }) {
  const session = await requireAgencyAdmin()
  const numberLists = await listNames(session.oid)
  const org = await getOrganization(session.oid)
  const countries = callingCodes().map((c) => ({ code: c.country, label: `${c.country} +${c.code}` }))
  const campaign = await getCampaign(session.oid, params.id)
  if (!campaign) notFound()
  if (campaign.status !== 'draft' && campaign.status !== 'scheduled') {
    return (
      <div className="animate-fade-up space-y-4">
        <Link href={`/agency/campaigns/${campaign.id}`} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-muted hover:text-ink focus-ring">
          <ArrowLeft className="size-4" aria-hidden="true" /> {campaign.name}
        </Link>
        <p className="rounded-control border border-line bg-surface px-4 py-3 text-[14px] text-ink">This campaign has already started, so it can no longer be edited. Duplicate it as a new campaign instead.</p>
      </div>
    )
  }

  return (
    <div className="animate-fade-up space-y-6">
      <Link href={`/agency/campaigns/${campaign.id}`} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-muted hover:text-ink focus-ring">
        <ArrowLeft className="size-4" aria-hidden="true" /> {campaign.name}
      </Link>
      <PageHeader eyebrow="Communications" title="Edit campaign" description="Changes apply the next time it is launched." />
      <CampaignComposer campaign={campaign} numberLists={numberLists} countries={countries} defaultCountry={org?.country ?? defaultCountry()} />
    </div>
  )
}

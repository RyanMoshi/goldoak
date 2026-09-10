import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { CampaignComposer } from '@/components/platform/campaigns/CampaignComposer'
import { PageHeader } from '@/components/platform/ui/PageHeader'
import { requireAgencyAdmin } from '@/lib/auth/server'
import { listNames } from '@/services/numbers'
import { callingCodes, defaultCountry } from '@/lib/phone'
import { getOrganization } from '@/services/users'

export const metadata: Metadata = { title: 'New campaign' }
export const dynamic = 'force-dynamic'

export default async function NewCampaignPage() {
  const session = await requireAgencyAdmin()
  const numberLists = await listNames(session.oid)
  const org = await getOrganization(session.oid)
  const countries = callingCodes().map((c) => ({ code: c.country, label: `${c.country} +${c.code}` }))
  return (
    <div className="animate-fade-up space-y-6">
      <Link href="/agency/campaigns" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-muted hover:text-ink focus-ring">
        <ArrowLeft className="size-4" aria-hidden="true" /> Campaigns
      </Link>
      <PageHeader eyebrow="Communications" title="New campaign" description="Nothing is sent until you review the audience and launch it on the next screen." />
      <CampaignComposer numberLists={numberLists} countries={countries} defaultCountry={org?.country ?? defaultCountry()} />
    </div>
  )
}

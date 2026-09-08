import type { Metadata } from 'next'
import Link from 'next/link'
import { OnboardingChecklist } from '@/components/platform/onboarding/OnboardingChecklist'
import { Card, CardHeader } from '@/components/platform/ui/Card'
import { PageHeader } from '@/components/platform/ui/PageHeader'
import { requireSession } from '@/lib/auth/server'
import { onboardingState } from '@/services/agency-onboarding'
import { getOrganization, placeholderOrganization } from '@/services/users'

export const metadata: Metadata = { title: 'Set up your agency' }
export const dynamic = 'force-dynamic'

export default async function OnboardingPage() {
  const session = await requireSession('agency')
  const org = (await getOrganization(session.oid)) ?? placeholderOrganization(session.oid)
  const state = await onboardingState(org)

  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader eyebrow={org.name} title="Set up your agency" description="Work through these once and the rest of the platform behaves the way you would expect it to." />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <OnboardingChecklist state={state} />
        </div>
        <div className="space-y-6 lg:col-span-4">
          <Card as="section">
            <CardHeader title="What happens after setup" />
            <ul className="mt-4 space-y-3 text-[13.5px] leading-6 text-ink-muted">
              <li>
                <span className="font-semibold text-ink">Clients reach you on WhatsApp.</span> The assistant answers in your name, using your products, and hands over to a person when it should.
              </li>
              <li>
                <span className="font-semibold text-ink">Renewals chase themselves.</span> Reminders go out on your schedule by email, WhatsApp and in the portal.
              </li>
              <li>
                <span className="font-semibold text-ink">Quotes and invoices look like yours.</span> Branded PDFs, sent by email or a share link.
              </li>
              <li>
                <span className="font-semibold text-ink">Nothing leaves your agency.</span> Other agencies on the platform cannot see your clients, conversations or documents.
              </li>
            </ul>
          </Card>
          <Card as="section">
            <CardHeader title="Need a hand?" description="Your platform administrator can help with anything here." />
            <Link href="/agency/settings" className="mt-4 inline-flex h-10 items-center rounded-control border border-line bg-surface px-3.5 text-[13.5px] font-semibold text-ink hover:border-ink-muted focus-ring">
              Open agency settings
            </Link>
          </Card>
        </div>
      </div>
    </div>
  )
}

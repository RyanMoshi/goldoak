import type { Metadata } from 'next'
import Link from 'next/link'
import { BrandingForm } from '@/components/platform/settings/BrandingForm'
import { OnboardingChecklist } from '@/components/platform/onboarding/OnboardingChecklist'
import { onboardingState } from '@/services/agency-onboarding'
import { OrganizationSettings } from '@/components/platform/settings/OrganizationSettings'
import { brandingFor } from '@/lib/email/branding'
import { PageHeader } from '@/components/platform/ui/PageHeader'
import { requireSession } from '@/lib/auth/server'
import { isAgencyAdmin } from '@/lib/auth/session'
import { botNumber } from '@/lib/whatsapp/provider'
import { getOrganization, placeholderOrganization } from '@/services/users'

export const metadata: Metadata = { title: 'Settings' }
export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const session = await requireSession('agency')
  const organization = (await getOrganization(session.oid)) ?? placeholderOrganization(session.oid)
  const number = botNumber() ?? organization.whatsapp ?? null
  const setup = await onboardingState(organization)
  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader eyebrow="Agency" title="Settings" description="Your agency profile, the WhatsApp join code your clients use, and the greeting the assistant sends." />
      {setup.finished ? null : <OnboardingChecklist state={setup} />}
      <OrganizationSettings organization={organization} botNumber={number || null} canEdit={isAgencyAdmin(session.role)} siteUrl={process.env.NEXT_PUBLIC_SITE_URL ?? 'https://goldoak.vercel.app'} />
      <BrandingForm branding={organization.branding} reminderDays={organization.reminderDays} canEdit={isAgencyAdmin(session.role)} defaults={{ primary: brandingFor(organization).primary, accent: brandingFor(organization).accent }} />
      <p className="text-[13px] text-ink-muted">
        Setup checklist: <Link href="/agency/onboarding" className="font-semibold text-forest underline focus-ring">open the full guide</Link> ({setup.completed} of {setup.total} done).
      </p>
    </div>
  )
}

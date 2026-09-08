import type { Metadata } from 'next'
import { BrandingForm } from '@/components/platform/settings/BrandingForm'
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
  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader eyebrow="Agency" title="Settings" description="Your agency profile, the WhatsApp join code your clients use, and the greeting the assistant sends." />
      <OrganizationSettings organization={organization} botNumber={number || null} canEdit={isAgencyAdmin(session.role)} siteUrl={process.env.NEXT_PUBLIC_SITE_URL ?? 'https://goldoak.vercel.app'} />
      <BrandingForm branding={organization.branding} reminderDays={organization.reminderDays} canEdit={isAgencyAdmin(session.role)} defaults={{ primary: brandingFor(organization).primary, accent: brandingFor(organization).accent }} />
    </div>
  )
}

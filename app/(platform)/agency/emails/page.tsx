import type { Metadata } from 'next'
import Link from 'next/link'
import { EmailActivity } from '@/components/platform/emails/EmailActivity'
import { SendTestEmail } from '@/components/platform/emails/SendTestEmail'
import { PageHeader } from '@/components/platform/ui/PageHeader'
import { requireAgencyAdmin } from '@/lib/auth/server'
import { emailStats, listEmailLog } from '@/services/emails'

export const metadata: Metadata = { title: 'Emails' }
export const dynamic = 'force-dynamic'

export default async function AgencyEmailsPage() {
  const session = await requireAgencyAdmin()
  const [rows, stats] = await Promise.all([listEmailLog(session.oid), emailStats(session.oid)])
  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader
        eyebrow="Communications"
        title="Emails"
        description="Every email sent to your clients and team, with delivery status. Failed emails retry automatically."
        aside={
          <Link href="/agency/templates" className="inline-flex h-10 items-center rounded-control border border-line bg-surface px-4 text-[13.5px] font-semibold text-ink hover:border-ink-muted focus-ring">
            Template wording
          </Link>
        }
      />
      <SendTestEmail scope="agency" />
      <EmailActivity rows={rows} stats={stats} showOrganization={false} />
    </div>
  )
}

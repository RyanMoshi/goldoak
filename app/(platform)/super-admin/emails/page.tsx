import type { Metadata } from 'next'
import { EmailActivity } from '@/components/platform/emails/EmailActivity'
import { SendTestEmail } from '@/components/platform/emails/SendTestEmail'
import { requireSession } from '@/lib/auth/server'
import { emailStats, listEmailLog } from '@/services/emails'

export const metadata: Metadata = { title: 'Email activity' }
export const dynamic = 'force-dynamic'

export default async function AdminEmailsPage() {
  await requireSession('admin')
  const [rows, stats] = await Promise.all([listEmailLog(null, 200), emailStats(null)])
  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <p className="label-caps flex items-center gap-2 text-gold-700">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-gold" />
          Platform
        </p>
        <h1 className="mt-2 font-serif text-[26px] font-medium leading-8 text-forest sm:text-[34px] sm:leading-[2.75rem]">Email activity across every agency</h1>
        <p className="mt-1 text-[14.5px] text-ink-muted">Delivery status, failures and retries. Agencies see only their own.</p>
      </div>
      <SendTestEmail scope="global" />
      <EmailActivity rows={rows} stats={stats} showOrganization />
    </div>
  )
}

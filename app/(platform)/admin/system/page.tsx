import type { Metadata } from 'next'
import Link from 'next/link'
import { SystemPanel } from '@/components/platform/admin/SystemPanel'
import { requireSession } from '@/lib/auth/server'
import { listAudit } from '@/services/audit'
import { jobStats, listJobs } from '@/services/jobs'

export const metadata: Metadata = { title: 'System' }
export const dynamic = 'force-dynamic'

export default async function SystemPage() {
  await requireSession('admin')
  const [stats, jobs, audit] = await Promise.all([jobStats(), listJobs('all', 60), listAudit(null, 80)])
  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <p className="label-caps flex items-center gap-2 text-gold-700">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-gold" />
          <Link href="/admin" className="hover:underline">
            Platform
          </Link>
          <span aria-hidden="true">/</span>
          System
        </p>
        <h1 className="mt-2 font-serif text-[28px] font-medium leading-9 text-forest sm:text-[34px] sm:leading-[2.75rem]">Jobs, failures and the audit trail</h1>
        <p className="mt-1 text-[15px] text-ink-muted">Everything that runs in the background, and everything sensitive anyone did.</p>
      </div>
      <SystemPanel stats={stats} jobs={jobs} audit={audit} />
    </div>
  )
}

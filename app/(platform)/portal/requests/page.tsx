import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { RequestForms } from '@/components/platform/portal/RequestForms'
import { requireSession } from '@/lib/auth/server'
import { clientForUser } from '@/services/journey'
import { listRequests } from '@/services/requests'
import { getUser } from '@/services/users'

export const metadata: Metadata = { title: 'My requests' }
export const dynamic = 'force-dynamic'

export default async function PortalRequestsPage() {
  const session = await requireSession('client')
  const [client, user] = await Promise.all([clientForUser(session.uid), getUser(session.uid)])
  const requests = await listRequests(session.oid, user?.phone ?? null, client?.id ?? null)
  return (
    <div className="animate-fade-up space-y-5">
      <div>
        <Link href="/portal" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-muted hover:text-ink focus-ring rounded-control">
          <ArrowLeft className="size-4" aria-hidden="true" /> My insurance
        </Link>
        <h1 className="mt-3 font-serif text-[28px] font-medium leading-9 text-forest sm:text-[34px] sm:leading-[2.75rem]">Requests</h1>
        <p className="mt-1 text-[15px] text-ink-muted">Claim a business, send an enquiry, and check where every request stands. The same things work on WhatsApp with replies 2, 4 and 6.</p>
      </div>
      <RequestForms requests={requests} />
    </div>
  )
}

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ClientBilling } from '@/components/platform/billing/ClientBilling'
import { ClientDetail } from '@/components/platform/clients/ClientDetail'
import { requireSession } from '@/lib/auth/server'
import { getClientDetail } from '@/services/agency/clients'
import { listForClient } from '@/services/billing'

export const metadata: Metadata = { title: 'Client' }
export const dynamic = 'force-dynamic'

export default async function ClientPage({ params }: { params: { id: string } }) {
  const session = await requireSession('agency')
  const [detail, billing] = await Promise.all([getClientDetail(session.oid, params.id), listForClient(session.oid, params.id).catch(() => [])])
  if (!detail) notFound()
  return (
    <div className="space-y-6">
      <ClientDetail detail={detail} />
      <ClientBilling rows={billing} />
    </div>
  )
}

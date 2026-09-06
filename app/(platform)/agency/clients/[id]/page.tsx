import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ClientDetail } from '@/components/platform/clients/ClientDetail'
import { requireSession } from '@/lib/auth/server'
import { getClientDetail } from '@/services/agency/clients'

export const metadata: Metadata = { title: 'Client' }

export default async function ClientPage({ params }: { params: { id: string } }) {
  const session = await requireSession('agency')
  const detail = await getClientDetail(session.oid, params.id)
  if (!detail) notFound()
  return <ClientDetail detail={detail} />
}

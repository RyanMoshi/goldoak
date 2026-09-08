import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { BillingForm } from '@/components/platform/billing/BillingForm'
import { PageHeader } from '@/components/platform/ui/PageHeader'
import { requireSession } from '@/lib/auth/server'
import { defaultsFor, getDocument } from '@/services/billing'
import { listClients } from '@/services/agency/clients'
import { getOrganization } from '@/services/users'

export const metadata: Metadata = { title: 'Edit document' }
export const dynamic = 'force-dynamic'

const KINDS: Record<string, 'quote' | 'invoice'> = { quotes: 'quote', invoices: 'invoice' }

export default async function EditBillingPage({ params }: { params: { kind: string; id: string } }) {
  const kind = KINDS[params.kind]
  if (!kind) notFound()
  const session = await requireSession('agency')
  const [doc, org, clients] = await Promise.all([getDocument(session.oid, params.id), getOrganization(session.oid), listClients(session.oid)])
  if (!doc || doc.kind !== kind) notFound()
  const settings = defaultsFor(org)

  return (
    <div className="animate-fade-up space-y-6">
      <Link href={`/agency/billing/${params.kind}/${doc.id}`} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-muted hover:text-ink focus-ring">
        <ArrowLeft className="size-4" aria-hidden="true" /> {doc.number}
      </Link>
      <PageHeader eyebrow="Billing" title={`Edit ${doc.number}`} description="The number and the date of issue stay as they are. Totals are recalculated when you save." />
      <BillingForm kind={kind} document={doc} clients={clients.map((c) => ({ id: c.id, name: c.name, email: c.email ?? null, phone: c.phone ?? null }))} settings={settings} currency={doc.currency} />
    </div>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { BillingForm } from '@/components/platform/billing/BillingForm'
import { PageHeader } from '@/components/platform/ui/PageHeader'
import { requireSession } from '@/lib/auth/server'
import { defaultsFor } from '@/services/billing'
import { listClients } from '@/services/agency/clients'
import { getOrganization } from '@/services/users'
import type { BillingKind } from '@/types/billing'

export const metadata: Metadata = { title: 'New document' }
export const dynamic = 'force-dynamic'

export default async function NewBillingPage({ searchParams }: { searchParams: { kind?: string } }) {
  const session = await requireSession('agency')
  const kind: BillingKind = searchParams.kind === 'invoice' ? 'invoice' : 'quote'
  const [org, clients] = await Promise.all([getOrganization(session.oid), listClients(session.oid)])
  const settings = defaultsFor(org)
  const label = kind === 'quote' ? 'quotation' : 'invoice'

  return (
    <div className="animate-fade-up space-y-6">
      <Link href={`/agency/billing/${kind === 'quote' ? 'quotes' : 'invoices'}`} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-muted hover:text-ink focus-ring">
        <ArrowLeft className="size-4" aria-hidden="true" /> {kind === 'quote' ? 'Quotations' : 'Invoices'}
      </Link>
      <PageHeader
        eyebrow="Billing"
        title={`New ${label}`}
        description={kind === 'quote' ? 'The number is issued when you save. You can edit a draft until you send it.' : 'The number is issued when you save. Send it by email with the PDF attached, or share a link.'}
      />
      <BillingForm kind={kind} clients={clients.map((c) => ({ id: c.id, name: c.name, email: c.email ?? null, phone: c.phone ?? null }))} settings={settings} currency={settings.currency} />
    </div>
  )
}

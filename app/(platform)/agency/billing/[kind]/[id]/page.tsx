import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { BillingDetail } from '@/components/platform/billing/BillingDetail'
import { requireSession } from '@/lib/auth/server'
import { defaultsFor, getDocument } from '@/services/billing'
import { getOrganization } from '@/services/users'

export const metadata: Metadata = { title: 'Document' }
export const dynamic = 'force-dynamic'

const KINDS: Record<string, 'quote' | 'invoice'> = { quotes: 'quote', invoices: 'invoice' }

export default async function BillingDocumentPage({ params, searchParams }: { params: { kind: string; id: string }; searchParams: { created?: string } }) {
  const kind = KINDS[params.kind]
  if (!kind) notFound()
  const session = await requireSession('agency')
  const doc = await getDocument(session.oid, params.id)
  if (!doc || doc.kind !== kind) notFound()
  const org = await getOrganization(session.oid)

  return (
    <div className="animate-fade-up space-y-6">
      <Link href={`/agency/billing/${params.kind}`} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-muted hover:text-ink focus-ring">
        <ArrowLeft className="size-4" aria-hidden="true" /> {kind === 'quote' ? 'Quotations' : 'Invoices'}
      </Link>
      {searchParams.created ? (
        <p role="status" className="rounded-control border border-success/25 bg-success/10 px-3.5 py-2.5 text-[13.5px] text-ink">
          {doc.number} created. Send it by email with the PDF attached, or share a link.
        </p>
      ) : null}
      <BillingDetail document={doc} taxLabel={defaultsFor(org).taxLabel} />
    </div>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Plus } from 'lucide-react'
import { BillingTable } from '@/components/platform/billing/BillingTable'
import { Card } from '@/components/platform/ui/Card'
import { PageHeader } from '@/components/platform/ui/PageHeader'
import { requireSession } from '@/lib/auth/server'
import { billingStats, listDocuments } from '@/services/billing'
import { getOrganization } from '@/services/users'
import type { BillingKind } from '@/types/billing'

export const metadata: Metadata = { title: 'Quotes and invoices' }
export const dynamic = 'force-dynamic'

const KINDS: Record<string, BillingKind> = { quotes: 'quote', invoices: 'invoice' }

export default async function BillingListPage({ params }: { params: { kind: string } }) {
  const kind = KINDS[params.kind]
  if (!kind) notFound()
  const session = await requireSession('agency')
  const org = await getOrganization(session.oid)
  const [rows, stats] = await Promise.all([listDocuments(session.oid, kind), billingStats(session.oid, org)])
  const label = kind === 'quote' ? 'quotation' : 'invoice'
  const money = (v: number) => `${stats.currency} ${v.toLocaleString('en-KE', { maximumFractionDigits: 0 })}`

  const tiles =
    kind === 'quote'
      ? [
          { label: 'Open', value: String(stats.quotesOpen) },
          { label: 'Accepted', value: String(stats.quotesAccepted) },
          { label: 'Total quotations', value: String(rows.length) },
        ]
      : [
          { label: 'Outstanding', value: String(stats.invoicesOutstanding) },
          { label: 'Amount owed', value: money(stats.outstandingAmount) },
          { label: 'Paid this month', value: money(stats.paidThisMonth) },
        ]

  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader
        eyebrow="Billing"
        title={kind === 'quote' ? 'Quotations' : 'Invoices'}
        description={kind === 'quote' ? 'Priced proposals your clients can accept, with a branded PDF and a share link.' : 'What clients owe you, what has been paid, and what is overdue.'}
        aside={
          <Link href={`/agency/billing/new?kind=${kind}`} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-control bg-forest px-4 text-[14px] font-semibold text-white hover:bg-forest-700 focus-ring sm:w-auto">
            <Plus className="size-4" aria-hidden="true" /> New {label}
          </Link>
        }
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {tiles.map((t) => (
          <Card key={t.label} className="p-4">
            <p className="label-caps text-ink-muted">{t.label}</p>
            <p data-numeric className="mt-1.5 font-serif text-[22px] font-bold leading-7 text-forest">
              {t.value}
            </p>
          </Card>
        ))}
      </div>
      <BillingTable rows={rows} kind={kind} />
    </div>
  )
}

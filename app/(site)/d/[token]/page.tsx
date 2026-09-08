import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Download } from 'lucide-react'
import { getSharedDocument } from '@/services/billing'
import { getOrganization, placeholderOrganization } from '@/services/users'
import { BILLING_STATUS_LABEL } from '@/types/billing'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Document', robots: { index: false, follow: false } }

/**
 * The public view of a quote or invoice, reached only through its share link.
 * It shows the agency's own branding, never the platform's, and carries no
 * navigation into the workspace.
 */
export default async function SharedDocumentPage({ params }: { params: { token: string } }) {
  const shared = await getSharedDocument(params.token)
  if (!shared) notFound()
  const doc = shared.document
  const org = (await getOrganization(shared.organizationId)) ?? placeholderOrganization(shared.organizationId)
  const primary = /^#[0-9a-fA-F]{6}$/.test(String(org.branding?.primary ?? '')) ? String(org.branding.primary) : '#073423'
  const accent = /^#[0-9a-fA-F]{6}$/.test(String(org.branding?.accent ?? '')) ? String(org.branding.accent) : '#c28d38'
  const isQuote = doc.kind === 'quote'
  const fmt = (v: number) => `${doc.currency} ${v.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const date = (v: string | null) => (v ? new Date(v).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' }) : '—')

  return (
    <main className="min-h-dvh bg-canvas px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-3xl">
        <article className="overflow-hidden rounded-card border border-line bg-surface">
          <header className="px-5 py-6 text-white sm:px-8" style={{ backgroundColor: primary, borderBottom: `3px solid ${accent}` }}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="font-serif text-[20px] font-semibold">{org.name}</p>
                <p className="mt-1 text-[13px] text-white/75">{[org.phone, org.email].filter(Boolean).join(' · ')}</p>
              </div>
              <div className="sm:text-right">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: accent }}>
                  {isQuote ? 'Quotation' : 'Invoice'}
                </p>
                <p className="font-mono text-[16px] font-bold">{doc.number}</p>
                <p className="text-[12.5px] text-white/75">{date(doc.issueDate)}</p>
              </div>
            </div>
          </header>

          <div className="px-5 py-6 sm:px-8">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-muted">{isQuote ? 'Prepared for' : 'Billed to'}</p>
                <p className="mt-1.5 text-[15px] font-bold text-ink">{doc.customerName}</p>
                {doc.customerAddress ? <p className="text-[13px] text-ink-muted">{doc.customerAddress}</p> : null}
                {doc.customerEmail ? <p className="text-[13px] text-ink-muted">{doc.customerEmail}</p> : null}
              </div>
              <div className="sm:text-right">
                <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-muted">{isQuote ? 'Valid until' : 'Payment due'}</p>
                <p className="mt-1.5 text-[15px] font-bold text-ink">{date(doc.dueDate)}</p>
                <p className="text-[13px] text-ink-muted">{BILLING_STATUS_LABEL[doc.status] ?? doc.status}</p>
              </div>
            </div>

            <div className="mt-7 overflow-x-auto">
              <table className="w-full min-w-[440px] border-collapse text-[13.5px]">
                <thead>
                  <tr className="border-y border-line bg-surface-3 text-left">
                    <th className="px-3 py-2.5 font-semibold text-ink-muted">Description</th>
                    <th className="px-3 py-2.5 text-right font-semibold text-ink-muted">Qty</th>
                    <th className="px-3 py-2.5 text-right font-semibold text-ink-muted">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {doc.lines.map((l) => (
                    <tr key={l.id} className="border-b border-divider last:border-b-0">
                      <td className="px-3 py-3">
                        <p className="font-semibold text-ink">{l.description}</p>
                        {l.detail ? <p className="mt-0.5 text-[12.5px] text-ink-muted">{l.detail}</p> : null}
                      </td>
                      <td className="px-3 py-3 text-right text-ink-muted">{l.quantity}</td>
                      <td className="px-3 py-3 text-right font-semibold text-ink">{fmt(l.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <dl className="ml-auto mt-5 max-w-xs space-y-1.5 text-[13.5px]">
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">Subtotal</dt>
                <dd className="font-semibold text-ink">{fmt(doc.subtotal)}</dd>
              </div>
              {doc.taxTotal > 0 ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-muted">Tax</dt>
                  <dd className="font-semibold text-ink">{fmt(doc.taxTotal)}</dd>
                </div>
              ) : null}
              <div className="flex justify-between gap-4 border-t border-line pt-2">
                <dt className="font-bold" style={{ color: primary }}>
                  {isQuote ? 'Total quoted' : 'Total due'}
                </dt>
                <dd className="font-serif text-[19px] font-bold" style={{ color: primary }}>
                  {fmt(doc.total)}
                </dd>
              </div>
            </dl>

            {doc.notes ? <p className="mt-6 whitespace-pre-wrap text-[13.5px] leading-6 text-ink">{doc.notes}</p> : null}
            {doc.paymentInstructions ? (
              <div className="mt-5 rounded-card border border-line bg-surface-3 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-muted">How to pay</p>
                <p className="mt-1 whitespace-pre-wrap text-[13.5px] leading-6 text-ink">{doc.paymentInstructions}</p>
              </div>
            ) : null}
            {doc.terms ? <p className="mt-5 whitespace-pre-wrap text-[12.5px] leading-5 text-ink-muted">{doc.terms}</p> : null}

            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href={`/api/billing/${doc.id}/pdf?token=${params.token}`}
                className="inline-flex h-11 items-center gap-2 rounded-control px-4 text-[14px] font-semibold text-white focus-ring"
                style={{ backgroundColor: primary }}
              >
                <Download className="size-4" aria-hidden="true" /> Download PDF
              </a>
              {org.email ? (
                <a href={`mailto:${org.email}?subject=${encodeURIComponent(`${doc.number}`)}`} className="inline-flex h-11 items-center rounded-control border border-line bg-surface px-4 text-[14px] font-semibold text-ink hover:border-ink-muted focus-ring">
                  Reply to {org.shortName}
                </a>
              ) : null}
            </div>
          </div>
        </article>
        <p className="mt-4 text-center text-[12px] text-ink-faint">
          {org.name}
          {org.licenceLabel ? ` · ${org.licenceLabel}` : ''}
        </p>
      </div>
    </main>
  )
}

import { FileDown } from 'lucide-react'
import { Card, CardHeader } from '@/components/platform/ui/Card'
import type { Claim, QuoteRequest } from '@/types/platform'

/** Branded PDFs the client can download at any time. Generated on request, numbered, audited. */
export function DocumentsCard({ hasClient, quotes, claims }: { hasClient: boolean; quotes: QuoteRequest[]; claims: Claim[] }) {
  if (!hasClient) return null
  const items: { label: string; href: string; note?: string }[] = [
    { label: 'Registration confirmation', href: '/api/documents/registration' },
    { label: 'Cover summary', href: '/api/documents/client-summary', note: 'Policies, exclusions, quotes and claims' },
    ...quotes.filter((q) => q.stage !== 'declined').map((q) => ({ label: `Quote request ${q.reference}`, href: `/api/documents/quote?id=${q.id}`, note: q.product })),
    ...claims.map((c) => ({ label: `Claim confirmation ${c.reference}`, href: `/api/documents/claim?id=${c.id}`, note: c.product })),
  ]
  return (
    <Card as="section">
      <CardHeader title="Documents" description="PDFs with your agency's details, ready to share or keep." />
      <ul className="mt-3 divide-y divide-divider">
        {items.map((d) => (
          <li key={d.href}>
            <a href={d.href} target="_blank" rel="noopener" className="flex items-center gap-3 py-2.5 text-[13.5px] text-ink hover:text-forest focus-ring rounded-control">
              <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-forest-100 text-forest">
                <FileDown className="size-4" aria-hidden="true" strokeWidth={1.75} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">{d.label}</span>
                {d.note ? <span className="block truncate text-[12px] text-ink-muted">{d.note}</span> : null}
              </span>
              <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-faint">PDF</span>
            </a>
          </li>
        ))}
      </ul>
    </Card>
  )
}

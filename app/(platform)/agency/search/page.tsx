import type { Metadata } from 'next'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { Badge } from '@/components/platform/ui/Badge'
import { Card } from '@/components/platform/ui/Card'
import { EmptyState } from '@/components/platform/ui/EmptyState'
import { PageHeader } from '@/components/platform/ui/PageHeader'
import { requireSession } from '@/lib/auth/server'
import { searchAll } from '@/services/search'

export const metadata: Metadata = { title: 'Search' }
export const dynamic = 'force-dynamic'

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const session = await requireSession('agency')
  const q = typeof searchParams.q === 'string' ? searchParams.q.trim().slice(0, 100) : ''
  const hits = q ? await searchAll(session.oid, q) : []
  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader eyebrow="Find" title="Search" description="Clients, businesses, claims, quotes, conversations, documents and enquiries in your agency." />
      <form action="/agency/search" className="flex gap-2">
        <label htmlFor="q" className="sr-only">
          Search
        </label>
        <input id="q" name="q" defaultValue={q} placeholder="Name, phone, reference, business, document text…" className="h-11 flex-1 rounded-control border border-line bg-surface px-4 text-[14px] focus-ring" autoFocus />
        <button type="submit" className="inline-flex h-11 items-center gap-2 rounded-control bg-forest px-4 text-sm font-semibold text-white hover:bg-forest-700 focus-ring">
          <Search className="size-4" aria-hidden="true" /> Search
        </button>
      </form>
      {q && hits.length === 0 ? (
        <Card flush>
          <EmptyState icon={Search} title={`Nothing found for “${q}”`} description="Try a name, a phone number or a reference like CLM-2026-00001." />
        </Card>
      ) : null}
      {hits.length ? (
        <Card flush>
          <ul className="divide-y divide-divider">
            {hits.map((h, i) => (
              <li key={`${h.kind}-${i}`}>
                <Link href={h.href} className="flex items-center gap-3 px-5 py-3 hover:bg-surface-3 focus-ring">
                  <Badge tone={h.kind === 'client' ? 'forest' : h.kind === 'claim' ? 'error' : h.kind === 'quote' ? 'info' : 'neutral'}>{h.kind}</Badge>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-semibold text-ink">{h.title}</span>
                    <span className="block truncate text-[12.5px] text-ink-muted">{h.detail}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </div>
  )
}

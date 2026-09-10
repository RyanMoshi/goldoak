'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, Phone, Search, Trash2, UserMinus } from 'lucide-react'
import { useEffect, useState, useTransition } from 'react'
import { Badge } from '@/components/platform/ui/Badge'
import { Card } from '@/components/platform/ui/Card'
import { EmptyState } from '@/components/platform/ui/EmptyState'
import { relativeTime } from '@/lib/format'
import { prettyPhone } from '@/lib/phone'
import { deleteNumbersAction, setNumberStatusAction } from '@/lib/numbers/actions'
import type { ContactNumber, NumberPage } from '@/services/numbers'

/**
 * The book itself. Filtering and paging happen in the database and travel in
 * the URL, so a page of fifty rows costs the same whether the agency holds a
 * hundred numbers or fifty thousand, and a filtered view can be shared or
 * bookmarked.
 */

const STATUS_TONE: Record<string, 'neutral' | 'success' | 'gold' | 'error'> = {
  active: 'success',
  unsubscribed: 'neutral',
  invalid: 'error',
  bounced: 'error',
}

const STATUS_LABEL: Record<string, string> = {
  active: 'Active',
  unsubscribed: 'Opted out',
  invalid: 'Invalid',
  bounced: 'Bounced',
}

export function NumberBook({ page, lists, owners, canEdit }: { page: NumberPage; lists: { name: string; count: number }[]; owners: { id: string; name: string }[]; canEdit: boolean }) {
  const router = useRouter()
  const params = useSearchParams()
  const [pending, startTransition] = useTransition()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState(params.get('q') ?? '')
  const [notice, setNotice] = useState<string | null>(null)

  const currentSearch = params.get('q') ?? ''
  const queryString = params.toString()

  // Typing should not fire a query per keystroke. The effect depends on the
  // query string rather than the params object, which is a new value on every
  // render and would restart the timer forever.
  useEffect(() => {
    if (search === currentSearch) return
    const t = setTimeout(() => {
      const next = new URLSearchParams(queryString)
      if (search) next.set('q', search)
      else next.delete('q')
      next.delete('page')
      router.replace(`/agency/numbers?${next.toString()}`, { scroll: false })
    }, 350)
    return () => clearTimeout(t)
  }, [search, currentSearch, queryString, router])

  function set(key: string, value: string | null) {
    const next = new URLSearchParams(params.toString())
    if (value) next.set(key, value)
    else next.delete(key)
    if (key !== 'page') next.delete('page')
    router.replace(`/agency/numbers?${next.toString()}`, { scroll: false })
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const allOnPage = page.rows.length > 0 && page.rows.every((r) => selected.has(r.id))
  const ids = Array.from(selected)

  function act(fn: () => Promise<{ success?: string; error?: string }>) {
    startTransition(async () => {
      const r = await fn()
      setNotice(r.error ?? r.success ?? null)
      setSelected(new Set())
      router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="grid gap-3 md:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))]">
          <label className="relative block">
            <span className="sr-only">Search numbers</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint" aria-hidden="true" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or number"
              className="h-11 w-full rounded-control border border-line bg-surface pl-9 pr-3 text-[14px] text-ink focus-ring"
            />
          </label>

          <select value={params.get('list') ?? 'all'} onChange={(e) => set('list', e.target.value === 'all' ? null : e.target.value)} className="h-11 rounded-control border border-line bg-surface px-3 text-[14px] text-ink focus-ring">
            <option value="all">Every list</option>
            {lists.map((l) => (
              <option key={l.name} value={l.name}>
                {l.name} ({l.count.toLocaleString('en-KE')})
              </option>
            ))}
          </select>

          <select value={params.get('status') ?? 'all'} onChange={(e) => set('status', e.target.value === 'all' ? null : e.target.value)} className="h-11 rounded-control border border-line bg-surface px-3 text-[14px] text-ink focus-ring">
            <option value="all">Any status</option>
            {Object.entries(STATUS_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <select value={params.get('sort') ?? 'newest'} onChange={(e) => set('sort', e.target.value === 'newest' ? null : e.target.value)} className="h-11 rounded-control border border-line bg-surface px-3 text-[14px] text-ink focus-ring">
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="name">By name</option>
            <option value="phone">By number</option>
            <option value="activity">Recently messaged</option>
          </select>
        </div>

        {selected.size > 0 && canEdit ? (
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-control border border-forest/20 bg-forest/5 px-3 py-2">
            <span className="text-[13px] font-semibold text-ink">{selected.size.toLocaleString('en-KE')} selected</span>
            <button
              type="button"
              disabled={pending}
              onClick={() => act(() => setNumberStatusAction(ids, 'unsubscribed'))}
              className="inline-flex h-9 items-center gap-1.5 rounded-control border border-line bg-surface px-3 text-[13px] font-semibold text-ink hover:border-ink-muted disabled:opacity-60 focus-ring"
            >
              <UserMinus className="size-4" aria-hidden="true" /> Mark opted out
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                if (!confirm(`Remove ${selected.size} number${selected.size === 1 ? '' : 's'} from the book? This cannot be undone.`)) return
                act(() => deleteNumbersAction(ids))
              }}
              className="inline-flex h-9 items-center gap-1.5 rounded-control border border-error/30 bg-error/5 px-3 text-[13px] font-semibold text-error hover:border-error/60 disabled:opacity-60 focus-ring"
            >
              <Trash2 className="size-4" aria-hidden="true" /> Remove
            </button>
            {pending ? <Loader2 className="size-4 animate-spin text-ink-muted" aria-hidden="true" /> : null}
          </div>
        ) : null}

        {notice ? (
          <p role="status" className="mt-3 rounded-control border border-success/25 bg-success/10 px-3 py-2 text-[13px] text-ink">
            {notice}
          </p>
        ) : null}
      </Card>

      {page.rows.length === 0 ? (
        <Card flush>
          <EmptyState
            icon={Phone}
            title={params.get('q') || params.get('list') || params.get('status') ? 'Nothing matches that' : 'No numbers yet'}
            description={
              params.get('q') || params.get('list') || params.get('status')
                ? 'Try a different search, or clear the filters.'
                : 'Paste a list above and it becomes an audience you can send a campaign to.'
            }
          />
        </Card>
      ) : (
        <>
          <Card flush className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[720px] text-left text-[13.5px]">
              <thead className="border-b border-divider bg-surface-2">
                <tr className="label-caps text-ink-muted">
                  {canEdit ? (
                    <th scope="col" className="w-10 px-4 py-2.5">
                      <input
                        type="checkbox"
                        checked={allOnPage}
                        onChange={() => setSelected(allOnPage ? new Set() : new Set(page.rows.map((r) => r.id)))}
                        aria-label="Select every number on this page"
                        className="size-4 rounded border-line focus-ring"
                      />
                    </th>
                  ) : null}
                  <th scope="col" className="px-4 py-2.5">Number</th>
                  <th scope="col" className="px-4 py-2.5">Name</th>
                  <th scope="col" className="px-4 py-2.5">List</th>
                  <th scope="col" className="px-4 py-2.5">Owner</th>
                  <th scope="col" className="px-4 py-2.5">Status</th>
                  <th scope="col" className="px-4 py-2.5">Last message</th>
                  <th scope="col" className="px-4 py-2.5">Added</th>
                </tr>
              </thead>
              <tbody>
                {page.rows.map((r) => (
                  <Row key={r.id} row={r} canEdit={canEdit} selected={selected.has(r.id)} onToggle={() => toggle(r.id)} />
                ))}
              </tbody>
            </table>
          </Card>

          <ul className="grid grid-cols-[minmax(0,1fr)] gap-3 md:hidden">
            {page.rows.map((r) => (
              <li key={r.id}>
                <Card className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-mono text-[14px] font-semibold text-ink">{prettyPhone(r.phone)}</p>
                      {r.name ? <p className="truncate text-[13px] text-ink-muted">{r.name}</p> : null}
                    </div>
                    <Badge tone={STATUS_TONE[r.status] ?? 'neutral'} dot>
                      {STATUS_LABEL[r.status] ?? r.status}
                    </Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] text-ink-muted">
                    <span>{r.listName}</span>
                    {r.ownerName ? <span>{r.ownerName}</span> : null}
                    <span>Added {relativeTime(r.createdAt)}</span>
                  </div>
                  {canEdit ? (
                    <label className="mt-3 flex items-center gap-2 text-[12.5px] text-ink-muted">
                      <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggle(r.id)} className="size-4 rounded border-line focus-ring" />
                      Select
                    </label>
                  ) : null}
                </Card>
              </li>
            ))}
          </ul>

          <Pager page={page} onGo={(n) => set('page', n === 1 ? null : String(n))} />
        </>
      )}
    </div>
  )
}

function Row({ row, canEdit, selected, onToggle }: { row: ContactNumber; canEdit: boolean; selected: boolean; onToggle: () => void }) {
  return (
    <tr className="border-b border-divider last:border-b-0 hover:bg-surface-3">
      {canEdit ? (
        <td className="px-4 py-3">
          <input type="checkbox" checked={selected} onChange={onToggle} aria-label={`Select ${row.phone}`} className="size-4 rounded border-line focus-ring" />
        </td>
      ) : null}
      <td className="px-4 py-3">
        <Link href={`/agency/conversations/${encodeURIComponent(row.phone)}`} className="font-mono text-[12.5px] font-semibold text-forest hover:underline focus-ring">
          {prettyPhone(row.phone)}
        </Link>
      </td>
      <td className="max-w-[200px] truncate px-4 py-3 font-semibold text-ink">{row.name ?? '—'}</td>
      <td className="px-4 py-3 text-ink-muted">{row.listName}</td>
      <td className="px-4 py-3 text-ink-muted">{row.ownerName ?? 'Unassigned'}</td>
      <td className="px-4 py-3">
        <Badge tone={STATUS_TONE[row.status] ?? 'neutral'} dot>
          {STATUS_LABEL[row.status] ?? row.status}
        </Badge>
      </td>
      <td className="px-4 py-3 text-ink-muted">{row.lastSentAt ? relativeTime(row.lastSentAt) : 'Never'}</td>
      <td className="px-4 py-3 text-ink-muted">{relativeTime(row.createdAt)}</td>
    </tr>
  )
}

function Pager({ page, onGo }: { page: NumberPage; onGo: (n: number) => void }) {
  if (page.pages <= 1) return null
  const from = (page.page - 1) * page.pageSize + 1
  const to = Math.min(page.total, page.page * page.pageSize)
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-[13px] text-ink-muted">
        Showing {from.toLocaleString('en-KE')}–{to.toLocaleString('en-KE')} of {page.total.toLocaleString('en-KE')}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page.page <= 1}
          onClick={() => onGo(page.page - 1)}
          className="inline-flex h-9 items-center rounded-control border border-line bg-surface px-3 text-[13px] font-semibold text-ink hover:border-ink-muted disabled:opacity-40 focus-ring"
        >
          Previous
        </button>
        <span className="text-[13px] text-ink-muted">
          Page {page.page.toLocaleString('en-KE')} of {page.pages.toLocaleString('en-KE')}
        </span>
        <button
          type="button"
          disabled={page.page >= page.pages}
          onClick={() => onGo(page.page + 1)}
          className="inline-flex h-9 items-center rounded-control border border-line bg-surface px-3 text-[13px] font-semibold text-ink hover:border-ink-muted disabled:opacity-40 focus-ring"
        >
          Next
        </button>
      </div>
    </div>
  )
}

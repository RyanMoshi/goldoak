'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, Search, ShieldAlert, Trash2, UserCheck, UserX, Users } from 'lucide-react'
import { useEffect, useState, useTransition } from 'react'
import { Badge } from '@/components/platform/ui/Badge'
import { Card } from '@/components/platform/ui/Card'
import { EmptyState } from '@/components/platform/ui/EmptyState'
import { relativeTime } from '@/lib/format'
import { prettyPhone } from '@/lib/phone'
import { deleteUserAction, setUserActiveAction, setUserRoleAction } from '@/lib/admin/directory-actions'
import type { DirectoryPage, DirectoryUser } from '@/services/directory'

/**
 * Everyone on the platform, in one table.
 *
 * Customers, agents, agency administrators and operators sit side by side,
 * because "who is this person" is the question being asked, not "which tenant
 * do they belong to". Filters live in the URL so a view can be shared, and
 * every destructive action asks first and says what it did.
 */

const ROLE_LABEL: Record<string, string> = {
  admin: 'Platform admin',
  agency_admin: 'Agency admin',
  agency: 'Agent',
  client: 'Customer',
}

const ROLE_TONE: Record<string, 'gold' | 'info' | 'neutral' | 'success'> = {
  admin: 'gold',
  agency_admin: 'info',
  agency: 'neutral',
  client: 'success',
}

export function UserDirectory({ page, agencies }: { page: DirectoryPage; agencies: { id: string; name: string }[] }) {
  const router = useRouter()
  const params = useSearchParams()
  const [pending, startTransition] = useTransition()
  const [search, setSearch] = useState(params.get('q') ?? '')
  const [notice, setNotice] = useState<{ ok: boolean; message: string } | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const currentSearch = params.get('q') ?? ''
  const queryString = params.toString()

  useEffect(() => {
    if (search === currentSearch) return
    const t = setTimeout(() => {
      const next = new URLSearchParams(queryString)
      if (search) next.set('q', search)
      else next.delete('q')
      next.delete('page')
      router.replace(`/super-admin/users?${next.toString()}`, { scroll: false })
    }, 350)
    return () => clearTimeout(t)
  }, [search, currentSearch, queryString, router])

  function set(key: string, value: string | null) {
    const next = new URLSearchParams(queryString)
    if (value) next.set(key, value)
    else next.delete(key)
    if (key !== 'page') next.delete('page')
    router.replace(`/super-admin/users?${next.toString()}`, { scroll: false })
  }

  function run(id: string, fn: () => Promise<{ error?: string; success?: string }>) {
    setBusyId(id)
    startTransition(async () => {
      const r = await fn()
      setNotice({ ok: !r.error, message: r.error ?? r.success ?? '' })
      setBusyId(null)
      router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="grid gap-3 md:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))]">
          <label className="relative block">
            <span className="sr-only">Search everyone</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint" aria-hidden="true" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email or phone"
              className="h-11 w-full rounded-control border border-line bg-surface pl-9 pr-3 text-[14px] text-ink focus-ring"
            />
          </label>

          <select value={params.get('role') ?? 'all'} onChange={(e) => set('role', e.target.value === 'all' ? null : e.target.value)} className="h-11 rounded-control border border-line bg-surface px-3 text-[14px] text-ink focus-ring">
            <option value="all">Everyone</option>
            <option value="client">Customers</option>
            <option value="staff">Agency staff</option>
            <option value="agency_admin">Agency admins</option>
            <option value="admin">Platform admins</option>
          </select>

          <select value={params.get('org') ?? 'all'} onChange={(e) => set('org', e.target.value === 'all' ? null : e.target.value)} className="h-11 rounded-control border border-line bg-surface px-3 text-[14px] text-ink focus-ring">
            <option value="all">Every agency</option>
            {agencies.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>

          <select value={params.get('status') ?? 'all'} onChange={(e) => set('status', e.target.value === 'all' ? null : e.target.value)} className="h-11 rounded-control border border-line bg-surface px-3 text-[14px] text-ink focus-ring">
            <option value="all">Any status</option>
            <option value="active">Active</option>
            <option value="inactive">Deactivated</option>
          </select>
        </div>

        {notice ? (
          <p
            role={notice.ok ? 'status' : 'alert'}
            className={
              notice.ok
                ? 'mt-3 rounded-control border border-success/25 bg-success/10 px-3 py-2 text-[13px] text-ink'
                : 'mt-3 rounded-control border border-error/25 bg-error/10 px-3 py-2 text-[13px] text-error'
            }
          >
            {notice.message}
          </p>
        ) : null}
      </Card>

      {page.rows.length === 0 ? (
        <Card flush>
          <EmptyState icon={Users} title="Nobody matches that" description="Try a different search, or clear the filters." />
        </Card>
      ) : (
        <>
          <Card flush className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[900px] text-left text-[13.5px]">
              <thead className="border-b border-divider bg-surface-2">
                <tr className="label-caps text-ink-muted">
                  <th scope="col" className="px-4 py-2.5">Person</th>
                  <th scope="col" className="px-4 py-2.5">Role</th>
                  <th scope="col" className="px-4 py-2.5">Agency</th>
                  <th scope="col" className="px-4 py-2.5">Status</th>
                  <th scope="col" className="px-4 py-2.5">Last seen</th>
                  <th scope="col" className="px-4 py-2.5">Joined</th>
                  <th scope="col" className="px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {page.rows.map((u) => (
                  <tr key={u.id} className="border-b border-divider last:border-b-0 hover:bg-surface-3">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-ink">{u.name}</p>
                      <p className="text-[12.5px] text-ink-muted">{u.email}</p>
                      {u.phone ? <p className="font-mono text-[12px] text-ink-faint">{prettyPhone(u.phone)}</p> : null}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={ROLE_TONE[u.role] ?? 'neutral'}>{ROLE_LABEL[u.role] ?? u.role}</Badge>
                    </td>
                    <td className="px-4 py-3 text-ink-muted">
                      {u.agencies.length ? u.agencies.map((a) => a.name).join(', ') : (u.organizationName ?? '—')}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={u.active ? 'success' : 'error'} dot>
                        {u.active ? 'Active' : 'Deactivated'}
                      </Badge>
                      {!u.emailVerified ? <p className="mt-1 text-[11.5px] text-ink-faint">Email unverified</p> : null}
                    </td>
                    <td className="px-4 py-3 text-ink-muted">{u.lastSeenAt ? relativeTime(u.lastSeenAt) : 'Never'}</td>
                    <td className="px-4 py-3 text-ink-muted">{relativeTime(u.createdAt)}</td>
                    <td className="px-4 py-3">
                      <Actions user={u} busy={pending && busyId === u.id} onRun={run} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <ul className="grid grid-cols-[minmax(0,1fr)] gap-3 lg:hidden">
            {page.rows.map((u) => (
              <li key={u.id}>
                <Card className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-ink">{u.name}</p>
                      <p className="truncate text-[12.5px] text-ink-muted">{u.email}</p>
                    </div>
                    <Badge tone={u.active ? 'success' : 'error'} dot>
                      {u.active ? 'Active' : 'Off'}
                    </Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[12.5px] text-ink-muted">
                    <Badge tone={ROLE_TONE[u.role] ?? 'neutral'}>{ROLE_LABEL[u.role] ?? u.role}</Badge>
                    <span>{u.agencies.length ? u.agencies.map((a) => a.name).join(', ') : (u.organizationName ?? 'No agency')}</span>
                  </div>
                  <div className="mt-3">
                    <Actions user={u} busy={pending && busyId === u.id} onRun={run} />
                  </div>
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

function Actions({
  user,
  busy,
  onRun,
}: {
  user: DirectoryUser
  busy: boolean
  onRun: (id: string, fn: () => Promise<{ error?: string; success?: string }>) => void
}) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-1.5">
      {busy ? <Loader2 className="size-4 animate-spin text-ink-muted" aria-hidden="true" /> : null}

      <select
        value={user.role}
        onChange={(e) => {
          const role = e.target.value as 'admin' | 'agency_admin' | 'agency' | 'client'
          if (role === user.role) return
          if (!confirm(`Change ${user.name} to ${ROLE_LABEL[role]}?`)) return
          onRun(user.id, () => setUserRoleAction(user.id, role))
        }}
        className="h-8 rounded-control border border-line bg-surface px-2 text-[12.5px] text-ink focus-ring"
        aria-label={`Role for ${user.name}`}
      >
        {Object.entries(ROLE_LABEL).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={() => onRun(user.id, () => setUserActiveAction(user.id, !user.active))}
        className="inline-flex h-8 items-center gap-1.5 rounded-control border border-line bg-surface px-2.5 text-[12.5px] font-semibold text-ink transition-colors hover:border-ink-muted focus-ring"
      >
        {user.active ? <UserX className="size-3.5" aria-hidden="true" /> : <UserCheck className="size-3.5" aria-hidden="true" />}
        {user.active ? 'Deactivate' : 'Reactivate'}
      </button>

      <button
        type="button"
        onClick={() => {
          if (!confirm(`Delete ${user.name} permanently? Their conversations and invoices stay with the agency, but the account is gone.`)) return
          onRun(user.id, () => deleteUserAction(user.id))
        }}
        className="inline-flex h-8 items-center gap-1.5 rounded-control border border-error/30 bg-error/5 px-2.5 text-[12.5px] font-semibold text-error transition-colors hover:border-error/60 focus-ring"
      >
        <Trash2 className="size-3.5" aria-hidden="true" /> Delete
      </button>

      {user.role === 'admin' ? <ShieldAlert className="size-4 text-gold" aria-label="Platform administrator" /> : null}
    </div>
  )
}

function Pager({ page, onGo }: { page: DirectoryPage; onGo: (n: number) => void }) {
  if (page.pages <= 1) return null
  const from = (page.page - 1) * page.pageSize + 1
  const to = Math.min(page.total, page.page * page.pageSize)
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-[13px] text-ink-muted">
        Showing {from.toLocaleString('en-KE')}–{to.toLocaleString('en-KE')} of {page.total.toLocaleString('en-KE')} accounts
      </p>
      <div className="flex items-center gap-2">
        <button type="button" disabled={page.page <= 1} onClick={() => onGo(page.page - 1)} className="inline-flex h-9 items-center rounded-control border border-line bg-surface px-3 text-[13px] font-semibold text-ink hover:border-ink-muted disabled:opacity-40 focus-ring">
          Previous
        </button>
        <span className="text-[13px] text-ink-muted">
          Page {page.page} of {page.pages}
        </span>
        <button type="button" disabled={page.page >= page.pages} onClick={() => onGo(page.page + 1)} className="inline-flex h-9 items-center rounded-control border border-line bg-surface px-3 text-[13px] font-semibold text-ink hover:border-ink-muted disabled:opacity-40 focus-ring">
          Next
        </button>
      </div>
    </div>
  )
}

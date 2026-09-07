import type { Metadata } from 'next'
import { Card } from '@/components/platform/ui/Card'
import { PageHeader } from '@/components/platform/ui/PageHeader'
import { requireAgencyAdmin } from '@/lib/auth/server'
import { relativeTime } from '@/lib/format'
import { listAudit } from '@/services/audit'

export const metadata: Metadata = { title: 'Audit log' }
export const dynamic = 'force-dynamic'

export default async function AuditPage() {
  const session = await requireAgencyAdmin()
  const entries = await listAudit(session.oid, 200)
  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader eyebrow="Agency admin" title="Audit log" description="Who did what in your agency: accounts, businesses, claims, documents, conversations." />
      <Card flush className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-[13px]">
          <thead>
            <tr className="border-b border-line text-left">
              <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-muted">When</th>
              <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-muted">Action</th>
              <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-muted">Target</th>
              <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-muted">By</th>
              <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-muted">Detail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-divider">
            {entries.map((e) => (
              <tr key={e.id}>
                <td className="px-4 py-2 font-mono text-[12px] text-ink-muted">{relativeTime(e.at)}</td>
                <td className="px-4 py-2 font-semibold text-ink">{e.action}</td>
                <td className="px-4 py-2 font-mono text-[12px] text-ink-muted">{e.target ?? '—'}</td>
                <td className="px-4 py-2 font-mono text-[12px] text-ink-muted">{e.actorUserId ?? 'system'}</td>
                <td className="px-4 py-2 text-[12px] text-ink-muted">{e.detail ? JSON.stringify(e.detail).slice(0, 120) : ''}</td>
              </tr>
            ))}
            {entries.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-ink-muted">
                  Nothing recorded yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </Card>
    </div>
  )
}

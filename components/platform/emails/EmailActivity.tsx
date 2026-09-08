import { Mail } from 'lucide-react'
import { Badge, type BadgeTone } from '@/components/platform/ui/Badge'
import { Card } from '@/components/platform/ui/Card'
import { EmptyState } from '@/components/platform/ui/EmptyState'
import { relativeTime } from '@/lib/format'
import type { EmailLogRow, EmailStats } from '@/services/emails'

const tone: Record<string, BadgeTone> = { sent: 'success', queued: 'info', failed: 'warning', dead: 'error', skipped: 'neutral' }

/** Every email the platform sent (super admin) or the agency sent (agency), with delivery status. */
export function EmailActivity({ rows, stats, showOrganization }: { rows: EmailLogRow[]; stats: EmailStats; showOrganization: boolean }) {
  const tiles = [
    { label: 'Sent · 24h', value: stats.sent24h },
    { label: 'Failed · 24h', value: stats.failed24h },
    { label: 'Queued', value: stats.queued },
    { label: 'Dead', value: stats.dead },
  ]
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {tiles.map((t) => (
          <Card key={t.label} className="p-4">
            <p className="label-caps text-ink-muted">{t.label}</p>
            <p data-numeric className="mt-1.5 font-serif text-[24px] font-bold leading-8 text-forest">
              {t.value}
            </p>
          </Card>
        ))}
      </div>
      {rows.length === 0 ? (
        <Card flush>
          <EmptyState icon={Mail} title="No emails yet" description="Invitations, temporary passwords, reminders and security alerts appear here as they are sent." />
        </Card>
      ) : (
        <>
          <ul className="grid gap-3 md:hidden">
            {rows.map((r) => (
              <li key={r.id} className="rounded-card border border-line bg-surface p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="min-w-0 truncate text-[14px] font-bold text-ink">{r.subject}</p>
                  <Badge tone={tone[r.status] ?? 'neutral'} dot>
                    {r.status}
                  </Badge>
                </div>
                <p className="mt-1 truncate font-mono text-[12px] text-ink-muted">{r.to}</p>
                <p className="mt-1 text-[12px] text-ink-faint">
                  {r.template} · {relativeTime(r.createdAt)}
                  {showOrganization && r.organizationName ? ` · ${r.organizationName}` : ''}
                </p>
                {r.error ? <p className="mt-1 text-[12px] text-error">{r.error}</p> : null}
              </li>
            ))}
          </ul>
          <Card flush className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[760px] border-collapse text-[13.5px]">
              <thead>
                <tr className="border-b border-line text-left">
                  {['Recipient', 'Subject', 'Template', showOrganization ? 'Agency' : null, 'Status', 'When'].filter(Boolean).map((h) => (
                    <th key={h as string} className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-muted">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-divider">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-surface-3">
                    <td className="px-4 py-3 font-mono text-[12.5px]">{r.to}</td>
                    <td className="max-w-[280px] truncate px-4 py-3 font-semibold text-ink">{r.subject}</td>
                    <td className="px-4 py-3 text-ink-muted">{r.template}</td>
                    {showOrganization ? <td className="px-4 py-3 text-ink-muted">{r.organizationName ?? 'Platform'}</td> : null}
                    <td className="px-4 py-3">
                      <Badge tone={tone[r.status] ?? 'neutral'} dot>
                        {r.status}
                      </Badge>
                      {r.error ? <span className="ml-2 text-[12px] text-error">{r.error.slice(0, 60)}</span> : null}
                    </td>
                    <td className="px-4 py-3 text-ink-muted">{relativeTime(r.sentAt ?? r.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </div>
  )
}

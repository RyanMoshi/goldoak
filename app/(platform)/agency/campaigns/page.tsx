import type { Metadata } from 'next'
import Link from 'next/link'
import { Megaphone, Plus } from 'lucide-react'
import { Badge } from '@/components/platform/ui/Badge'
import { Card } from '@/components/platform/ui/Card'
import { EmptyState } from '@/components/platform/ui/EmptyState'
import { PageHeader } from '@/components/platform/ui/PageHeader'
import { requireAgencyAdmin } from '@/lib/auth/server'
import { relativeTime } from '@/lib/format'
import { SuppressionPanel } from '@/components/platform/campaigns/SuppressionPanel'
import { listCampaigns, listSuppressions } from '@/services/campaigns'
import { CAMPAIGN_STATUS_LABEL } from '@/types/campaigns'

export const metadata: Metadata = { title: 'Campaigns' }
export const dynamic = 'force-dynamic'

const TONE: Record<string, 'neutral' | 'info' | 'gold' | 'success' | 'error'> = {
  draft: 'neutral',
  scheduled: 'info',
  processing: 'gold',
  sent: 'success',
  partial: 'gold',
  failed: 'error',
  cancelled: 'neutral',
}

export default async function CampaignsPage() {
  const session = await requireAgencyAdmin()
  const [campaigns, suppressions] = await Promise.all([listCampaigns(session.oid), listSuppressions(session.oid)])
  const sent = campaigns.reduce((n, c) => n + c.sentCount, 0)
  const active = campaigns.filter((c) => c.status === 'processing' || c.status === 'scheduled').length

  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader
        eyebrow="Communications"
        title="Campaigns"
        description="One message to many clients, on WhatsApp or by email. Sending happens in the background and respects everyone's opt-out."
        aside={
          <Link href="/agency/campaigns/new" className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-control bg-forest px-4 text-[14px] font-semibold text-white hover:bg-forest-700 focus-ring sm:w-auto">
            <Plus className="size-4" aria-hidden="true" /> New campaign
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Campaigns', value: String(campaigns.length) },
          { label: 'Messages sent', value: String(sent) },
          { label: 'Running or due', value: String(active) },
          { label: 'Drafts', value: String(campaigns.filter((c) => c.status === 'draft').length) },
        ].map((t) => (
          <Card key={t.label} className="p-4">
            <p className="label-caps text-ink-muted">{t.label}</p>
            <p data-numeric className="mt-1.5 font-serif text-[22px] font-bold leading-7 text-forest">
              {t.value}
            </p>
          </Card>
        ))}
      </div>

      {campaigns.length === 0 ? (
        <Card flush>
          <EmptyState
            icon={Megaphone}
            title="No campaigns yet"
            description="Announce a renewal window, share a product, or check in with a group of clients."
            action={
              <Link href="/agency/campaigns/new" className="inline-flex h-10 items-center rounded-control bg-forest px-4 text-[13.5px] font-semibold text-white hover:bg-forest-700 focus-ring">
                Create your first campaign
              </Link>
            }
          />
        </Card>
      ) : (
        <Card flush>
          <ul className="divide-y divide-divider">
            {campaigns.map((c) => (
              <li key={c.id}>
                <Link href={`/agency/campaigns/${c.id}`} className="flex flex-col gap-2 px-5 py-4 hover:bg-surface-3 focus-ring sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-[14.5px] font-bold text-ink">{c.name}</p>
                      <Badge tone={TONE[c.status] ?? 'neutral'} dot>
                        {CAMPAIGN_STATUS_LABEL[c.status]}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-[12.5px] text-ink-muted">
                      {c.channel === 'both' ? 'Email + WhatsApp' : c.channel === 'email' ? 'Email' : 'WhatsApp'} · {relativeTime(c.createdAt)}
                      {c.createdByName ? ` · ${c.createdByName}` : ''}
                    </p>
                  </div>
                  <div className="shrink-0 text-left text-[12.5px] text-ink-muted sm:text-right">
                    {c.totalRecipients ? (
                      <p>
                        <span data-numeric className="font-bold text-ink">
                          {c.sentCount}
                        </span>{' '}
                        sent{c.failedCount ? ` · ${c.failedCount} failed` : ''}
                      </p>
                    ) : (
                      <p>Not sent yet</p>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
      <SuppressionPanel entries={suppressions} />
    </div>
  )
}

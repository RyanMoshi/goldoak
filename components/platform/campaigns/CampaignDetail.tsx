'use client'

import { AlertTriangle, Ban, Send } from 'lucide-react'
import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/platform/ui/Badge'
import { Card, CardHeader } from '@/components/platform/ui/Card'
import { SubmitButton, TextInput } from '@/components/platform/ui/Form'
import { StatusLine } from '@/components/platform/ui/PageHeader'
import { relativeTime } from '@/lib/format'
import { cancelCampaignAction, launchCampaignAction, type CampaignState } from '@/lib/campaigns/actions'
import { LARGE_CAMPAIGN } from '@/lib/campaigns/limits'
import { CAMPAIGN_STATUS_LABEL, type Campaign, type CampaignRecipient } from '@/types/campaigns'

/**
 * Reviewing and launching. A large audience has to be confirmed by typing the
 * recipient count, and a campaign that is already sending cannot be launched
 * again — the button disappears and the progress takes its place.
 */

const TONE: Record<string, 'neutral' | 'info' | 'gold' | 'success' | 'error'> = {
  draft: 'neutral',
  scheduled: 'info',
  processing: 'gold',
  sent: 'success',
  partial: 'gold',
  failed: 'error',
  cancelled: 'neutral',
}

export function CampaignDetail({ campaign, recipients, audienceSize }: { campaign: Campaign; recipients: CampaignRecipient[]; audienceSize: number }) {
  const [state, setState] = useState<CampaignState>({})
  const [pending, startTransition] = useTransition()
  const canLaunch = campaign.status === 'draft' || campaign.status === 'scheduled'
  const running = campaign.status === 'processing'
  const done = campaign.sentCount + campaign.failedCount
  const progress = campaign.totalRecipients ? Math.round((done / Math.max(1, campaign.totalRecipients - campaign.skippedCount)) * 100) : 0

  return (
    <div className="space-y-6">
      <Card as="section">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-serif text-[20px] font-semibold text-forest">{campaign.name}</h2>
              <Badge tone={TONE[campaign.status] ?? 'neutral'} dot>
                {CAMPAIGN_STATUS_LABEL[campaign.status]}
              </Badge>
              <Badge tone="neutral">{campaign.channel === 'both' ? 'Email + WhatsApp' : campaign.channel === 'email' ? 'Email' : 'WhatsApp'}</Badge>
            </div>
            <p className="mt-1 text-[13px] text-ink-muted">
              Created {relativeTime(campaign.createdAt)}
              {campaign.createdByName ? ` by ${campaign.createdByName}` : ''}
              {campaign.scheduledAt ? ` · scheduled for ${new Date(campaign.scheduledAt).toLocaleString('en-KE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}` : ''}
            </p>
          </div>
          {canLaunch ? (
            <Link href={`/agency/campaigns/${campaign.id}/edit`} className="inline-flex h-10 shrink-0 items-center rounded-control border border-line bg-surface px-3.5 text-[13.5px] font-semibold text-ink hover:border-ink-muted focus-ring">
              Edit
            </Link>
          ) : null}
        </div>

        {running || campaign.status === 'sent' || campaign.status === 'partial' || campaign.status === 'failed' ? (
          <div className="mt-5">
            <div className="flex items-center justify-between text-[12.5px] font-semibold text-ink-muted">
              <span>
                {campaign.sentCount} sent
                {campaign.failedCount ? ` · ${campaign.failedCount} failed` : ''}
                {campaign.skippedCount ? ` · ${campaign.skippedCount} skipped` : ''}
              </span>
              <span>{running ? `${progress}%` : 'Finished'}</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-2">
              <div className="h-full rounded-full bg-forest transition-all" style={{ width: `${running ? progress : 100}%` }} />
            </div>
            {running ? <p className="mt-2 text-[12.5px] text-ink-faint">Sending in the background. You can close this page; it carries on.</p> : null}
          </div>
        ) : null}

        {canLaunch ? (
          <form action={(fd) => startTransition(async () => setState(await launchCampaignAction(campaign.id, fd)))} className="mt-5 rounded-card border border-gold/30 bg-gold/5 p-4">
            <p className="flex items-start gap-2 text-[13.5px] text-ink">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-gold-700" aria-hidden="true" />
              <span>
                This will send to <strong>{audienceSize}</strong> {audienceSize === 1 ? 'person' : 'people'} right now. Anyone who has opted out is skipped automatically.
              </span>
            </p>
            <input type="hidden" name="expected" value={audienceSize} />
            {audienceSize >= LARGE_CAMPAIGN ? (
              <div className="mt-3 max-w-xs">
                <TextInput label={`Type ${audienceSize} to confirm`} name="confirm" required placeholder={String(audienceSize)} error={state.field === 'confirm' ? state.error : undefined} />
              </div>
            ) : null}
            <div className="mt-3 flex flex-wrap gap-2">
              <SubmitButton pending={pending} pendingLabel="Starting…" disabled={audienceSize === 0}>
                <Send className="size-4" aria-hidden="true" /> Send now
              </SubmitButton>
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  if (window.confirm('Cancel this campaign?')) startTransition(async () => setState(await cancelCampaignAction(campaign.id)))
                }}
                className="inline-flex h-11 items-center gap-2 rounded-control border border-line bg-surface px-4 text-[14px] font-semibold text-ink-muted hover:border-ink-muted hover:text-ink focus-ring disabled:opacity-60"
              >
                <Ban className="size-4" aria-hidden="true" /> Cancel campaign
              </button>
            </div>
          </form>
        ) : null}

        {running ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              if (window.confirm('Stop this campaign? Anything already sent has gone.')) startTransition(async () => setState(await cancelCampaignAction(campaign.id)))
            }}
            className="mt-4 inline-flex h-10 items-center gap-2 rounded-control border border-line bg-surface px-3.5 text-[13.5px] font-semibold text-ink-muted hover:border-error hover:text-error focus-ring disabled:opacity-60"
          >
            <Ban className="size-4" aria-hidden="true" /> Stop sending
          </button>
        ) : null}

        <StatusLine success={state.success} error={!state.field ? state.error : undefined} onDismiss={() => setState({})} />
      </Card>

      <Card as="section">
        <CardHeader title="Message" description={campaign.channel === 'whatsapp' ? 'Sent as plain text.' : campaign.subject ?? undefined} />
        <div className="mt-4 rounded-card border border-line bg-surface-3 p-4">
          <p className="whitespace-pre-wrap text-[13.5px] leading-6 text-ink">{campaign.body}</p>
          {campaign.ctaLabel && campaign.ctaUrl ? (
            <p className="mt-3">
              <span className="inline-flex h-9 items-center rounded-control bg-forest px-4 text-[13px] font-semibold text-white">{campaign.ctaLabel}</span>
              <span className="ml-2 break-all text-[12px] text-ink-faint">{campaign.ctaUrl}</span>
            </p>
          ) : null}
        </div>
      </Card>

      {recipients.length ? (
        <Card as="section" flush>
          <div className="p-5 pb-3">
            <CardHeader title="Recipients" description={`${recipients.length} shown, failures first.`} />
          </div>
          <ul className="divide-y divide-divider border-t border-line">
            {recipients.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-[13.5px] font-semibold text-ink">{r.name}</p>
                  <p className="truncate font-mono text-[11.5px] text-ink-muted">{r.email ?? (r.phone ? `+${r.phone}` : '—')}</p>
                </div>
                <div className="flex items-center gap-2">
                  {r.error ? <span className="max-w-[220px] truncate text-[11.5px] text-error">{r.error}</span> : null}
                  <Badge tone={r.status === 'sent' ? 'success' : r.status === 'failed' ? 'error' : r.status === 'skipped' ? 'neutral' : 'info'} dot>
                    {r.status}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </div>
  )
}

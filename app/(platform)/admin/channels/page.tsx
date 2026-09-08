import type { Metadata } from 'next'
import { MessageCircle, Smartphone } from 'lucide-react'
import { Badge } from '@/components/platform/ui/Badge'
import { Card } from '@/components/platform/ui/Card'
import { EmptyState } from '@/components/platform/ui/EmptyState'
import { requireSession } from '@/lib/auth/server'
import { relativeTime } from '@/lib/format'
import { listChannels } from '@/lib/whatsapp/channels'
import { botNumber, whatsappConfigured } from '@/lib/whatsapp/provider'

export const metadata: Metadata = { title: 'WhatsApp numbers' }
export const dynamic = 'force-dynamic'

export default async function AdminChannelsPage() {
  await requireSession('admin')
  const channels = await listChannels()
  const shared = botNumber()
  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <p className="label-caps flex items-center gap-2 text-gold-700">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-gold" />
          Platform
        </p>
        <h1 className="mt-2 font-serif text-[26px] font-medium leading-8 text-forest sm:text-[34px] sm:leading-[2.75rem]">WhatsApp numbers</h1>
        <p className="mt-1 text-[14.5px] text-ink-muted">The shared Super Agent line plus every agency's own number. Agencies connect theirs under WhatsApp in their workspace.</p>
      </div>
      <Card className="p-4">
        <p className="label-caps text-ink-muted">Shared Super Agent line</p>
        <p className="mt-1 text-[14px] text-ink">
          {shared ? 'connected' : 'not configured'} · gateway {whatsappConfigured() ? 'configured' : 'off'} · routes by account, join code or agency choice.
        </p>
        {shared ? (
          <a
            href={`https://wa.me/${shared}`}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex h-9 items-center gap-2 rounded-control border border-line bg-surface px-3 text-[13px] font-semibold text-ink hover:border-ink-muted focus-ring"
          >
            <MessageCircle className="size-4" aria-hidden="true" /> Chat on WhatsApp
          </a>
        ) : null}
      </Card>
      {channels.length === 0 ? (
        <Card flush>
          <EmptyState icon={Smartphone} title="No agency numbers yet" description="When an agency connects its own number it appears here." />
        </Card>
      ) : (
        <Card flush>
          <ul className="divide-y divide-divider">
            {channels.map((c) => (
              <li key={c.id} className="flex flex-col gap-1 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-[14px] font-bold text-ink">{c.organizationName}</p>
                  <p className="font-mono text-[12px] text-ink-muted">
                    {c.phone ? `+${c.phone}` : 'not paired yet'} · session {c.sessionId?.slice(0, 8)}…
                  </p>
                  {c.lastError ? <p className="text-[12px] text-error">{c.lastError}</p> : null}
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={c.status === 'ready' ? 'success' : c.status === 'qr_ready' ? 'gold' : 'neutral'} dot>
                    {c.status}
                  </Badge>
                  <span className="text-[12px] text-ink-faint">{relativeTime(c.updatedAt)}</span>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}

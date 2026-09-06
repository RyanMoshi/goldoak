import { ArrowLeft, Mail, MessageCircle, Phone } from 'lucide-react'
import Link from 'next/link'
import { stageBadge } from '@/components/platform/clients/ClientsTable'
import { ClientWorkbench } from '@/components/platform/clients/ClientWorkbench'
import { JourneyTracker } from '@/components/platform/portal/JourneyTracker'
import { ClaimList } from '@/components/platform/portal/ClaimList'
import { PolicyList } from '@/components/platform/portal/PolicyList'
import { QuoteList } from '@/components/platform/portal/QuoteList'
import { Badge } from '@/components/platform/ui/Badge'
import { Card, CardHeader } from '@/components/platform/ui/Card'
import { formatPhone, relativeTime } from '@/lib/format'
import type { ClientDetail as Detail } from '@/services/agency/clients'

const typeLabel = { individual: 'Individual', sme: 'SME', corporate: 'Corporate' } as const

/** Client 360 for the agency: stage, contacts, policies, quotes, claims, tasks, history, and the controls to move things. */
export function ClientDetail({ detail }: { detail: Detail }) {
  const { client, policies, quotes, claims, tasks, activity } = detail
  const stage = stageBadge(client.stage)

  return (
    <div className="animate-fade-up">
      <Link href="/agency/clients" className="inline-flex items-center gap-1.5 rounded-control text-[13px] font-semibold text-ink-muted hover:text-ink focus-ring">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Clients
      </Link>

      <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{typeLabel[client.type]}</Badge>
            <Badge tone={stage.tone}>{stage.label}</Badge>
            {client.userId ? <Badge tone="forest">Portal account</Badge> : <Badge tone="neutral">No portal account</Badge>}
          </div>
          <h2 className="mt-2 font-serif text-[28px] font-medium leading-9 text-forest sm:text-[32px]">{client.name}</h2>
          <p className="mt-1 text-[13px] text-ink-muted">
            Client since {relativeTime(client.createdAt)}
            {client.adviserName ? ` · Adviser ${client.adviserName}` : ''}
          </p>
          {client.notes ? <p className="mt-2 max-w-prose text-[13.5px] text-ink"><span className="font-semibold">Wants to protect:</span> {client.notes}</p> : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {client.phone ? (
            <>
              <a href={`tel:+${client.phone}`} className="inline-flex h-9 items-center gap-1.5 rounded-control border border-line bg-surface px-3 text-[13px] font-semibold text-ink hover:border-ink-muted focus-ring">
                <Phone className="size-4" aria-hidden="true" /> {formatPhone(client.phone)}
              </a>
              <a href={`https://wa.me/${client.phone}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-control bg-forest px-3 text-[13px] font-semibold text-white hover:bg-forest-700 focus-ring">
                <MessageCircle className="size-4" aria-hidden="true" /> WhatsApp
              </a>
            </>
          ) : null}
          {client.email ? (
            <a href={`mailto:${client.email}`} className="inline-flex h-9 items-center gap-1.5 rounded-control border border-line bg-surface px-3 text-[13px] font-semibold text-ink hover:border-ink-muted focus-ring">
              <Mail className="size-4" aria-hidden="true" /> Email
            </a>
          ) : null}
        </div>
      </div>

      <div className="mt-6">
        <JourneyTracker stage={client.stage} compact />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="flex flex-col gap-6 lg:col-span-7">
          <ClientWorkbench client={client} quotes={quotes.filter((q) => q.stage !== 'placed' && q.stage !== 'declined')} claims={claims} />
          <PolicyList policies={policies} heading="Policies" />
          <QuoteList quotes={quotes} heading="Quotes" />
          <ClaimList claims={claims} heading="Claims" />
        </div>
        <div className="flex flex-col gap-6 lg:col-span-5">
          <Card as="section" flush>
            <div className="px-5 pb-3 pt-5">
              <CardHeader title="Open tasks" description={tasks.length ? `${tasks.length} on the queue` : 'Nothing outstanding'} />
            </div>
            {tasks.length ? (
              <ul className="divide-y divide-divider border-t border-line">
                {tasks.map((t) => (
                  <li key={t.id} className="px-5 py-3">
                    <p className="text-[13px] font-semibold text-ink">{t.action.label} · {t.product}</p>
                    <p className="text-[12.5px] text-ink-muted">{t.summary}</p>
                    <p className="mt-1 text-[11.5px] font-semibold text-ink-faint">{t.timing}</p>
                  </li>
                ))}
              </ul>
            ) : null}
          </Card>
          <Card as="section" flush>
            <div className="px-5 pb-3 pt-5">
              <CardHeader title="History" />
            </div>
            {activity.length ? (
              <ol className="divide-y divide-divider border-t border-line">
                {activity.map((a) => (
                  <li key={a.id} className="flex items-baseline justify-between gap-3 px-5 py-2.5">
                    <span className="text-[13px] text-ink">{a.title}</span>
                    <time dateTime={a.at} className="shrink-0 font-mono text-[11px] text-ink-faint">{relativeTime(a.at)}</time>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="border-t border-line px-5 py-4 text-[13px] text-ink-muted">No interactions recorded yet.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

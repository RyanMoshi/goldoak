import type { Metadata } from 'next'
import { CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { Bot, FolderOpen, ListChecks } from 'lucide-react'
import { ClaimList } from '@/components/platform/portal/ClaimList'
import { DocumentsCard } from '@/components/platform/portal/DocumentsCard'
import { JourneyTracker } from '@/components/platform/portal/JourneyTracker'
import { PolicyList } from '@/components/platform/portal/PolicyList'
import { PortalActions } from '@/components/platform/portal/PortalActions'
import { QuoteList } from '@/components/platform/portal/QuoteList'
import { UpdatesFeed } from '@/components/platform/portal/UpdatesFeed'
import { WhatsAppCard } from '@/components/platform/portal/WhatsAppCard'
import { requireSession } from '@/lib/auth/server'
import { greetingFor } from '@/lib/format'
import { getPortalData } from '@/services/portal'
import { JOURNEY_STAGES } from '@/types/platform'

export const metadata: Metadata = { title: 'My insurance' }

export default async function PortalPage({ searchParams }: { searchParams: { welcome?: string } }) {
  const session = await requireSession('client')
  const data = await getPortalData(session.uid)
  const firstName = session.name.split(' ')[0]
  const welcome = searchParams.welcome === '1'

  if (!data) return <p className="text-ink-muted">We could not load your account. Please sign in again.</p>

  const { client, organization, policies, quotes, claims, user, notifications } = data
  const stage = client ? JOURNEY_STAGES.find((s) => s.id === client.stage) : null
  const stageIndex = client ? JOURNEY_STAGES.findIndex((s) => s.id === client.stage) : -1

  return (
    <div className="animate-fade-up space-y-6">
      {welcome ? (
        <div role="status" className="flex items-start gap-3 rounded-card border border-success/25 bg-success/10 p-4 text-[14px] text-ink">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" aria-hidden="true" />
          <span>
            <span className="font-semibold">Your account is ready, {firstName}.</span> Your adviser will be in touch within one working day. Everything that happens from here shows up below and on WhatsApp.
          </span>
        </div>
      ) : null}

      <div>
        <p className="label-caps flex items-center gap-2 text-gold-700">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-gold" />
          {client ? client.name : 'Your account'}
        </p>
        <h1 className="mt-2 font-serif text-[28px] font-medium leading-9 text-forest sm:text-[34px] sm:leading-[2.75rem]">
          {greetingFor(new Date())}, {firstName}.
        </h1>
        <p className="mt-1 text-[15px] text-ink-muted">
          {stage ? (
            <>
              You are at stage {stageIndex + 1} of 6, <span className="font-semibold text-ink">{stage.label}</span>. {stage.description}
            </>
          ) : (
            'Your risk review has not started yet. Your adviser will reach out shortly.'
          )}
        </p>
      </div>

      <JourneyTracker stage={client?.stage ?? 'understand'} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="flex flex-col gap-6 lg:col-span-8">
          <PortalActions policies={policies} hasClient={Boolean(client)} />
          <PolicyList policies={policies} />
          <QuoteList quotes={quotes} />
          <ClaimList claims={claims} />
        </div>
        <div className="flex flex-col gap-6 lg:col-span-4">
          <WhatsAppCard organization={organization} adviserName={client?.adviserName ?? null} phoneLinked={Boolean(user.phone)} />
          <Link href="/portal/ask" className="flex items-center gap-3 rounded-card border border-line bg-surface p-4 transition-colors hover:border-forest focus-ring">
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-forest text-gold">
              <Bot className="size-5" aria-hidden="true" strokeWidth={1.75} />
            </span>
            <span className="min-w-0">
              <span className="block text-[14px] font-bold text-ink">Ask the assistant</span>
              <span className="block text-[12.5px] text-ink-muted">Insurance questions, answered with your own cover in mind.</span>
            </span>
          </Link>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/portal/documents" className="flex flex-col gap-2 rounded-card border border-line bg-surface p-4 transition-colors hover:border-forest focus-ring">
              <span className="inline-flex size-9 items-center justify-center rounded-full bg-gold/15 text-gold-700">
                <FolderOpen className="size-4" aria-hidden="true" strokeWidth={1.75} />
              </span>
              <span className="text-[13.5px] font-bold text-ink">My documents</span>
              <span className="text-[12px] text-ink-muted">Upload, read, confirm.</span>
            </Link>
            <Link href="/portal/requests" className="flex flex-col gap-2 rounded-card border border-line bg-surface p-4 transition-colors hover:border-forest focus-ring">
              <span className="inline-flex size-9 items-center justify-center rounded-full bg-info/10 text-info">
                <ListChecks className="size-4" aria-hidden="true" strokeWidth={1.75} />
              </span>
              <span className="text-[13.5px] font-bold text-ink">Requests</span>
              <span className="text-[12px] text-ink-muted">Claim a business, enquire, track.</span>
            </Link>
          </div>
          <UpdatesFeed items={notifications} />
          <DocumentsCard hasClient={Boolean(client)} quotes={quotes} claims={claims} />
        </div>
      </div>
    </div>
  )
}

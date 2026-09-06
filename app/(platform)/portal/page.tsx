import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { ClaimList } from '@/components/platform/portal/ClaimList'
import { JourneyTracker } from '@/components/platform/portal/JourneyTracker'
import { PolicyList } from '@/components/platform/portal/PolicyList'
import { QuoteList } from '@/components/platform/portal/QuoteList'
import { WhatsAppCard } from '@/components/platform/portal/WhatsAppCard'
import { Card } from '@/components/platform/ui/Card'
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

  if (!data) {
    return <p className="text-ink-muted">We could not load your account. Please sign in again.</p>
  }

  const { client, organization, policies, quotes, claims, user } = data
  const stage = client ? JOURNEY_STAGES.find((s) => s.id === client.stage) : null
  const stageIndex = client ? JOURNEY_STAGES.findIndex((s) => s.id === client.stage) : -1

  return (
    <div className="animate-fade-up space-y-6">
      {welcome ? (
        <div role="status" className="flex items-start gap-3 rounded-card border border-success/25 bg-success/10 p-4 text-[14px] text-ink">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" aria-hidden="true" />
          <span>
            <span className="font-semibold">Your account is ready, {firstName}.</span> Your adviser will be in touch within one working day to start your risk review. Everything that happens after that shows up here.
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

      {!client ? (
        <Card>
          <p className="font-serif text-[18px] font-semibold text-forest">Want to get started sooner?</p>
          <p className="mt-1 text-[14px] text-ink-muted">Tell us what you own, what you run and who depends on you, and we will come back with the options worth considering.</p>
          <Link href="/contact" className="mt-4 inline-flex h-10 items-center gap-2 rounded-control bg-forest px-4 text-sm font-semibold text-white hover:bg-forest-700 focus-ring">
            Start a risk review <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="flex flex-col gap-6 lg:col-span-8">
          <PolicyList policies={policies} />
          <QuoteList quotes={quotes} />
          <ClaimList claims={claims} />
        </div>
        <div className="lg:col-span-4">
          <WhatsAppCard organization={organization} adviserName={client?.adviserName ?? null} phoneLinked={Boolean(user.phone)} />
        </div>
      </div>
    </div>
  )
}

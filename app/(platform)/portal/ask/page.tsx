import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { AskAssistant } from '@/components/platform/portal/AskAssistant'
import { requireSession } from '@/lib/auth/server'
import { aiConfigured } from '@/services/consult'
import { getOrganization } from '@/services/users'
import { awaitingAnswer, listWebMessages } from '@/services/webchat'

export const metadata: Metadata = { title: 'Ask the assistant' }
export const dynamic = 'force-dynamic'

export default async function AskPage() {
  const session = await requireSession('client')
  const [messages, organization] = await Promise.all([listWebMessages(session.uid, session.oid), getOrganization(session.oid)])
  const agencyName = organization?.shortName ?? 'your'
  return (
    <div className="animate-fade-up space-y-4">
      <div>
        <Link href="/portal" className="inline-flex min-h-[36px] items-center gap-1.5 text-[13px] font-semibold text-ink-muted hover:text-ink focus-ring rounded-control">
          <ArrowLeft className="size-4" aria-hidden="true" /> My insurance
        </Link>
        <h1 className="mt-2 font-serif text-[24px] font-medium leading-8 text-forest sm:text-[32px] sm:leading-10">Ask the {agencyName} assistant</h1>
        <p className="mt-1 text-[14px] text-ink-muted">{aiConfigured() ? 'Answers use your own cover and general insurance knowledge. ' : 'Answers come from the product catalogue. '}Your conversation is saved; come back any time.</p>
      </div>
      <AskAssistant initialMessages={messages} initialPending={awaitingAnswer(messages)} agencyName={agencyName} />
    </div>
  )
}

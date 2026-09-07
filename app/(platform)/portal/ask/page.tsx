import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { AskAssistant } from '@/components/platform/portal/AskAssistant'
import { requireSession } from '@/lib/auth/server'
import { aiConfigured, listConsultationsForUser } from '@/services/consult'
import { getOrganization } from '@/services/users'

export const metadata: Metadata = { title: 'Ask the assistant' }
export const dynamic = 'force-dynamic'

export default async function AskPage() {
  const session = await requireSession('client')
  const [history, organization] = await Promise.all([listConsultationsForUser(session.uid, 20), getOrganization(session.oid)])
  const agencyName = organization?.shortName ?? 'your'
  return (
    <div className="animate-fade-up space-y-5">
      <div>
        <Link href="/portal" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-muted hover:text-ink focus-ring rounded-control">
          <ArrowLeft className="size-4" aria-hidden="true" /> My insurance
        </Link>
        <h1 className="mt-3 font-serif text-[28px] font-medium leading-9 text-forest sm:text-[34px] sm:leading-[2.75rem]">Ask the {agencyName} assistant</h1>
        <p className="mt-1 text-[15px] text-ink-muted">{aiConfigured() ? 'Answers use your own cover and the product catalogue. ' : 'Answers come from the product catalogue. '}The same assistant answers on WhatsApp (reply 3, then 2).</p>
      </div>
      <AskAssistant history={history} agencyName={agencyName} />
    </div>
  )
}

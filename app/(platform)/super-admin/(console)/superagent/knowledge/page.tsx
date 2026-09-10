import type { Metadata } from 'next'
import { Card } from '@/components/platform/ui/Card'
import { GlobalPolicyForm } from '@/components/platform/superagent/GlobalPolicyForm'
import { requireSession } from '@/lib/auth/server'
import { getGlobalPolicy } from '@/services/ai-insights'

export const metadata: Metadata = { title: 'Global knowledge' }
export const dynamic = 'force-dynamic'

export default async function SuperAgentKnowledgePage() {
  await requireSession('admin')
  const policy = await getGlobalPolicy()
  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <p className="label-caps flex items-center gap-2 text-gold-700">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-gold" />
          Super Agent
        </p>
        <h1 className="mt-2 font-serif text-[26px] font-medium leading-8 text-forest sm:text-[32px] sm:leading-10">Global knowledge and policy</h1>
        <p className="mt-1 max-w-prose text-[14.5px] text-ink-muted">The layer every agency shares. Agency-specific products, tone and escalation rules live in each agency&rsquo;s own assistant settings and are never visible here or to another tenant.</p>
      </div>
      <Card className="border-info/25 bg-info/5">
        <p className="text-[13.5px] leading-6 text-ink">
          <strong>How the prompt is assembled:</strong> the agency layer (who the assistant is speaking for) comes first, then the built-in safety rules, then anything you write here, then the neutral product catalogue, then the person&rsquo;s own records. Nothing from one agency ever enters another agency&rsquo;s prompt.
        </p>
      </Card>
      <GlobalPolicyForm policy={policy} />
    </div>
  )
}

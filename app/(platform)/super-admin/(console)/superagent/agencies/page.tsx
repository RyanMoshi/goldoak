import type { Metadata } from 'next'
import { Building2 } from 'lucide-react'
import { Badge } from '@/components/platform/ui/Badge'
import { Card } from '@/components/platform/ui/Card'
import { EmptyState } from '@/components/platform/ui/EmptyState'
import { requireSession } from '@/lib/auth/server'
import { relativeTime } from '@/lib/format'
import { agencyAiUsage } from '@/services/ai-insights'

export const metadata: Metadata = { title: 'Agencies using Super Agent' }
export const dynamic = 'force-dynamic'

/** Which agencies use the assistant, how much, and how well they have set it up. */
export default async function SuperAgentAgenciesPage() {
  await requireSession('admin')
  const agencies = await agencyAiUsage()

  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <p className="label-caps flex items-center gap-2 text-gold-700">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-gold" />
          Super Agent
        </p>
        <h1 className="mt-2 font-serif text-[26px] font-medium leading-8 text-forest sm:text-[32px] sm:leading-10">Agencies using Super Agent</h1>
        <p className="mt-1 max-w-prose text-[14.5px] text-ink-muted">Usage and configuration only. The conversations themselves stay inside each agency; nothing a client said is shown here.</p>
      </div>

      {agencies.length === 0 ? (
        <Card flush>
          <EmptyState icon={Building2} title="No agencies yet" description="Agencies appear here as soon as they are created." />
        </Card>
      ) : (
        <>
          <ul className="grid grid-cols-[minmax(0,1fr)] gap-3 lg:hidden">
            {agencies.map((a) => (
              <li key={a.organizationId} className="rounded-card border border-line bg-surface p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="min-w-0 truncate text-[14.5px] font-bold text-ink">{a.name}</p>
                  <Badge tone={a.status === 'active' ? 'success' : a.status === 'pending' ? 'gold' : 'neutral'} dot>
                    {a.status}
                  </Badge>
                </div>
                <p className="mt-1 text-[12.5px] text-ink-muted">{a.assistantName ? `“${a.assistantName}”` : 'Default assistant name'}</p>
                <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <Stat label="7 days" value={a.answers7d} />
                  <Stat label="30 days" value={a.answers30d} />
                  <Stat label="Escalated" value={a.escalations7d} />
                </dl>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <Badge tone={a.hasKnowledge ? 'success' : 'neutral'}>{a.hasKnowledge ? 'Knowledge set' : 'No knowledge'}</Badge>
                  <Badge tone={a.channelConnected ? 'success' : 'neutral'}>{a.channelConnected ? 'Own WhatsApp' : 'Shared number'}</Badge>
                </div>
              </li>
            ))}
          </ul>

          <Card flush className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[860px] border-collapse text-[13.5px]">
              <thead>
                <tr className="border-b border-line bg-surface-3 text-left">
                  <th className="px-4 py-2.5 font-semibold text-ink-muted">Agency</th>
                  <th className="px-4 py-2.5 font-semibold text-ink-muted">Assistant</th>
                  <th className="px-4 py-2.5 text-right font-semibold text-ink-muted">7 days</th>
                  <th className="px-4 py-2.5 text-right font-semibold text-ink-muted">30 days</th>
                  <th className="px-4 py-2.5 text-right font-semibold text-ink-muted">To a person</th>
                  <th className="px-4 py-2.5 text-right font-semibold text-ink-muted">Failed</th>
                  <th className="px-4 py-2.5 font-semibold text-ink-muted">Setup</th>
                  <th className="px-4 py-2.5 font-semibold text-ink-muted">Last used</th>
                </tr>
              </thead>
              <tbody>
                {agencies.map((a) => (
                  <tr key={a.organizationId} className="border-b border-divider last:border-b-0 hover:bg-surface-3">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-ink">{a.name}</p>
                      <p className="text-[11.5px] text-ink-faint">{a.status}</p>
                    </td>
                    <td className="px-4 py-3 text-ink-muted">{a.assistantName ?? 'Super Agent'}</td>
                    <td data-numeric className="px-4 py-3 text-right font-bold text-ink">
                      {a.answers7d}
                    </td>
                    <td data-numeric className="px-4 py-3 text-right text-ink-muted">
                      {a.answers30d}
                    </td>
                    <td data-numeric className="px-4 py-3 text-right text-ink-muted">
                      {a.escalations7d}
                    </td>
                    <td data-numeric className={`px-4 py-3 text-right ${a.failures7d ? 'font-semibold text-error' : 'text-ink-muted'}`}>
                      {a.failures7d}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        <Badge tone={a.hasKnowledge ? 'success' : 'neutral'}>{a.hasKnowledge ? 'Knowledge' : 'No knowledge'}</Badge>
                        <Badge tone={a.channelConnected ? 'success' : 'neutral'}>{a.channelConnected ? 'Own number' : 'Shared'}</Badge>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink-muted">{a.lastUsed ? relativeTime(a.lastUsed) : 'never'}</td>
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

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-control bg-surface-3 py-2">
      <dt className="text-[10.5px] font-bold uppercase tracking-[0.06em] text-ink-faint">{label}</dt>
      <dd data-numeric className="text-[15px] font-bold text-forest">
        {value}
      </dd>
    </div>
  )
}

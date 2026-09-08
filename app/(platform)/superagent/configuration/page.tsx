import type { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardHeader } from '@/components/platform/ui/Card'
import { Badge } from '@/components/platform/ui/Badge'
import { requireSession } from '@/lib/auth/server'
import { aiConfigured, aiModelLabel, aiVendor } from '@/lib/ai/provider'
import { whatsappConfigured } from '@/lib/whatsapp/provider'
import { emailConfigured } from '@/lib/email'
import { aiOverview } from '@/services/ai-insights'

export const metadata: Metadata = { title: 'AI configuration' }
export const dynamic = 'force-dynamic'

/**
 * What the assistant is wired to, and where each setting is changed. Values
 * come from the environment; nothing secret is ever rendered — only whether a
 * key is present.
 */
export default async function SuperAgentConfigurationPage() {
  await requireSession('admin')
  const overview = await aiOverview()
  const fallbacks = (process.env.AI_FALLBACK_MODELS ?? 'nvidia/nemotron-3.5-lightning-30b-a3b').split(',').map((m) => m.trim()).filter(Boolean)

  const rows: { label: string; value: string; ok: boolean; note: string }[] = [
    { label: 'Vendor', value: aiVendor(), ok: aiConfigured(), note: aiConfigured() ? 'Set by ANTHROPIC_API_KEY or NVIDIA_API_KEY.' : 'No key configured: the assistant falls back to catalogue answers.' },
    { label: 'Primary chat model', value: aiModelLabel(), ok: aiConfigured(), note: 'AI_MODEL' },
    { label: 'Fallback models', value: fallbacks.join(', ') || 'none', ok: fallbacks.length > 0, note: 'AI_FALLBACK_MODELS — tried in order when the primary is busy.' },
    { label: 'Vision model', value: process.env.AI_VISION_MODEL ?? 'meta/llama-3.2-11b-vision-instruct', ok: true, note: 'AI_VISION_MODEL — reads photographs of documents.' },
    { label: 'OCR model', value: process.env.AI_OCR_MODEL ?? 'nvidia/nemotron-parse', ok: true, note: 'AI_OCR_MODEL — turns a scan into text.' },
    { label: 'WhatsApp gateway', value: whatsappConfigured() ? 'connected' : 'not configured', ok: whatsappConfigured(), note: 'OPENWA_BASE_URL and its key.' },
    { label: 'Email', value: emailConfigured() ? 'configured' : 'not configured', ok: emailConfigured(), note: 'SMTP_HOST, SMTP_USER, SMTP_PASS.' },
  ]

  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <p className="label-caps flex items-center gap-2 text-gold-700">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-gold" />
          Super Agent
        </p>
        <h1 className="mt-2 font-serif text-[26px] font-medium leading-8 text-forest sm:text-[32px] sm:leading-10">Configuration</h1>
        <p className="mt-1 max-w-prose text-[14.5px] text-ink-muted">What the assistant is running on. Models and keys are environment settings, so changing one is a deployment change, not a click.</p>
      </div>

      <Card as="section" flush>
        <div className="p-5 pb-3">
          <CardHeader title="Engine" description="Read-only: these come from the deployment environment." />
        </div>
        <ul className="divide-y divide-divider border-t border-line">
          {rows.map((r) => (
            <li key={r.label} className="flex flex-col gap-1 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-[13.5px] font-semibold text-ink">{r.label}</p>
                <p className="text-[12px] text-ink-faint">{r.note}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="min-w-0 truncate font-mono text-[12px] text-ink-muted">{r.value}</span>
                <Badge tone={r.ok ? 'success' : 'error'} dot>
                  {r.ok ? 'ok' : 'missing'}
                </Badge>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card as="section">
          <CardHeader title="Where each setting lives" />
          <ul className="mt-4 space-y-3 text-[13.5px] leading-6 text-ink">
            <li>
              <strong>Platform rules and shared knowledge</strong> — <Link href="/superagent/knowledge" className="text-forest underline focus-ring">Global knowledge</Link>. Applies to every agency.
            </li>
            <li>
              <strong>An agency&rsquo;s products, tone and escalation</strong> — that agency&rsquo;s own <span className="font-mono text-[12.5px]">/agency/ai</span> page. Only its own staff can see or change it.
            </li>
            <li>
              <strong>Which number an agency answers on</strong> — that agency&rsquo;s <span className="font-mono text-[12.5px]">/agency/whatsapp</span> page, or the shared line.
            </li>
            <li>
              <strong>Models and keys</strong> — environment variables on the deployment.
            </li>
          </ul>
        </Card>

        <Card as="section">
          <CardHeader title="Behaviour in the last 7 days" />
          <ul className="mt-4 space-y-2 text-[13.5px]">
            {overview.byChannel.map((c) => (
              <li key={c.channel} className="flex items-center justify-between gap-3">
                <span className="text-ink-muted">{c.channel === 'web' ? 'Web chat' : c.channel === 'whatsapp' ? 'WhatsApp' : c.channel}</span>
                <span data-numeric className="font-bold text-ink">
                  {c.count}
                </span>
              </li>
            ))}
            {overview.byChannel.length === 0 ? <li className="text-ink-muted">No answers recorded yet.</li> : null}
          </ul>
        </Card>
      </div>
    </div>
  )
}

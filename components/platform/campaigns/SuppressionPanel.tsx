'use client'

import { ShieldOff, Undo2 } from 'lucide-react'
import { useState, useTransition } from 'react'
import { Card, CardHeader } from '@/components/platform/ui/Card'
import { Select, SubmitButton, TextInput } from '@/components/platform/ui/Form'
import { StatusLine } from '@/components/platform/ui/PageHeader'
import { suppressAction, unsuppressAction, type CampaignState } from '@/lib/campaigns/actions'

/**
 * The do-not-contact list. Anyone here is skipped by every campaign, on top of
 * the marketing preference each client controls from their own profile.
 */
export function SuppressionPanel({ entries }: { entries: { channel: string; address: string; reason: string | null; createdAt: string }[] }) {
  const [state, setState] = useState<CampaignState>({})
  const [pending, startTransition] = useTransition()

  return (
    <Card as="section">
      <CardHeader title="Do not contact" description="Addresses and numbers that never receive a campaign. Clients can also switch off marketing themselves in their profile." />
      <form action={(fd) => startTransition(async () => setState(await suppressAction(fd)))} className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end">
        <TextInput label="Email or number" name="address" required placeholder="someone@example.com" wrapperClassName="flex-1" error={state.field === 'address' ? state.error : undefined} />
        <Select label="Channel" name="channel" defaultValue="email" wrapperClassName="sm:w-40">
          <option value="email">Email</option>
          <option value="whatsapp">WhatsApp</option>
        </Select>
        <SubmitButton pending={pending} pendingLabel="Adding…" variant="secondary" className="min-w-0">
          <ShieldOff className="size-4" aria-hidden="true" /> Add
        </SubmitButton>
      </form>
      <StatusLine success={state.success} error={!state.field ? state.error : undefined} onDismiss={() => setState({})} />

      {entries.length ? (
        <ul className="mt-4 divide-y divide-divider border-t border-line">
          {entries.map((e) => (
            <li key={`${e.channel}:${e.address}`} className="flex items-center justify-between gap-3 py-2.5">
              <div className="min-w-0">
                <p className="truncate font-mono text-[12.5px] text-ink">{e.address}</p>
                <p className="text-[11.5px] text-ink-faint">
                  {e.channel} · {e.reason ?? 'no reason recorded'}
                </p>
              </div>
              <form action={(fd) => startTransition(async () => setState(await unsuppressAction(fd)))}>
                <input type="hidden" name="address" value={e.address} />
                <input type="hidden" name="channel" value={e.channel} />
                <button type="submit" disabled={pending} className="inline-flex h-8 items-center gap-1.5 rounded-control border border-line bg-surface px-2.5 text-[12.5px] font-semibold text-ink-muted hover:border-ink-muted hover:text-ink focus-ring disabled:opacity-60">
                  <Undo2 className="size-3.5" aria-hidden="true" /> Remove
                </button>
              </form>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-[13px] text-ink-muted">Nobody is suppressed. Anyone who asks to stop hearing from you should be added here.</p>
      )}
    </Card>
  )
}

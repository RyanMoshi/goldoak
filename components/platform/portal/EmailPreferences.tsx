'use client'

import { Loader2 } from 'lucide-react'
import { useState, useTransition } from 'react'
import { Card, CardHeader } from '@/components/platform/ui/Card'
import { StatusLine } from '@/components/platform/ui/PageHeader'
import { updateEmailPreferencesAction, type EmailActionState } from '@/lib/emails/actions'

const OPTIONS: { key: 'reminders' | 'updates' | 'marketing'; label: string; hint: string }[] = [
  { key: 'reminders', label: 'Reminders', hint: 'Renewals, payments and appointments.' },
  { key: 'updates', label: 'Updates', hint: 'Claim progress, documents received, replies from your adviser.' },
  { key: 'marketing', label: 'News and offers', hint: 'Occasional product news from your agency.' },
]

/** Non-critical categories only. Security, verification and account emails are always sent. */
export function EmailPreferences({ prefs }: { prefs: Record<string, boolean> }) {
  const [state, setState] = useState<EmailActionState>({})
  const [pending, startTransition] = useTransition()
  return (
    <Card as="section">
      <CardHeader title="Email preferences" description="Choose which non-essential emails you get. Security codes, password changes and account notices are always sent." />
      <form action={(fd) => startTransition(async () => setState(await updateEmailPreferencesAction(fd)))} className="mt-4 space-y-3">
        {OPTIONS.map((o) => (
          <label key={o.key} className="flex min-h-[48px] items-start gap-3 rounded-card border border-line bg-surface-3 p-3 text-[13.5px] text-ink">
            <input type="checkbox" name={o.key} defaultChecked={prefs[o.key] !== false} className="mt-0.5 size-4 accent-forest" />
            <span>
              <span className="font-semibold">{o.label}</span>
              <span className="block text-ink-muted">{o.hint}</span>
            </span>
          </label>
        ))}
        <button type="submit" disabled={pending} className="inline-flex h-11 items-center justify-center gap-2 rounded-control bg-forest px-5 text-[14px] font-semibold text-white hover:bg-forest-700 disabled:opacity-60 focus-ring">
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
          {pending ? 'Saving…' : 'Save preferences'}
        </button>
      </form>
      <StatusLine success={state.success} error={state.error} onDismiss={() => setState({})} />
    </Card>
  )
}

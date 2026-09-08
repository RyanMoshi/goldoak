'use client'

import { Loader2, Send } from 'lucide-react'
import { useState, useTransition } from 'react'
import { inputClass } from '@/components/platform/auth/AuthShell'
import { Card } from '@/components/platform/ui/Card'
import { StatusLine } from '@/components/platform/ui/PageHeader'
import { TEMPLATES } from '@/lib/email/templates'
import { sendTestEmailAction, type EmailActionState } from '@/lib/emails/actions'

const KEYS = Object.values(TEMPLATES).map((t) => ({ key: t.key, label: t.label }))

/** Send any template to an address with sample data, in this agency's branding. */
export function SendTestEmail({ scope }: { scope: 'agency' | 'global' }) {
  const [state, setState] = useState<EmailActionState>({})
  const [pending, startTransition] = useTransition()
  return (
    <Card as="section" className="p-4">
      <form action={(fd) => startTransition(async () => setState(await sendTestEmailAction(fd)))} className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <input type="hidden" name="scope" value={scope} />
        <label className="flex-1 text-[12.5px] font-semibold text-ink-muted">
          Send a test email to
          <input name="to" type="email" required className={`${inputClass} mt-1`} placeholder="you@example.com" />
        </label>
        <label className="text-[12.5px] font-semibold text-ink-muted sm:w-56">
          Template
          <select name="key" className={`${inputClass} mt-1`} defaultValue="welcome">
            {KEYS.map((k) => (
              <option key={k.key} value={k.key}>
                {k.label}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" disabled={pending} className="inline-flex h-11 items-center justify-center gap-2 rounded-control bg-forest px-4 text-[13.5px] font-semibold text-white hover:bg-forest-700 disabled:opacity-60 focus-ring">
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Send className="size-4" aria-hidden="true" />}
          {pending ? 'Sending…' : 'Send test'}
        </button>
      </form>
      <StatusLine success={state.success} error={state.error} onDismiss={() => setState({})} />
    </Card>
  )
}

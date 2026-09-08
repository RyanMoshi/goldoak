'use client'

import { Loader2, Palette } from 'lucide-react'
import { useState, useTransition } from 'react'
import { Field, inputClass } from '@/components/platform/auth/AuthShell'
import { Card, CardHeader } from '@/components/platform/ui/Card'
import { StatusLine } from '@/components/platform/ui/PageHeader'
import { updateBrandingAction, type ActionState } from '@/lib/agency/actions'

interface Props {
  branding: Record<string, string>
  reminderDays: number[]
  canEdit: boolean
  defaults: { primary: string; accent: string }
}

/** Colours, logo and contact details used on emails and documents, plus the reminder schedule. */
export function BrandingForm({ branding, reminderDays, canEdit, defaults }: Props) {
  const [state, setState] = useState<ActionState>({})
  const [pending, startTransition] = useTransition()
  const [primary, setPrimary] = useState(branding.primary || defaults.primary)
  const [accent, setAccent] = useState(branding.accent || defaults.accent)

  function submit(formData: FormData) {
    setState({})
    startTransition(async () => setState(await updateBrandingAction(formData)))
  }

  return (
    <Card as="section">
      <CardHeader title="Branding and reminders" description="Used on every email and PDF your clients receive. Leave colours blank for the platform default." />
      <form action={submit} className="mt-5 space-y-4" noValidate>
        <fieldset disabled={!canEdit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Primary colour" htmlFor="br-primary" hint="Header background.">
              <div className="flex items-center gap-2">
                <input type="color" aria-label="Pick primary colour" value={primary} onChange={(e) => setPrimary(e.target.value)} className="size-10 shrink-0 cursor-pointer rounded-control border border-line bg-surface p-0.5" />
                <input id="br-primary" name="primary" value={primary} onChange={(e) => setPrimary(e.target.value)} className={`${inputClass} font-mono`} placeholder={defaults.primary} />
              </div>
            </Field>
            <Field label="Accent colour" htmlFor="br-accent" hint="Buttons and highlights.">
              <div className="flex items-center gap-2">
                <input type="color" aria-label="Pick accent colour" value={accent} onChange={(e) => setAccent(e.target.value)} className="size-10 shrink-0 cursor-pointer rounded-control border border-line bg-surface p-0.5" />
                <input id="br-accent" name="accent" value={accent} onChange={(e) => setAccent(e.target.value)} className={`${inputClass} font-mono`} placeholder={defaults.accent} />
              </div>
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Logo URL" htmlFor="br-logo" hint="A public https link to a square PNG (at least 88×88).">
              <input id="br-logo" name="logoUrl" type="url" defaultValue={branding.logoUrl ?? ''} className={inputClass} placeholder="https://…/logo.png" />
            </Field>
            <Field label="Website" htmlFor="br-web">
              <input id="br-web" name="website" type="url" defaultValue={branding.website ?? ''} className={inputClass} placeholder="https://youragency.co.ke" />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Support email" htmlFor="br-email" hint="Replies to your emails go here.">
              <input id="br-email" name="supportEmail" type="email" defaultValue={branding.supportEmail ?? ''} className={inputClass} />
            </Field>
            <Field label="Support phone" htmlFor="br-phone">
              <input id="br-phone" name="supportPhone" type="tel" defaultValue={branding.supportPhone ?? ''} className={inputClass} />
            </Field>
          </div>
          <Field label="Email footer note" htmlFor="br-footer" hint="One sentence shown at the bottom of every email.">
            <input id="br-footer" name="footerNote" defaultValue={branding.footerNote ?? ''} maxLength={300} className={inputClass} placeholder="You are receiving this because you have an account with us." />
          </Field>
          <Field label="Renewal reminder days" htmlFor="br-days" hint="Days before expiry, comma separated. Reminders go by WhatsApp, email and the portal.">
            <input id="br-days" name="reminderDays" defaultValue={reminderDays.join(', ')} className={`${inputClass} font-mono`} placeholder="30, 14, 7, 1" />
          </Field>
        </fieldset>
        <div className="flex flex-wrap items-center gap-3">
          {canEdit ? (
            <button type="submit" disabled={pending} className="inline-flex h-11 items-center justify-center gap-2 rounded-control bg-forest px-5 text-[14px] font-semibold text-white hover:bg-forest-700 disabled:opacity-60 focus-ring">
              {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Palette className="size-4" aria-hidden="true" />}
              {pending ? 'Saving…' : 'Save branding'}
            </button>
          ) : null}
          <a href="/api/emails/preview?key=welcome" target="_blank" rel="noopener" className="inline-flex h-11 items-center rounded-control border border-line px-4 text-[13.5px] font-semibold text-ink hover:border-ink-muted focus-ring">
            Preview an email
          </a>
        </div>
      </form>
      <StatusLine success={state.success} error={state.error} onDismiss={() => setState({})} />
    </Card>
  )
}

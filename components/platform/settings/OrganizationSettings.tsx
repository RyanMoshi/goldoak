'use client'

import { Copy, MessageCircle, Save } from 'lucide-react'
import { useState, useTransition } from 'react'
import { Field, inputClass } from '@/components/platform/auth/AuthShell'
import { Card, CardHeader } from '@/components/platform/ui/Card'
import { StatusLine } from '@/components/platform/ui/PageHeader'
import { updateOrganizationSettingsAction, type ActionState } from '@/lib/agency/actions'
import type { Organization } from '@/types/platform'

interface Props {
  organization: Organization
  botNumber: string | null
  canEdit: boolean
  siteUrl: string
}

/** Agency profile, the WhatsApp join code and onboarding link, and the greeting the assistant uses. */
export function OrganizationSettings({ organization, botNumber, canEdit, siteUrl }: Props) {
  const [state, setState] = useState<ActionState>({})
  const [pending, startTransition] = useTransition()
  const [copied, setCopied] = useState<string | null>(null)
  const code = organization.code ?? '—'
  const joinLink = botNumber ? `https://wa.me/${botNumber}?text=${encodeURIComponent(`JOIN ${code}`)}` : null
  const signupLink = `${siteUrl}/signup?agency=${encodeURIComponent(code)}`

  function submit(formData: FormData) {
    setState({})
    startTransition(async () => setState(await updateOrganizationSettingsAction(formData)))
  }

  async function copy(label: string, value: string) {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(label)
      setTimeout(() => setCopied(null), 1500)
    } catch {
      setCopied(null)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <Card as="section" className="lg:col-span-7">
        <CardHeader title="Agency profile" description={canEdit ? 'What clients see in messages, documents and the portal.' : 'Only agency admins can change these.'} />
        <form action={submit} className="mt-5 space-y-4" noValidate>
          <fieldset disabled={!canEdit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Agency name" htmlFor="org-name">
                <input id="org-name" name="name" defaultValue={organization.name} required className={inputClass} />
              </Field>
              <Field label="Short name" htmlFor="org-short" hint="Used in WhatsApp messages.">
                <input id="org-short" name="shortName" defaultValue={organization.shortName} required className={inputClass} />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Phone" htmlFor="org-phone">
                <input id="org-phone" name="phone" defaultValue={organization.phone} className={inputClass} placeholder="+254 7xx xxx xxx" />
              </Field>
              <Field label="Email" htmlFor="org-email">
                <input id="org-email" name="email" type="email" defaultValue={organization.email} className={inputClass} />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="WhatsApp join code" htmlFor="org-code" hint="3 to 12 letters or digits. Clients send JOIN <code> to reach you.">
                <input id="org-code" name="code" defaultValue={organization.code ?? ''} className={`${inputClass} font-mono uppercase`} />
              </Field>
              <Field label="Licence label" htmlFor="org-licence" hint="Shown on documents, e.g. IRA licence no.">
                <input id="org-licence" name="licenceLabel" defaultValue={organization.licenceLabel ?? ''} className={inputClass} />
              </Field>
            </div>
            <Field label="WhatsApp greeting" htmlFor="org-greeting" hint="The first line a new contact sees. Leave blank for the standard welcome.">
              <textarea id="org-greeting" name="greeting" defaultValue={organization.greeting ?? ''} rows={3} maxLength={300} className={`${inputClass} min-h-[88px] resize-y py-2`} placeholder={`Welcome to ${organization.shortName}! I am your insurance assistant.`} />
            </Field>
          </fieldset>
          {canEdit ? (
            <button type="submit" disabled={pending} className="inline-flex h-11 items-center justify-center gap-2 rounded-control bg-forest px-5 text-[14px] font-semibold text-white hover:bg-forest-700 disabled:opacity-60 focus-ring">
              <Save className="size-4" aria-hidden="true" />
              {pending ? 'Saving…' : 'Save settings'}
            </button>
          ) : null}
        </form>
        <StatusLine success={state.success} error={state.error} onDismiss={() => setState({})} />
      </Card>

      <div className="space-y-6 lg:col-span-5">
        <Card as="section" className="border-forest bg-forest text-white">
          <p className="label-caps text-gold">Your WhatsApp front door</p>
          <p className="mt-1 font-serif text-[20px] font-semibold">Super Agent on WhatsApp{botNumber ? '' : ' (not connected)'}</p>
          <p className="mt-1 text-[13px] text-white/75">One number serves every agency. Anyone who opens this link, or sends your code, is routed to {organization.shortName} and nobody else.</p>
          <dl className="mt-4 space-y-3 text-[13px]">
            <div>
              <dt className="text-white/60">Join code</dt>
              <dd className="mt-0.5 flex items-center gap-2">
                <span className="font-mono text-[18px] font-bold text-gold">{code}</span>
                <CopyButton label="code" value={code} copied={copied} onCopy={copy} />
              </dd>
            </div>
            {joinLink ? (
              <div>
                <dt className="text-white/60">Onboarding link (put it on your website, posters, business cards)</dt>
                <dd className="mt-0.5 flex items-center gap-2">
                  <a href={joinLink} target="_blank" rel="noopener noreferrer" className="truncate font-mono text-[12px] text-white underline decoration-white/40 underline-offset-2">
                    {joinLink}
                  </a>
                  <CopyButton label="link" value={joinLink} copied={copied} onCopy={copy} />
                </dd>
              </div>
            ) : null}
            <div>
              <dt className="text-white/60">Website sign-up link for your clients</dt>
              <dd className="mt-0.5 flex items-center gap-2">
                <span className="truncate font-mono text-[12px] text-white">{signupLink}</span>
                <CopyButton label="signup" value={signupLink} copied={copied} onCopy={copy} />
              </dd>
            </div>
          </dl>
          {joinLink ? (
            <a href={joinLink} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex h-10 items-center gap-2 rounded-control bg-gold px-4 text-sm font-semibold text-white hover:bg-gold-500 focus-ring">
              <MessageCircle className="size-4" aria-hidden="true" /> Try it on WhatsApp
            </a>
          ) : null}
        </Card>

        <Card as="section">
          <CardHeader title="How routing works" level={3} />
          <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-[13px] text-ink-muted">
            <li>A registered client is always routed to the agency on their account.</li>
            <li>A new number that opens your link or sends your code is linked to you.</li>
            <li>A new number with no code is asked to choose an agency (only when more than one is live).</li>
            <li>The platform admin can re-route any unassigned chat.</li>
          </ol>
        </Card>
      </div>
    </div>
  )
}

function CopyButton({ label, value, copied, onCopy }: { label: string; value: string; copied: string | null; onCopy: (label: string, value: string) => void }) {
  return (
    <button type="button" onClick={() => onCopy(label, value)} className="inline-flex h-7 shrink-0 items-center gap-1 rounded-control border border-white/25 px-2 text-[11.5px] font-semibold text-white hover:bg-white/10 focus-ring" aria-label={`Copy ${label}`}>
      <Copy className="size-3.5" aria-hidden="true" /> {copied === label ? 'Copied' : 'Copy'}
    </button>
  )
}

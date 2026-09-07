'use client'

import { Building2, Power } from 'lucide-react'
import { useState, useTransition } from 'react'
import { Field, inputClass } from '@/components/platform/auth/AuthShell'
import { Badge } from '@/components/platform/ui/Badge'
import { Card, CardHeader } from '@/components/platform/ui/Card'
import { StatusLine } from '@/components/platform/ui/PageHeader'
import { createOrganizationAction, setOrganizationActiveAction, type AdminActionState } from '@/lib/admin/actions'
import type { OrganizationSummary } from '@/types/platform'

/** Super admin: create agencies (tenants) with their first admin, and switch them on or off. */
export function Organizations({ organizations, currentOrgId }: { organizations: OrganizationSummary[]; currentOrgId: string }) {
  const [state, setState] = useState<AdminActionState>({})
  const [pending, startTransition] = useTransition()
  const [formKey, setFormKey] = useState(0)

  function submit(formData: FormData) {
    setState({})
    startTransition(async () => {
      const result = await createOrganizationAction(formData)
      setState(result)
      if (result.success) setFormKey((k) => k + 1)
    })
  }

  function toggle(org: OrganizationSummary) {
    if (!window.confirm(`${org.active ? 'Deactivate' : 'Reactivate'} ${org.name}?`)) return
    startTransition(async () => setState(await setOrganizationActiveAction(org.id, !org.active)))
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <Card as="section" className="lg:col-span-5">
        <CardHeader title="Add an agency" description="Creates the agency and its first agency admin, who then invites their own team." />
        <form key={formKey} action={submit} className="mt-5 space-y-4" noValidate>
          <p className="label-caps text-ink-muted">Agency</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Agency name" htmlFor="org-name" error={state.field === 'name' ? state.error : undefined}>
              <input id="org-name" name="name" required className={inputClass} placeholder="Acme Insurance Agency" />
            </Field>
            <Field label="Short name" htmlFor="org-short">
              <input id="org-short" name="shortName" className={inputClass} placeholder="Acme" />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Join code" htmlFor="org-code" error={state.field === 'code' ? state.error : undefined} hint="Clients send JOIN <code> on WhatsApp.">
              <input id="org-code" name="code" required className={`${inputClass} font-mono uppercase`} placeholder="ACME" />
            </Field>
            <Field label="Contact phone" htmlFor="org-phone">
              <input id="org-phone" name="phone" className={inputClass} placeholder="+254 7xx xxx xxx" />
            </Field>
          </div>
          <Field label="Contact email" htmlFor="org-email" error={state.field === 'email' ? state.error : undefined}>
            <input id="org-email" name="email" type="email" required className={inputClass} placeholder="info@acme.co.ke" />
          </Field>
          <Field label="WhatsApp greeting" htmlFor="org-greeting" hint="Optional first line for new contacts.">
            <input id="org-greeting" name="greeting" className={inputClass} placeholder="Welcome to Acme. I am your insurance assistant." />
          </Field>
          <p className="label-caps pt-2 text-ink-muted">First agency admin</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" htmlFor="adm-name">
              <input id="adm-name" name="adminName" required className={inputClass} placeholder="Jane Otieno" />
            </Field>
            <Field label="Email (username)" htmlFor="adm-email">
              <input id="adm-email" name="adminEmail" type="email" required className={inputClass} placeholder="jane@acme.co.ke" />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="WhatsApp number" htmlFor="adm-phone" error={state.field === 'phone' ? state.error : undefined}>
              <input id="adm-phone" name="adminPhone" type="tel" className={inputClass} placeholder="0712 345 678" />
            </Field>
            <Field label="Password" htmlFor="adm-password" error={state.field === 'password' ? state.error : undefined} hint="Leave blank to generate one.">
              <input id="adm-password" name="adminPassword" type="text" autoComplete="off" className={inputClass} placeholder="Generate" />
            </Field>
          </div>
          <button type="submit" disabled={pending} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-control bg-forest text-[14px] font-semibold text-white hover:bg-forest-700 disabled:opacity-60 focus-ring">
            <Building2 className="size-4" aria-hidden="true" />
            {pending ? 'Working…' : 'Create agency'}
          </button>
        </form>
        <StatusLine success={state.success} error={!state.field ? state.error : undefined} onDismiss={() => setState({})} />
      </Card>

      <Card as="section" flush className="lg:col-span-7">
        <div className="px-5 pb-3 pt-5">
          <CardHeader title="Agencies" description={`${organizations.filter((o) => o.active).length} live on the shared Super Agent number`} />
        </div>
        <ul className="divide-y divide-divider border-t border-line">
          {organizations.map((o) => (
            <li key={o.id} className="flex flex-col gap-2 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[14px] font-bold text-ink">{o.name}</span>
                  <Badge tone="gold" mono>
                    {o.code ?? 'no code'}
                  </Badge>
                  {!o.active ? <Badge tone="error">Inactive</Badge> : null}
                  {o.id === currentOrgId ? <Badge>Home</Badge> : null}
                </div>
                <p className="truncate font-mono text-[12px] text-ink-muted">
                  {o.email}
                  {o.phone ? ` · ${o.phone}` : ''}
                </p>
                <p className="text-[12px] text-ink-faint">
                  {o.staffCount} staff · {o.clientCount} clients · {o.openConversations} waiting on WhatsApp
                </p>
              </div>
              {o.id !== currentOrgId ? (
                <button type="button" onClick={() => toggle(o)} disabled={pending} className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-control border border-line bg-surface px-2.5 text-[12.5px] font-semibold text-ink-muted hover:border-ink-muted hover:text-ink focus-ring disabled:opacity-60">
                  <Power className="size-3.5" aria-hidden="true" /> {o.active ? 'Deactivate' : 'Reactivate'}
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}

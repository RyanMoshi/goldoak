'use client'

import { CheckCircle2, KeyRound, UserMinus, UserPlus, X } from 'lucide-react'
import { useState, useTransition } from 'react'
import { Field, inputClass } from '@/components/platform/auth/AuthShell'
import { Badge } from '@/components/platform/ui/Badge'
import { Card, CardHeader } from '@/components/platform/ui/Card'
import { createAgencyAccountAction, resetAgencyPasswordAction, setAgencyActiveAction, type AdminActionState } from '@/lib/admin/actions'
import { cn } from '@/lib/cn'
import { formatPhone, relativeTime } from '@/lib/format'
import type { PublicUser } from '@/types/platform'

/** Admin creates agency logins (name, email, password) and manages them. Agencies never self-register. */
export function AgencyAccounts({ users, currentUserId }: { users: PublicUser[]; currentUserId: string }) {
  const [state, setState] = useState<AdminActionState>({})
  const [pending, startTransition] = useTransition()
  const [formKey, setFormKey] = useState(0)

  function submit(formData: FormData) {
    setState({})
    startTransition(async () => {
      const result = await createAgencyAccountAction(formData)
      setState(result)
      if (result.success) setFormKey((k) => k + 1)
    })
  }

  function reset(user: PublicUser) {
    if (!window.confirm(`Generate a new password for ${user.name}? Their current password stops working.`)) return
    startTransition(async () => setState(await resetAgencyPasswordAction(user.id)))
  }

  function toggle(user: PublicUser) {
    const verb = user.active ? 'Deactivate' : 'Reactivate'
    if (!window.confirm(`${verb} ${user.name}?`)) return
    startTransition(async () => setState(await setAgencyActiveAction(user.id, !user.active)))
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <Card as="section" className="lg:col-span-5">
        <CardHeader title="Invite an agency user" description="Create their username and password. Share both privately." />
        <form key={formKey} action={submit} className="mt-5 space-y-4" noValidate>
          <Field label="Full name" htmlFor="adm-name" error={state.field === 'name' ? state.error : undefined}>
            <input id="adm-name" name="name" required className={inputClass} placeholder="e.g. Terry Wanjiku" />
          </Field>
          <Field label="Email (username)" htmlFor="adm-email" error={state.field === 'email' ? state.error : undefined}>
            <input id="adm-email" name="email" type="email" required className={inputClass} placeholder="terry@goldoak.co.ke" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="WhatsApp number" htmlFor="adm-phone" error={state.field === 'phone' ? state.error : undefined} hint="Lets them use the workspace from WhatsApp.">
              <input id="adm-phone" name="phone" type="tel" className={inputClass} placeholder="0712 345 678" />
            </Field>
            <Field label="Job title" htmlFor="adm-title">
              <input id="adm-title" name="title" className={inputClass} placeholder="Insurance adviser" />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Password" htmlFor="adm-password" error={state.field === 'password' ? state.error : undefined} hint="Leave blank to generate one.">
              <input id="adm-password" name="password" type="text" autoComplete="off" className={inputClass} placeholder="Generate" />
            </Field>
            <Field label="Role" htmlFor="adm-role">
              <select id="adm-role" name="role" className={inputClass} defaultValue="agency">
                <option value="agency">Agency user</option>
                <option value="admin">Platform admin</option>
              </select>
            </Field>
          </div>
          <button type="submit" disabled={pending} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-control bg-forest text-[14px] font-semibold text-white hover:bg-forest-700 disabled:opacity-60 focus-ring">
            <UserPlus className="size-4" aria-hidden="true" />
            {pending ? 'Working…' : 'Create account'}
          </button>
        </form>
        {state.success || (state.error && !state.field) ? (
          <div role="status" className={cn('mt-4 flex items-start gap-2 rounded-control border px-3 py-2 text-[13px]', state.success ? 'border-success/25 bg-success/10 text-ink' : 'border-error/25 bg-error/10 text-error')}>
            <CheckCircle2 className={cn('mt-0.5 size-4 shrink-0', state.success ? 'text-success' : 'text-error')} aria-hidden="true" />
            <span className="flex-1 break-words">{state.success ?? state.error}</span>
            <button type="button" onClick={() => setState({})} aria-label="Dismiss" className="text-ink-muted hover:text-ink focus-ring rounded-control">
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        ) : null}
      </Card>

      <Card as="section" flush className="lg:col-span-7">
        <div className="px-5 pb-3 pt-5">
          <CardHeader title="Agency and admin accounts" description={`${users.filter((u) => u.active).length} active`} />
        </div>
        <ul className="divide-y divide-divider border-t border-line">
          {users.map((u) => (
            <li key={u.id} className="flex flex-col gap-2 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[14px] font-bold text-ink">{u.name}</span>
                  <Badge tone={u.role === 'admin' ? 'gold' : 'forest'}>{u.role}</Badge>
                  {!u.active ? <Badge tone="error">Deactivated</Badge> : null}
                  {u.id === currentUserId ? <Badge>You</Badge> : null}
                </div>
                <p className="truncate font-mono text-[12px] text-ink-muted">
                  {u.email}
                  {u.phone ? ` · ${formatPhone(u.phone)}` : ''}
                </p>
                <p className="text-[12px] text-ink-faint">
                  {u.title ?? 'No title'} · {u.lastSeenAt ? `last seen ${relativeTime(u.lastSeenAt)}` : 'never signed in'}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button type="button" onClick={() => reset(u)} disabled={pending} className="inline-flex h-8 items-center gap-1.5 rounded-control border border-line bg-surface px-2.5 text-[12.5px] font-semibold text-ink hover:border-ink-muted focus-ring disabled:opacity-60">
                  <KeyRound className="size-3.5" aria-hidden="true" /> New password
                </button>
                {u.id !== currentUserId ? (
                  <button type="button" onClick={() => toggle(u)} disabled={pending} className="inline-flex h-8 items-center gap-1.5 rounded-control border border-line bg-surface px-2.5 text-[12.5px] font-semibold text-ink-muted hover:border-ink-muted hover:text-ink focus-ring disabled:opacity-60">
                    <UserMinus className="size-3.5" aria-hidden="true" /> {u.active ? 'Deactivate' : 'Reactivate'}
                  </button>
                ) : null}
              </div>
            </li>
          ))}
          {users.length === 0 ? <li className="px-5 py-6 text-[13px] text-ink-muted">No accounts yet.</li> : null}
        </ul>
      </Card>
    </div>
  )
}

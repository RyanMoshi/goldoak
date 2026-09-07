'use client'

import { KeyRound, ShieldCheck, UserMinus, UserPlus } from 'lucide-react'
import { useState, useTransition } from 'react'
import { Field, inputClass } from '@/components/platform/auth/AuthShell'
import { Badge } from '@/components/platform/ui/Badge'
import { Card, CardHeader } from '@/components/platform/ui/Card'
import { StatusLine } from '@/components/platform/ui/PageHeader'
import { inviteStaffAction, resetStaffPasswordAction, setStaffActiveAction, setStaffRoleAction, type TeamActionState } from '@/lib/agency/actions'
import { formatPhone, relativeTime } from '@/lib/format'
import { ROLE_LABELS, type PublicUser } from '@/types/platform'

/** Agency admins invite staff, reset passwords, change roles and deactivate accounts. Everything is scoped to their agency. */
export function TeamManager({ users, currentUserId }: { users: PublicUser[]; currentUserId: string }) {
  const [state, setState] = useState<TeamActionState>({})
  const [pending, startTransition] = useTransition()
  const [formKey, setFormKey] = useState(0)

  function submit(formData: FormData) {
    setState({})
    startTransition(async () => {
      const result = await inviteStaffAction(formData)
      setState(result)
      if (result.success) setFormKey((k) => k + 1)
    })
  }

  function reset(user: PublicUser) {
    if (!window.confirm(`Generate a new password for ${user.name}? Their current password stops working.`)) return
    startTransition(async () => setState(await resetStaffPasswordAction(user.id)))
  }

  function toggle(user: PublicUser) {
    if (!window.confirm(`${user.active ? 'Deactivate' : 'Reactivate'} ${user.name}?`)) return
    startTransition(async () => setState(await setStaffActiveAction(user.id, !user.active)))
  }

  function role(user: PublicUser) {
    const next = user.role === 'agency_admin' ? 'agency' : 'agency_admin'
    if (!window.confirm(`Make ${user.name} ${next === 'agency_admin' ? 'an agency admin (can manage the team and settings)' : 'agency staff'}?`)) return
    startTransition(async () => setState(await setStaffRoleAction(user.id, next)))
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <Card as="section" className="lg:col-span-5">
        <CardHeader title="Invite a team member" description="Create their login. Share the password privately; they should change it after first use." />
        <form key={formKey} action={submit} className="mt-5 space-y-4" noValidate>
          <Field label="Full name" htmlFor="team-name" error={state.field === 'name' ? state.error : undefined}>
            <input id="team-name" name="name" required className={inputClass} placeholder="e.g. Terry Wanjiku" />
          </Field>
          <Field label="Email (username)" htmlFor="team-email" error={state.field === 'email' ? state.error : undefined}>
            <input id="team-email" name="email" type="email" required className={inputClass} placeholder="terry@agency.co.ke" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="WhatsApp number" htmlFor="team-phone" error={state.field === 'phone' ? state.error : undefined} hint="Lets them use the workspace from WhatsApp.">
              <input id="team-phone" name="phone" type="tel" className={inputClass} placeholder="0712 345 678" />
            </Field>
            <Field label="Job title" htmlFor="team-title">
              <input id="team-title" name="title" className={inputClass} placeholder="Insurance adviser" />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Password" htmlFor="team-password" error={state.field === 'password' ? state.error : undefined} hint="Leave blank to generate one.">
              <input id="team-password" name="password" type="text" autoComplete="off" className={inputClass} placeholder="Generate" />
            </Field>
            <Field label="Role" htmlFor="team-role">
              <select id="team-role" name="role" className={inputClass} defaultValue="agency">
                <option value="agency">Agency staff</option>
                <option value="agency_admin">Agency admin</option>
              </select>
            </Field>
          </div>
          <button type="submit" disabled={pending} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-control bg-forest text-[14px] font-semibold text-white hover:bg-forest-700 disabled:opacity-60 focus-ring">
            <UserPlus className="size-4" aria-hidden="true" />
            {pending ? 'Working…' : 'Create login'}
          </button>
        </form>
        <StatusLine success={state.success} error={!state.field ? state.error : undefined} onDismiss={() => setState({})} />
      </Card>

      <Card as="section" flush className="lg:col-span-7">
        <div className="px-5 pb-3 pt-5">
          <CardHeader title="Your team" description={`${users.filter((u) => u.active).length} active`} />
        </div>
        <ul className="divide-y divide-divider border-t border-line">
          {users.map((u) => (
            <li key={u.id} className="flex flex-col gap-2 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[14px] font-bold text-ink">{u.name}</span>
                  <Badge tone={u.role === 'agency_admin' ? 'gold' : 'forest'}>{ROLE_LABELS[u.role]}</Badge>
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
              <div className="flex shrink-0 flex-wrap gap-2">
                <button type="button" onClick={() => reset(u)} disabled={pending} className="inline-flex h-8 items-center gap-1.5 rounded-control border border-line bg-surface px-2.5 text-[12.5px] font-semibold text-ink hover:border-ink-muted focus-ring disabled:opacity-60">
                  <KeyRound className="size-3.5" aria-hidden="true" /> New password
                </button>
                {u.id !== currentUserId ? (
                  <>
                    <button type="button" onClick={() => role(u)} disabled={pending} className="inline-flex h-8 items-center gap-1.5 rounded-control border border-line bg-surface px-2.5 text-[12.5px] font-semibold text-ink-muted hover:border-ink-muted hover:text-ink focus-ring disabled:opacity-60">
                      <ShieldCheck className="size-3.5" aria-hidden="true" /> {u.role === 'agency_admin' ? 'Make staff' : 'Make admin'}
                    </button>
                    <button type="button" onClick={() => toggle(u)} disabled={pending} className="inline-flex h-8 items-center gap-1.5 rounded-control border border-line bg-surface px-2.5 text-[12.5px] font-semibold text-ink-muted hover:border-ink-muted hover:text-ink focus-ring disabled:opacity-60">
                      <UserMinus className="size-3.5" aria-hidden="true" /> {u.active ? 'Deactivate' : 'Reactivate'}
                    </button>
                  </>
                ) : null}
              </div>
            </li>
          ))}
          {users.length === 0 ? <li className="px-5 py-6 text-[13px] text-ink-muted">No team members yet.</li> : null}
        </ul>
      </Card>
    </div>
  )
}

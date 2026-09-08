'use server'

import { revalidatePath } from 'next/cache'
import { requireAgencyAdmin, requireSession } from '@/lib/auth/server'
import { audit } from '@/services/audit'
import { saveTemplateOverride, sendTemplateEmail, updateEmailPreferences } from '@/services/emails'
import { getUser } from '@/services/users'

export interface EmailActionState {
  error?: string
  success?: string
}

/** Agency admins customise their own wording; the super admin edits the platform defaults. */
export async function saveTemplateAction(formData: FormData): Promise<EmailActionState> {
  const scope = formData.get('scope') === 'global' ? 'global' : 'agency'
  const session = scope === 'global' ? await requireSession('admin') : await requireAgencyAdmin()
  const key = String(formData.get('key') ?? '')
  const reset = formData.get('reset') === '1'
  try {
    await saveTemplateOverride(scope === 'global' ? null : session.oid, key, reset ? {} : { subject: String(formData.get('subject') ?? ''), heading: String(formData.get('heading') ?? ''), body: String(formData.get('body') ?? '') }, session.uid)
    await audit({ organizationId: scope === 'global' ? null : session.oid, actorUserId: session.uid, action: reset ? 'email-template.reset' : 'email-template.updated', target: key })
    revalidatePath(scope === 'global' ? '/admin/templates' : '/agency/templates')
    return { success: reset ? 'Back to the default wording.' : 'Saved. New emails use this wording.' }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Could not save the template.' }
  }
}

export async function sendTestEmailAction(formData: FormData): Promise<EmailActionState> {
  const session = await requireSession('agency')
  const to = String(formData.get('to') ?? '').trim().toLowerCase()
  const key = String(formData.get('key') ?? 'welcome')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return { error: 'Enter a valid email address.' }
  const outcome = await sendTemplateEmail({ key, to, organizationId: session.role === 'admin' && formData.get('scope') === 'global' ? null : session.oid, userId: null, vars: { first_name: 'Test', email: to, temporary_password: 'Mango4827', otp_code: '482913', expires_in: '10 minutes', login_url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://goldoak.vercel.app'}/signin`, agent_name: session.name, policy_name: 'Motor Comprehensive', policy_number: 'MC/2026/00412', insurer: 'Jubilee Allianz', renewal_date: '12 Oct 2026', days_left: '14', premium: 'KES 48,500', title: 'Test email', body: 'This is a test from your dashboard.', agency_name: 'Your agency', join_code: 'CODE' }, category: 'system', immediate: true, relatedType: 'test' })
  await audit({ organizationId: session.oid, actorUserId: session.uid, action: 'email.test-sent', target: to, detail: { key, outcome } })
  if (outcome === 'sent') return { success: `Sent to ${to}.` }
  if (outcome === 'unconfigured') return { error: 'SMTP is not configured on the server.' }
  return { error: 'The mail server did not accept the message. Check Email activity for the reason.' }
}

export async function updateEmailPreferencesAction(formData: FormData): Promise<EmailActionState> {
  const session = await requireSession('client')
  const user = await getUser(session.uid)
  if (!user) return { error: 'Account not found.' }
  await updateEmailPreferences(user.id, { reminders: formData.get('reminders') === 'on', updates: formData.get('updates') === 'on', marketing: formData.get('marketing') === 'on' })
  await audit({ organizationId: session.oid, actorUserId: user.id, action: 'user.email-preferences', target: user.id })
  revalidatePath('/portal/profile')
  return { success: 'Preferences saved. Security and account emails are always sent.' }
}

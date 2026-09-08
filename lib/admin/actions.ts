'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getSession, requireSession } from '@/lib/auth/server'
import { SESSION_COOKIE, SESSION_DAYS, homeFor, signSession } from '@/lib/auth/session'
import { announceApproval, inviteStaff, resetToTemporaryPassword } from '@/services/onboarding'
import { listMemberships } from '@/services/memberships'
import { normalizePhone } from '@/lib/format'
import { audit } from '@/services/audit'
import { linkContact } from '@/services/conversations'
import { codeTaken, createOrganization, emailOrPhoneTaken, getOrganization, getUser, setUserActive, updateOrganization } from '@/services/users'

export interface AdminActionState {
  error?: string
  success?: string
  field?: 'name' | 'email' | 'phone' | 'password' | 'code' | 'organization' | 'shortName'
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Super admin creates an agency (tenant) and its first agency admin in one step. */
export async function createOrganizationAction(formData: FormData): Promise<AdminActionState> {
  const session = await requireSession('admin')
  const name = String(formData.get('name') ?? '').trim()
  const shortName = String(formData.get('shortName') ?? '').trim() || name.split(' ')[0]
  const code = String(formData.get('code') ?? '').trim().toUpperCase().replace(/[^A-Z0-9-]/g, '')
  const phone = String(formData.get('phone') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const greeting = String(formData.get('greeting') ?? '').trim().slice(0, 300) || null
  const adminName = String(formData.get('adminName') ?? '').trim()
  const adminEmail = String(formData.get('adminEmail') ?? '').trim().toLowerCase()
  const adminPhoneInput = String(formData.get('adminPhone') ?? '').trim()

  if (name.length < 2) return { error: 'Enter the agency name.', field: 'name' }
  if (code.length < 3 || code.length > 12) return { error: 'The join code needs 3 to 12 letters or digits (for example ACME).', field: 'code' }
  if (!EMAIL.test(email)) return { error: 'Enter the agency’s contact email.', field: 'email' }
  if (adminName.length < 2) return { error: 'Enter the agency admin’s name.', field: 'name' }
  if (!EMAIL.test(adminEmail)) return { error: 'Enter a valid email for the agency admin.', field: 'email' }
  const adminPhone = adminPhoneInput ? normalizePhone(adminPhoneInput) : null
  if (adminPhoneInput && !adminPhone) return { error: 'Enter a valid mobile number for the agency admin.', field: 'phone' }

  try {
    if (await codeTaken(code)) return { error: 'That join code is already used by another agency.', field: 'code' }
    const taken = await emailOrPhoneTaken(adminEmail, adminPhone)
    if (taken === 'email') return { error: 'An account with the admin’s email already exists.', field: 'email' }
    if (taken === 'phone') return { error: 'That phone number is already on another account.', field: 'phone' }

    const org = await createOrganization({ name, shortName, code, phone, email, greeting })
    const { user: admin, temporaryPassword, emailed } = await inviteStaff({ organizationId: org.id, actor: { id: session.uid, name: session.name }, name: adminName, email: adminEmail, phone: adminPhone, title: 'Agency admin', role: 'agency_admin' })
    await audit({ organizationId: org.id, actorUserId: session.uid, action: 'organization.created', target: org.id, detail: { name, code, adminUserId: admin.id } })
    revalidatePath('/admin')
    return { success: `${org.name} is live with join code ${code}. ${admin.name} ${emailed ? 'has been emailed' : 'could not be emailed; share'} the temporary password ${temporaryPassword}; they choose their own at first sign-in.` }
  } catch (error) {
    console.error('createOrganization failed', error instanceof Error ? error.message : error)
    return { error: 'Could not create the agency. Please try again.' }
  }
}

export async function setOrganizationActiveAction(organizationId: string, active: boolean): Promise<AdminActionState> {
  const session = await requireSession('admin')
  if (organizationId === session.oid && !active) return { error: 'You cannot deactivate your own organisation.' }
  try {
    await updateOrganization(organizationId, { active })
    await audit({ organizationId, actorUserId: session.uid, action: active ? 'organization.activated' : 'organization.deactivated', target: organizationId })
    revalidatePath('/admin')
    return { success: active ? 'Agency reactivated.' : 'Agency deactivated. Its staff can still sign in but it no longer receives new WhatsApp contacts.' }
  } catch (error) {
    console.error('setOrganizationActive failed', error instanceof Error ? error.message : error)
    return { error: 'Could not update the agency.' }
  }
}

/** Super admin invites a staff member into any agency. */
export async function createAgencyAccountAction(formData: FormData): Promise<AdminActionState> {
  const session = await requireSession('admin')
  const organizationId = String(formData.get('organizationId') ?? '').trim()
  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const phoneInput = String(formData.get('phone') ?? '').trim()
  const title = String(formData.get('title') ?? '').trim() || null
  const roleRaw = String(formData.get('role') ?? 'agency')
  const role = roleRaw === 'agency_admin' ? 'agency_admin' : roleRaw === 'admin' ? 'admin' : 'agency'

  if (!organizationId) return { error: 'Choose the agency.', field: 'organization' }
  if (name.length < 2) return { error: 'Enter the person’s full name.', field: 'name' }
  if (!EMAIL.test(email)) return { error: 'Enter a valid email address.', field: 'email' }
  const phone = phoneInput ? normalizePhone(phoneInput) : null
  if (phoneInput && !phone) return { error: 'Enter a valid mobile number.', field: 'phone' }

  try {
    const org = await getOrganization(organizationId)
    if (!org) return { error: 'That agency does not exist.', field: 'organization' }
    const taken = await emailOrPhoneTaken(email, phone)
    if (taken === 'email') return { error: 'An account with that email already exists.', field: 'email' }
    if (taken === 'phone') return { error: 'That phone number is already on another account.', field: 'phone' }
    const { user, temporaryPassword, emailed } = await inviteStaff({ organizationId, actor: { id: session.uid, name: session.name }, name, email, phone, title, role })
    revalidatePath('/admin')
    return { success: `${user.name} (${org.shortName}) ${emailed ? 'has been emailed' : 'could not be emailed; share'} the temporary password ${temporaryPassword}. They choose their own at first sign-in.` }
  } catch (error) {
    console.error('createAgencyAccount failed', error instanceof Error ? error.message : error)
    return { error: 'Could not create the account. Please try again.' }
  }
}

export async function resetAgencyPasswordAction(userId: string): Promise<AdminActionState> {
  const session = await requireSession('admin')
  try {
    const user = await getUser(userId)
    if (!user) return { error: 'Account not found.' }
    const { temporaryPassword, emailed } = await resetToTemporaryPassword(user, { id: session.uid, name: session.name }, user.organizationId)
    revalidatePath('/admin')
    return { success: emailed ? `A temporary password (${temporaryPassword}) was emailed to ${user.email}.` : `Temporary password: ${temporaryPassword}. Email could not be sent; share it privately.` }
  } catch (error) {
    console.error('resetAgencyPassword failed', error instanceof Error ? error.message : error)
    return { error: 'Could not reset the password.' }
  }
}

export async function setAgencyActiveAction(userId: string, active: boolean): Promise<AdminActionState> {
  const session = await requireSession('admin')
  if (userId === session.uid && !active) return { error: 'You cannot deactivate your own account.' }
  try {
    await setUserActive(userId, active)
    await audit({ organizationId: null, actorUserId: session.uid, action: active ? 'user.activated' : 'user.deactivated', target: userId })
    revalidatePath('/admin')
    return { success: active ? 'Account reactivated.' : 'Account deactivated. They can no longer sign in.' }
  } catch (error) {
    console.error('setAgencyActive failed', error instanceof Error ? error.message : error)
    return { error: 'Could not update the account.' }
  }
}

/** Route an unassigned WhatsApp contact to an agency. */
export async function assignConversationAction(phone: string, organizationId: string): Promise<AdminActionState> {
  const session = await requireSession('admin')
  try {
    const org = await getOrganization(organizationId)
    if (!org) return { error: 'That agency does not exist.' }
    await linkContact(phone.replace(/\D/g, ''), { organizationId })
    await audit({ organizationId, actorUserId: session.uid, action: 'conversation.routed', target: phone })
    revalidatePath('/admin/conversations')
    return { success: `Routed to ${org.name}.` }
  } catch (error) {
    console.error('assignConversation failed', error instanceof Error ? error.message : error)
    return { error: 'Could not route the conversation.' }
  }
}

/** Approve a self-registered agency: it goes live on the shared WhatsApp number. */
export async function approveOrganizationAction(organizationId: string): Promise<AdminActionState> {
  const session = await requireSession('admin')
  try {
    const org = await getOrganization(organizationId)
    if (!org) return { error: 'That agency does not exist.' }
    await updateOrganization(organizationId, { status: 'active', active: true })
    await audit({ organizationId, actorUserId: session.uid, action: 'organization.approved', target: organizationId })
    await announceApproval({ ...org, status: 'active', active: true })
    revalidatePath('/admin')
    return { success: `${org.name} approved and told.` }
  } catch (error) {
    console.error('approveOrganization failed', error instanceof Error ? error.message : error)
    return { error: 'Could not approve the agency.' }
  }
}

export async function retryJobAction(jobId: string): Promise<AdminActionState> {
  await requireSession('admin')
  try {
    const { retryJob, runJobs } = await import('@/services/jobs')
    const { registerJobHandlers } = await import('@/services/jobs/handlers')
    await retryJob(jobId)
    registerJobHandlers()
    await runJobs(3, 120_000)
    revalidatePath('/admin/system')
    return { success: 'Job queued again.' }
  } catch (error) {
    console.error('retryJob failed', error instanceof Error ? error.message : error)
    return { error: 'Could not retry the job.' }
  }
}

/* ---------- Impersonation (support), fully audited ---------- */

/** The super admin opens another person's workspace. Every action taken is logged against the admin, and a banner shows who is acting. */
export async function impersonateAction(userId: string): Promise<AdminActionState> {
  const session = await requireSession('admin')
  if (session.imp) return { error: 'Return to your own account first.' }
  const target = await getUser(userId)
  if (!target || target.role === 'admin') return { error: 'That account cannot be impersonated.' }
  const memberships = await listMemberships(target.id)
  const membership = memberships[0]
  const oid = membership?.organizationId ?? target.organizationId
  if (!oid) return { error: 'That account has no agency.' }
  const role = membership?.role ?? target.role
  const token = await signSession({ uid: target.id, role, oid, name: target.name, imp: session.uid })
  await audit({ organizationId: oid, actorUserId: session.uid, action: 'auth.impersonation-started', target: target.id, detail: { role } })
  cookies().set(SESSION_COOKIE, token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 })
  redirect(homeFor(role))
}

export async function stopImpersonationAction(): Promise<void> {
  const session = await getSession()
  if (!session?.imp) redirect('/admin')
  const admin = await getUser(session.imp)
  await audit({ organizationId: session.oid, actorUserId: session.imp, action: 'auth.impersonation-ended', target: session.uid })
  if (!admin || admin.role !== 'admin') {
    cookies().delete(SESSION_COOKIE)
    redirect('/signin')
  }
  const token = await signSession({ uid: admin.id, role: 'admin', oid: admin.organizationId ?? 'org_goldoak', name: admin.name })
  cookies().set(SESSION_COOKIE, token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: SESSION_DAYS * 86400 })
  redirect('/admin')
}

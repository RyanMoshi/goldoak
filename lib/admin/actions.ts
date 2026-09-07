'use server'

import { revalidatePath } from 'next/cache'
import { hashPassword } from '@/lib/auth/password'
import { generatePassword } from '@/lib/conversation/flows'
import { requireSession } from '@/lib/auth/server'
import { normalizePhone } from '@/lib/format'
import { audit } from '@/services/audit'
import { linkContact } from '@/services/conversations'
import { codeTaken, createOrganization, createStaffUser, emailOrPhoneTaken, getOrganization, setUserActive, setUserPassword, updateOrganization } from '@/services/users'

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
  let password = String(formData.get('adminPassword') ?? '').trim()

  if (name.length < 2) return { error: 'Enter the agency name.', field: 'name' }
  if (code.length < 3 || code.length > 12) return { error: 'The join code needs 3 to 12 letters or digits (for example ACME).', field: 'code' }
  if (!EMAIL.test(email)) return { error: 'Enter the agency’s contact email.', field: 'email' }
  if (adminName.length < 2) return { error: 'Enter the agency admin’s name.', field: 'name' }
  if (!EMAIL.test(adminEmail)) return { error: 'Enter a valid email for the agency admin.', field: 'email' }
  const adminPhone = adminPhoneInput ? normalizePhone(adminPhoneInput) : null
  if (adminPhoneInput && !adminPhone) return { error: 'Enter a valid mobile number for the agency admin.', field: 'phone' }
  if (password && password.length < 8) return { error: 'Passwords need at least 8 characters, or leave blank to generate one.', field: 'password' }
  if (!password) password = generatePassword()

  try {
    if (await codeTaken(code)) return { error: 'That join code is already used by another agency.', field: 'code' }
    const taken = await emailOrPhoneTaken(adminEmail, adminPhone)
    if (taken === 'email') return { error: 'An account with the admin’s email already exists.', field: 'email' }
    if (taken === 'phone') return { error: 'That phone number is already on another account.', field: 'phone' }

    const org = await createOrganization({ name, shortName, code, phone, email, greeting })
    const admin = await createStaffUser({ role: 'agency_admin', organizationId: org.id, name: adminName, email: adminEmail, phone: adminPhone, title: 'Agency admin', passwordHash: await hashPassword(password), createdBy: session.uid })
    await audit({ organizationId: org.id, actorUserId: session.uid, action: 'organization.created', target: org.id, detail: { name, code, adminUserId: admin.id } })
    revalidatePath('/admin')
    return { success: `${org.name} is live with join code ${code}. ${admin.name} can sign in on the Agency tab with ${admin.email} and the password ${password}. Share it privately.` }
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
  let password = String(formData.get('password') ?? '').trim()

  if (!organizationId) return { error: 'Choose the agency.', field: 'organization' }
  if (name.length < 2) return { error: 'Enter the person’s full name.', field: 'name' }
  if (!EMAIL.test(email)) return { error: 'Enter a valid email address.', field: 'email' }
  const phone = phoneInput ? normalizePhone(phoneInput) : null
  if (phoneInput && !phone) return { error: 'Enter a valid mobile number.', field: 'phone' }
  if (password && password.length < 8) return { error: 'Passwords need at least 8 characters, or leave blank to generate one.', field: 'password' }
  if (!password) password = generatePassword()

  try {
    const org = await getOrganization(organizationId)
    if (!org) return { error: 'That agency does not exist.', field: 'organization' }
    const taken = await emailOrPhoneTaken(email, phone)
    if (taken === 'email') return { error: 'An account with that email already exists.', field: 'email' }
    if (taken === 'phone') return { error: 'That phone number is already on another account.', field: 'phone' }
    const user = await createStaffUser({ role, organizationId, name, email, phone, title, passwordHash: await hashPassword(password), createdBy: session.uid })
    await audit({ organizationId, actorUserId: session.uid, action: 'user.created', target: user.id, detail: { role } })
    revalidatePath('/admin')
    return { success: `${user.name} (${org.shortName}) can now sign in on the Agency tab with ${user.email} and the password ${password}. Share it privately; they should change it after first use.` }
  } catch (error) {
    console.error('createAgencyAccount failed', error instanceof Error ? error.message : error)
    return { error: 'Could not create the account. Please try again.' }
  }
}

export async function resetAgencyPasswordAction(userId: string): Promise<AdminActionState> {
  const session = await requireSession('admin')
  const password = generatePassword()
  try {
    await setUserPassword(userId, await hashPassword(password))
    await audit({ organizationId: null, actorUserId: session.uid, action: 'user.password-reset', target: userId })
    revalidatePath('/admin')
    return { success: `New password: ${password}. Share it privately.` }
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

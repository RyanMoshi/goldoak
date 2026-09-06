'use server'

import { revalidatePath } from 'next/cache'
import { hashPassword } from '@/lib/auth/password'
import { requireSession } from '@/lib/auth/server'
import { normalizePhone } from '@/lib/format'
import { createStaffUser, emailOrPhoneTaken, setUserActive, setUserPassword, DEFAULT_ORGANIZATION_ID } from '@/services/users'

export interface AdminActionState {
  error?: string
  success?: string
  field?: 'name' | 'email' | 'phone' | 'password'
}

function generatePassword(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let out = ''
  const bytes = new Uint8Array(12)
  crypto.getRandomValues(bytes)
  for (const b of bytes) out += alphabet[b % alphabet.length]
  return `${out.slice(0, 4)}-${out.slice(4, 8)}-${out.slice(8)}`
}

/** Admin invites an agency user by creating the account and choosing (or generating) the password. */
export async function createAgencyAccountAction(formData: FormData): Promise<AdminActionState> {
  const session = await requireSession('admin')
  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const phoneInput = String(formData.get('phone') ?? '').trim()
  const title = String(formData.get('title') ?? '').trim() || null
  const role = formData.get('role') === 'admin' ? 'admin' : 'agency'
  let password = String(formData.get('password') ?? '').trim()

  if (name.length < 2) return { error: 'Enter the person’s full name.', field: 'name' }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Enter a valid email address.', field: 'email' }
  const phone = phoneInput ? normalizePhone(phoneInput) : null
  if (phoneInput && !phone) return { error: 'Enter a valid mobile number.', field: 'phone' }
  if (password && password.length < 8) return { error: 'Passwords need at least 8 characters, or leave blank to generate one.', field: 'password' }
  if (!password) password = generatePassword()

  try {
    const taken = await emailOrPhoneTaken(email, phone)
    if (taken === 'email') return { error: 'An account with that email already exists.', field: 'email' }
    if (taken === 'phone') return { error: 'That phone number is already on another account.', field: 'phone' }
    const user = await createStaffUser({ role, organizationId: DEFAULT_ORGANIZATION_ID, name, email, phone, title, passwordHash: await hashPassword(password), createdBy: session.uid })
    revalidatePath('/admin')
    return { success: `${user.name} can now sign in on the Agency tab with ${user.email} and the password ${password}. Share it privately; they should change it after first use.` }
  } catch (error) {
    console.error('createAgencyAccount failed', error instanceof Error ? error.message : error)
    return { error: 'Could not create the account. Please try again.' }
  }
}

export async function resetAgencyPasswordAction(userId: string): Promise<AdminActionState> {
  await requireSession('admin')
  const password = generatePassword()
  try {
    await setUserPassword(userId, await hashPassword(password))
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
    revalidatePath('/admin')
    return { success: active ? 'Account reactivated.' : 'Account deactivated. They can no longer sign in.' }
  } catch (error) {
    console.error('setAgencyActive failed', error instanceof Error ? error.message : error)
    return { error: 'Could not update the account.' }
  }
}

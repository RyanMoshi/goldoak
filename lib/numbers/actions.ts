'use server'

import { revalidatePath } from 'next/cache'
import { requireAgencyAdmin, requireSession } from '@/lib/auth/server'
import { getOrganization } from '@/services/users'
import {
  addNumber,
  deleteNumbers,
  importNumbers,
  parseNumbers,
  setStatusFor,
  updateNumber,
  type NumberStatus,
} from '@/services/numbers'

/**
 * The number book's actions.
 *
 * Reading is open to any staff member; changing the book is for agency admins,
 * because a careless paste or delete touches thousands of rows. Every action
 * re-reads the session rather than trusting anything the form sent, so the
 * organization a row belongs to is never chosen by the browser.
 */

export interface NumbersState {
  error?: string
  success?: string
  field?: string
  report?: {
    added: number
    updated: number
    skipped: number
    invalid: { line: string; reason: string }[]
  }
}

/** The country to assume for numbers written in local form. */
async function agencyCountry(organizationId: string): Promise<string | null> {
  const org = await getOrganization(organizationId)
  return org?.country ?? null
}

export async function addNumberAction(formData: FormData): Promise<NumbersState> {
  const session = await requireAgencyAdmin()
  const phone = String(formData.get('phone') ?? '').trim()
  if (!phone) return { error: 'Enter a phone number.', field: 'phone' }

  const result = await addNumber({
    organizationId: session.oid,
    createdBy: session.uid,
    phone,
    country: String(formData.get('country') ?? '') || (await agencyCountry(session.oid)),
    name: String(formData.get('name') ?? '').trim() || null,
    listName: String(formData.get('listName') ?? 'general'),
    ownerUserId: String(formData.get('ownerUserId') ?? '') || null,
    notes: String(formData.get('notes') ?? '').trim() || null,
  })
  if (!result.ok) return { error: result.error, field: 'phone' }

  revalidatePath('/agency/numbers')
  return { success: 'Number added.' }
}

export async function importNumbersAction(formData: FormData): Promise<NumbersState> {
  const session = await requireAgencyAdmin()
  const text = String(formData.get('numbers') ?? '')
  if (!text.trim()) return { error: 'Paste some numbers first, one per line.', field: 'numbers' }

  // A number written with + or 00 keeps its own country; the rest are read
  // against whichever country the form chose, or the agency's own.
  const country = String(formData.get('country') ?? '') || (await agencyCountry(session.oid))
  const parsed = parseNumbers(text, country)
  if (!parsed.valid.length) {
    return {
      error: 'None of those lines held a valid phone number. Include the country code, or pick the country above.',
      field: 'numbers',
      report: { added: 0, updated: 0, skipped: 0, invalid: parsed.invalid.slice(0, 20) },
    }
  }

  const result = await importNumbers({
    organizationId: session.oid,
    createdBy: session.uid,
    listName: String(formData.get('listName') ?? 'general'),
    ownerUserId: String(formData.get('ownerUserId') ?? '') || null,
    parsed,
  })

  revalidatePath('/agency/numbers')
  const parts = [`${result.added.toLocaleString('en-KE')} added`]
  if (result.updated) parts.push(`${result.updated.toLocaleString('en-KE')} already on file`)
  if (result.skipped) parts.push(`${result.skipped.toLocaleString('en-KE')} repeated in the paste`)
  if (result.invalid.length) parts.push(`${result.invalid.length.toLocaleString('en-KE')} could not be read`)
  return {
    success: `${parts.join(', ')}.`,
    report: { ...result, invalid: result.invalid.slice(0, 20) },
  }
}

export async function updateNumberAction(id: string, patch: { name?: string | null; listName?: string; status?: NumberStatus; ownerUserId?: string | null; notes?: string | null }): Promise<NumbersState> {
  const session = await requireAgencyAdmin()
  const ok = await updateNumber(session.oid, id, patch)
  if (!ok) return { error: 'That number is no longer in your list.' }
  revalidatePath('/agency/numbers')
  return { success: 'Saved.' }
}

export async function deleteNumbersAction(ids: string[]): Promise<NumbersState> {
  const session = await requireAgencyAdmin()
  const count = await deleteNumbers(session.oid, ids.slice(0, 5000))
  revalidatePath('/agency/numbers')
  return { success: count === 1 ? 'Number removed.' : `${count.toLocaleString('en-KE')} numbers removed.` }
}

export async function setNumberStatusAction(ids: string[], status: NumberStatus): Promise<NumbersState> {
  const session = await requireAgencyAdmin()
  const count = await setStatusFor(session.oid, ids.slice(0, 5000), status)
  revalidatePath('/agency/numbers')
  const label = status === 'unsubscribed' ? 'opted out' : status
  return { success: count === 1 ? `Number marked ${label}.` : `${count.toLocaleString('en-KE')} numbers marked ${label}.` }
}

/** Staff-level read, used by the page's search and paging. */
export async function assertNumbersAccess(): Promise<string> {
  const session = await requireSession('agency')
  return session.oid
}

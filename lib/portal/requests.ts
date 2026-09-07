'use server'

import { revalidatePath } from 'next/cache'
import { requireSession } from '@/lib/auth/server'
import { normalizePhone } from '@/lib/format'
import { searchBusinesses, submitBusinessClaim } from '@/services/businesses'
import { createEnquiry } from '@/services/enquiries'
import { clientForUser } from '@/services/journey'
import { getUser } from '@/services/users'
import type { Business } from '@/types/platform'

/** Portal actions that mirror the WhatsApp workflows: same services, same records. */

export interface PortalRequestState {
  error?: string
  success?: string
}

export async function searchBusinessesAction(query: string): Promise<Business[]> {
  const session = await requireSession('client')
  return searchBusinesses(session.oid, query.slice(0, 80))
}

export async function claimBusinessAction(formData: FormData): Promise<PortalRequestState> {
  const session = await requireSession('client')
  const businessId = String(formData.get('businessId') ?? '').trim()
  const relationship = String(formData.get('relationship') ?? '').trim()
  const verification = String(formData.get('verification') ?? '').trim().slice(0, 300) || null
  if (!businessId) return { error: 'Choose the business first.' }
  if (!relationship) return { error: 'Tell us your relationship with the business.' }
  try {
    const [user, client] = await Promise.all([getUser(session.uid), clientForUser(session.uid)])
    const claim = await submitBusinessClaim({ organizationId: session.oid, businessId, clientId: client?.id ?? null, userId: session.uid, phone: user?.phone ?? null, applicantName: user?.name ?? session.name, relationship, verification, channel: 'web' })
    revalidatePath('/portal/requests')
    return { success: `Claim ${claim.reference} submitted. Your agency verifies it and confirms here and on WhatsApp.` }
  } catch (error) {
    console.error('claimBusiness failed', error instanceof Error ? error.message : error)
    return { error: 'Could not submit the claim. Please try again.' }
  }
}

export async function enquiryAction(formData: FormData): Promise<PortalRequestState> {
  const session = await requireSession('client')
  const subject = String(formData.get('subject') ?? '').trim()
  const body = String(formData.get('body') ?? '').trim()
  const phoneInput = String(formData.get('phone') ?? '').trim()
  if (subject.length < 3) return { error: 'Give your enquiry a short subject.' }
  if (body.length < 8) return { error: 'Add a little more detail so the agency can answer in one go.' }
  try {
    const [user, client] = await Promise.all([getUser(session.uid), clientForUser(session.uid)])
    const phone = phoneInput ? normalizePhone(phoneInput) : user?.phone ?? null
    const enquiry = await createEnquiry({ organizationId: session.oid, clientId: client?.id ?? null, userId: session.uid, phone, name: user?.name ?? session.name, subject, body, channel: 'web' })
    revalidatePath('/portal/requests')
    return { success: `Enquiry ${enquiry.reference} sent. The answer arrives here and on WhatsApp.` }
  } catch (error) {
    console.error('enquiry failed', error instanceof Error ? error.message : error)
    return { error: 'Could not send the enquiry. Please try again.' }
  }
}

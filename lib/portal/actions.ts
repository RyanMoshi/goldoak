'use server'

import { revalidatePath } from 'next/cache'
import { requireSession } from '@/lib/auth/server'
import { normalizePhone } from '@/lib/format'
import { clientForUser, policiesForClient, reportClaim, requestQuote } from '@/services/journey'
import { markAllRead } from '@/services/notifications'
import { emailOrPhoneTaken, setUserPhone } from '@/services/users'
import { PRODUCT_LINES } from '@/types/platform'

export interface PortalActionState {
  error?: string
  success?: string
}

export async function requestQuoteAction(formData: FormData): Promise<PortalActionState> {
  const session = await requireSession('client')
  const product = String(formData.get('product') ?? '').trim()
  const notes = String(formData.get('notes') ?? '').trim().slice(0, 500) || null
  if (!PRODUCT_LINES.includes(product as (typeof PRODUCT_LINES)[number])) return { error: 'Choose what you want cover for.' }
  try {
    const client = await clientForUser(session.uid)
    if (!client) return { error: 'Your adviser is still setting up your account. Please try again shortly.' }
    const quote = await requestQuote({ client, product, notes, channel: 'web', actorUserId: session.uid })
    revalidatePath('/portal')
    return { success: `Request ${quote.reference} sent. Your adviser will approach our panel and you will see each reply here.` }
  } catch (error) {
    console.error('requestQuote failed', error instanceof Error ? error.message : error)
    return { error: 'Could not send the request. Please try again.' }
  }
}

export async function reportClaimAction(formData: FormData): Promise<PortalActionState> {
  const session = await requireSession('client')
  const policyId = String(formData.get('policyId') ?? '')
  const description = String(formData.get('description') ?? '').trim().slice(0, 1000)
  const incidentDate = String(formData.get('incidentDate') ?? '')
  if (description.length < 8) return { error: 'Tell us in a few words what happened.' }
  try {
    const client = await clientForUser(session.uid)
    if (!client) return { error: 'Your adviser is still setting up your account. Please call us instead.' }
    const policies = await policiesForClient(client.id)
    const policy = policies.find((p) => p.id === policyId) ?? null
    if (!policy) return { error: 'Choose the policy this claim is about.' }
    const claim = await reportClaim({
      client,
      policy,
      product: policy.product,
      insurer: policy.insurer,
      description,
      incidentDate: /^\d{4}-\d{2}-\d{2}$/.test(incidentDate) ? incidentDate : null,
      channel: 'web',
      actorUserId: session.uid,
    })
    revalidatePath('/portal')
    return { success: `Claim ${claim.reference} recorded. We register it with ${policy.insurer} within 24 hours and update you weekly.` }
  } catch (error) {
    console.error('reportClaim failed', error instanceof Error ? error.message : error)
    return { error: 'Could not record the claim. Please call us.' }
  }
}

export async function markUpdatesReadAction(): Promise<void> {
  const session = await requireSession('client')
  await markAllRead(session.uid)
  revalidatePath('/portal')
}

export async function updatePhoneAction(formData: FormData): Promise<PortalActionState> {
  const session = await requireSession('client')
  const input = String(formData.get('phone') ?? '').trim()
  const phone = input ? normalizePhone(input) : null
  if (!phone) return { error: 'Enter a valid mobile number, e.g. 0712 345 678 or +255 742 473 493.' }
  try {
    const taken = await emailOrPhoneTaken('nobody@invalid.example', phone)
    if (taken === 'phone') return { error: 'That number is already on another account.' }
    await setUserPhone(session.uid, phone)
    revalidatePath('/portal/profile')
    return { success: 'Number saved. WhatsApp will recognise you from now on.' }
  } catch (error) {
    console.error('updatePhone failed', error instanceof Error ? error.message : error)
    return { error: 'Could not save the number.' }
  }
}

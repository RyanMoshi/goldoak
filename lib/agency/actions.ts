'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireSession } from '@/lib/auth/server'
import { normalizePhone } from '@/lib/format'
import { runAgencyCommand } from '@/services/agency/commands'
import { completeTask } from '@/services/agency/dashboard'
import { addPolicy, createClient, messageClient, updateClaimStage, updateClientStage, updateQuoteStage } from '@/services/journey'
import type { ClaimStage, CommandResult, JourneyStage, QuoteStage } from '@/types/platform'
import { CLAIM_STAGES, JOURNEY_STAGES } from '@/types/platform'

export interface ActionState {
  error?: string
  success?: string
}

export async function completeTaskAction(taskId: string): Promise<{ ok: boolean }> {
  const session = await requireSession('agency')
  try {
    await completeTask(session.oid, taskId)
    revalidatePath('/agency/today')
    return { ok: true }
  } catch (error) {
    console.error('completeTask failed', error instanceof Error ? error.message : error)
    return { ok: false }
  }
}

export async function runCommandAction(command: string): Promise<CommandResult> {
  const session = await requireSession('agency')
  return runAgencyCommand(session.oid, command.slice(0, 200))
}

export async function updateStageAction(clientId: string, stage: string): Promise<ActionState> {
  const session = await requireSession('agency')
  if (!JOURNEY_STAGES.some((s) => s.id === stage)) return { error: 'Unknown stage.' }
  try {
    await updateClientStage(session.oid, clientId, stage as JourneyStage, session.name)
    revalidatePath(`/agency/clients/${clientId}`)
    return { success: 'Stage updated. The client has been told.' }
  } catch (error) {
    console.error('updateStage failed', error instanceof Error ? error.message : error)
    return { error: 'Could not update the stage.' }
  }
}

export async function addPolicyAction(clientId: string, formData: FormData): Promise<ActionState> {
  const session = await requireSession('agency')
  const insurer = String(formData.get('insurer') ?? '').trim()
  const product = String(formData.get('product') ?? '').trim()
  const policyNumber = String(formData.get('policyNumber') ?? '').trim()
  const premium = Number(String(formData.get('premium') ?? '').replace(/[^\d.]/g, ''))
  const sumInsuredRaw = String(formData.get('sumInsured') ?? '').replace(/[^\d.]/g, '')
  const startDate = String(formData.get('startDate') ?? '')
  const expiryDate = String(formData.get('expiryDate') ?? '')
  const keyExclusions = String(formData.get('keyExclusions') ?? '').trim() || null
  if (!insurer || !product || !policyNumber) return { error: 'Insurer, product and policy number are required.' }
  if (!premium || premium <= 0) return { error: 'Enter the annual premium in shillings.' }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(expiryDate)) return { error: 'Enter the start and expiry dates.' }
  try {
    await addPolicy({ organizationId: session.oid, clientId, insurer, product, policyNumber, sumInsured: sumInsuredRaw ? Number(sumInsuredRaw) : null, premium, startDate, expiryDate, keyExclusions, actorName: session.name })
    revalidatePath(`/agency/clients/${clientId}`)
    return { success: `${product} recorded. Renewal reminders are scheduled automatically.` }
  } catch (error) {
    console.error('addPolicy failed', error instanceof Error ? error.message : error)
    return { error: 'Could not record the policy.' }
  }
}

export async function updateQuoteStageAction(clientId: string, quoteId: string, stage: string, premium: string): Promise<ActionState> {
  const session = await requireSession('agency')
  const stages: QuoteStage[] = ['requested', 'compared', 'proposed', 'accepted', 'placed', 'declined']
  if (!stages.includes(stage as QuoteStage)) return { error: 'Unknown quote stage.' }
  const estimate = premium ? Number(premium.replace(/[^\d.]/g, '')) : null
  try {
    await updateQuoteStage(session.oid, quoteId, stage as QuoteStage, estimate && estimate > 0 ? estimate : null)
    revalidatePath(`/agency/clients/${clientId}`)
    return { success: 'Quote updated. The client has been told.' }
  } catch (error) {
    console.error('updateQuoteStage failed', error instanceof Error ? error.message : error)
    return { error: 'Could not update the quote.' }
  }
}

export async function updateClaimStageAction(clientId: string, claimId: string, stage: string, amount: string, note: string): Promise<ActionState> {
  const session = await requireSession('agency')
  if (!CLAIM_STAGES.some((s) => s.id === stage)) return { error: 'Unknown claim stage.' }
  const value = amount ? Number(amount.replace(/[^\d.]/g, '')) : null
  try {
    await updateClaimStage(session.oid, claimId, stage as ClaimStage, value && value > 0 ? value : null, note.slice(0, 500))
    revalidatePath(`/agency/clients/${clientId}`)
    return { success: 'Claim updated. The client has been told.' }
  } catch (error) {
    console.error('updateClaimStage failed', error instanceof Error ? error.message : error)
    return { error: 'Could not update the claim.' }
  }
}

export async function messageClientAction(clientId: string, body: string): Promise<ActionState> {
  const session = await requireSession('agency')
  const text = body.trim().slice(0, 1000)
  if (text.length < 2) return { error: 'Write a message first.' }
  try {
    const result = await messageClient(session.oid, clientId, text, session.name)
    revalidatePath(`/agency/clients/${clientId}`)
    return result === 'sent' ? { success: 'Sent. It is in their portal and, if they have a number on file, on WhatsApp.' } : { error: 'This client has no portal account or phone number yet.' }
  } catch (error) {
    console.error('messageClient failed', error instanceof Error ? error.message : error)
    return { error: 'Could not send the message.' }
  }
}

export async function createClientAction(formData: FormData): Promise<ActionState> {
  const session = await requireSession('agency')
  const name = String(formData.get('name') ?? '').trim()
  const typeRaw = String(formData.get('type') ?? 'individual')
  const type = typeRaw === 'sme' || typeRaw === 'corporate' ? typeRaw : 'individual'
  const phoneInput = String(formData.get('phone') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim().toLowerCase() || null
  const notes = String(formData.get('notes') ?? '').trim() || null
  if (name.length < 2) return { error: 'Enter the client’s name.' }
  const phone = phoneInput ? normalizePhone(phoneInput) : null
  if (phoneInput && !phone) return { error: 'Enter a valid mobile number.' }
  let clientId: string
  try {
    const client = await createClient({ organizationId: session.oid, name, type, phone, email, notes, adviserName: session.name })
    clientId = client.id
  } catch (error) {
    console.error('createClient failed', error instanceof Error ? error.message : error)
    return { error: 'Could not add the client.' }
  }
  revalidatePath('/agency/clients')
  redirect(`/agency/clients/${clientId}`)
}

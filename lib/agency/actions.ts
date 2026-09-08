'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAgencyAdmin, requireSession } from '@/lib/auth/server'
import { normalizePhone } from '@/lib/format'
import { channelForOrganization, connectChannel, disconnectChannel, restartChannel } from '@/lib/whatsapp/channels'
import { dismissOnboarding } from '@/services/agency-onboarding'
import { inviteClient, inviteStaff, resetToTemporaryPassword } from '@/services/onboarding'
import { audit } from '@/services/audit'
import { createBusiness, reviewBusinessClaim } from '@/services/businesses'
import { answerEnquiry } from '@/services/enquiries'
import { enqueue, runJobs } from '@/services/jobs'
import { registerJobHandlers } from '@/services/jobs/handlers'
import { getUpload, markUploadReviewed } from '@/services/uploads'
import { getContact, setMode } from '@/services/conversations'
import { agentReply, resumeAssistant } from '@/services/handoff'
import { codeTaken, emailOrPhoneTaken, getUser, phoneTakenByOther, setUserActive, setUserRole, updateAiSettings, updateBranding, updateOrganization, userInOrganization } from '@/services/users'
import { runAgencyCommand } from '@/services/agency/commands'
import { completeTask } from '@/services/agency/dashboard'
import { addPolicy, createClient, messageClient, updateClaimStage, updateClientStage, updateQuoteStage } from '@/services/journey'
import type { ClaimStage, CommandResult, JourneyStage, QuoteStage, UploadKind } from '@/types/platform'
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
  const invite = formData.get('invite') === 'on' || formData.get('invite') === 'true'
  const message = String(formData.get('message') ?? '').trim().slice(0, 500) || null
  if (invite && !email) return { error: 'An email address is needed to send an invitation. Untick "Send an invitation" to record a lead only.' }
  let clientId: string
  try {
    const result = await inviteClient({ organizationId: session.oid, actor: { id: session.uid, name: session.name }, name, type, phone, email, notes, message, invite })
    clientId = result.clientId
  } catch (error) {
    console.error('createClient failed', error instanceof Error ? error.message : error)
    return { error: error instanceof Error && /platform administrator/.test(error.message) ? error.message : 'Could not add the client.' }
  }
  revalidatePath('/agency/clients')
  redirect(`/agency/clients/${clientId}?invited=${invite ? 1 : 0}`)
}

/* ---------- Conversations (WhatsApp handoff) ---------- */

export async function replyConversationAction(phone: string, body: string): Promise<ActionState> {
  const session = await requireSession('agency')
  const text = body.trim().slice(0, 2000)
  if (text.length < 1) return { error: 'Write a message first.' }
  try {
    const result = await agentReply(session.oid, { id: session.uid, name: session.name }, phone.replace(/\D/g, ''), text)
    revalidatePath(`/agency/conversations/${phone}`)
    if (result === 'forbidden') return { error: 'This conversation does not belong to your agency.' }
    return result === 'sent' ? { success: 'Sent on WhatsApp.' } : { error: 'WhatsApp did not accept the message. It is saved here; try again in a moment.' }
  } catch (error) {
    console.error('replyConversation failed', error instanceof Error ? error.message : error)
    return { error: 'Could not send the reply.' }
  }
}

export async function resumeAssistantAction(phone: string): Promise<ActionState> {
  const session = await requireSession('agency')
  try {
    const ok = await resumeAssistant(session.oid, session.uid, phone.replace(/\D/g, ''))
    revalidatePath(`/agency/conversations/${phone}`)
    revalidatePath('/agency/conversations')
    return ok ? { success: 'The assistant is back on this chat.' } : { error: 'This conversation does not belong to your agency.' }
  } catch (error) {
    console.error('resumeAssistant failed', error instanceof Error ? error.message : error)
    return { error: 'Could not hand the chat back.' }
  }
}

export async function takeOverConversationAction(phone: string): Promise<ActionState> {
  const session = await requireSession('agency')
  try {
    const digits = phone.replace(/\D/g, '')
    const contact = await getContact(digits)
    if (!contact || contact.organizationId !== session.oid) return { error: 'This conversation does not belong to your agency.' }
    await setMode(digits, 'human', session.uid)
    await audit({ organizationId: session.oid, actorUserId: session.uid, action: 'conversation.take-over', target: digits })
    revalidatePath(`/agency/conversations/${phone}`)
    return { success: 'You have this chat. The assistant stays quiet until you hand it back.' }
  } catch (error) {
    console.error('takeOver failed', error instanceof Error ? error.message : error)
    return { error: 'Could not take over the chat.' }
  }
}

/* ---------- Team (agency admins) ---------- */

export interface TeamActionState extends ActionState {
  field?: 'name' | 'email' | 'phone' | 'password'
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function inviteStaffAction(formData: FormData): Promise<TeamActionState> {
  const session = await requireAgencyAdmin()
  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const phoneInput = String(formData.get('phone') ?? '').trim()
  const title = String(formData.get('title') ?? '').trim() || null
  const role = formData.get('role') === 'agency_admin' ? 'agency_admin' : 'agency'
  if (name.length < 2) return { error: 'Enter the full name.', field: 'name' }
  if (!EMAIL.test(email)) return { error: 'Enter a valid email address.', field: 'email' }
  const phone = phoneInput ? normalizePhone(phoneInput) : null
  if (phoneInput && !phone) return { error: 'Enter a valid mobile number.', field: 'phone' }
  try {
    if (await phoneTakenByOther(phone, email)) return { error: 'That phone number is already on another account.', field: 'phone' }
    const { user, temporaryPassword, emailed, attached } = await inviteStaff({ organizationId: session.oid, actor: { id: session.uid, name: session.name }, name, email, phone, title, role })
    if (attached) {
      revalidatePath('/agency/team')
      return { success: `${user.name} already uses Super Agent and has been added to your agency. They sign in with their existing password${emailed ? ' (we emailed them)' : ''}.` }
    }
    revalidatePath('/agency/team')
    return { success: emailed ? `${user.name} has been emailed a temporary password (${temporaryPassword}) and will choose their own at first sign-in.` : `${user.name}'s temporary password is ${temporaryPassword}. Email could not be sent, so share it privately; they must change it at first sign-in.` }
  } catch (error) {
    console.error('inviteStaff failed', error instanceof Error ? error.message : error)
    return { error: 'Could not create the account.' }
  }
}

export async function resetStaffPasswordAction(userId: string): Promise<TeamActionState> {
  const session = await requireAgencyAdmin()
  if (!(await userInOrganization(userId, session.oid))) return { error: 'That person is not in your agency.' }
  try {
    const user = await getUser(userId)
    if (!user) return { error: 'Account not found.' }
    const { temporaryPassword, emailed } = await resetToTemporaryPassword(user, { id: session.uid, name: session.name }, session.oid)
    revalidatePath('/agency/team')
    return { success: emailed ? `A temporary password (${temporaryPassword}) was emailed to ${user.email}. They must change it at first sign-in.` : `Temporary password: ${temporaryPassword}. Email could not be sent; share it privately.` }
  } catch (error) {
    console.error('resetStaffPassword failed', error instanceof Error ? error.message : error)
    return { error: 'Could not reset the password.' }
  }
}

export async function setStaffActiveAction(userId: string, active: boolean): Promise<TeamActionState> {
  const session = await requireAgencyAdmin()
  if (userId === session.uid && !active) return { error: 'You cannot deactivate your own account.' }
  if (!(await userInOrganization(userId, session.oid))) return { error: 'That person is not in your agency.' }
  try {
    await setUserActive(userId, active)
    await audit({ organizationId: session.oid, actorUserId: session.uid, action: active ? 'user.activated' : 'user.deactivated', target: userId })
    revalidatePath('/agency/team')
    return { success: active ? 'Account reactivated.' : 'Account deactivated.' }
  } catch (error) {
    console.error('setStaffActive failed', error instanceof Error ? error.message : error)
    return { error: 'Could not update the account.' }
  }
}

export async function setStaffRoleAction(userId: string, role: 'agency' | 'agency_admin'): Promise<TeamActionState> {
  const session = await requireAgencyAdmin()
  if (userId === session.uid) return { error: 'Ask another admin to change your own role.' }
  if (!(await userInOrganization(userId, session.oid))) return { error: 'That person is not in your agency.' }
  try {
    await setUserRole(userId, role)
    await audit({ organizationId: session.oid, actorUserId: session.uid, action: 'user.role-changed', target: userId, detail: { role } })
    revalidatePath('/agency/team')
    return { success: role === 'agency_admin' ? 'Now an agency admin.' : 'Now agency staff.' }
  } catch (error) {
    console.error('setStaffRole failed', error instanceof Error ? error.message : error)
    return { error: 'Could not change the role.' }
  }
}

/* ---------- Settings (agency admins) ---------- */

export async function updateOrganizationSettingsAction(formData: FormData): Promise<ActionState> {
  const session = await requireAgencyAdmin()
  const name = String(formData.get('name') ?? '').trim()
  const shortName = String(formData.get('shortName') ?? '').trim()
  const code = String(formData.get('code') ?? '').trim().toUpperCase().replace(/[^A-Z0-9-]/g, '')
  const phone = String(formData.get('phone') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const greeting = String(formData.get('greeting') ?? '').trim().slice(0, 300) || null
  const licenceLabel = String(formData.get('licenceLabel') ?? '').trim().slice(0, 80) || null
  if (name.length < 2 || shortName.length < 2) return { error: 'Enter the agency name and a short name.' }
  if (code.length < 3 || code.length > 12) return { error: 'The join code needs 3 to 12 letters or digits.' }
  if (!EMAIL.test(email)) return { error: 'Enter a valid contact email.' }
  try {
    if (await codeTaken(code, session.oid)) return { error: 'That join code is used by another agency.' }
    await updateOrganization(session.oid, { name, shortName, code, phone, email, greeting, licenceLabel })
    await audit({ organizationId: session.oid, actorUserId: session.uid, action: 'organization.updated', target: session.oid })
    revalidatePath('/agency/settings')
    revalidatePath('/agency', 'layout')
    return { success: 'Settings saved.' }
  } catch (error) {
    console.error('updateOrganizationSettings failed', error instanceof Error ? error.message : error)
    return { error: 'Could not save the settings.' }
  }
}

/* ---------- Businesses and business claims ---------- */

export async function createBusinessAction(formData: FormData): Promise<ActionState> {
  const session = await requireSession('agency')
  const name = String(formData.get('name') ?? '').trim()
  const registrationNo = String(formData.get('registrationNo') ?? '').trim() || null
  const sector = String(formData.get('sector') ?? '').trim() || null
  const phoneInput = String(formData.get('phone') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim().toLowerCase() || null
  const address = String(formData.get('address') ?? '').trim() || null
  if (name.length < 2) return { error: 'Enter the business name.' }
  const phone = phoneInput ? normalizePhone(phoneInput) : null
  if (phoneInput && !phone) return { error: 'Enter a valid phone number.' }
  try {
    await createBusiness({ organizationId: session.oid, name, registrationNo, sector, phone, email, address, createdBy: session.uid, verified: true })
    revalidatePath('/agency/businesses')
    return { success: `${name} added. Clients can now find and claim it on WhatsApp or the portal.` }
  } catch (error) {
    console.error('createBusiness failed', error instanceof Error ? error.message : error)
    return { error: 'Could not add the business.' }
  }
}

export async function reviewBusinessClaimAction(claimId: string, decision: 'approved' | 'rejected', note: string): Promise<ActionState> {
  const session = await requireSession('agency')
  try {
    const claim = await reviewBusinessClaim(session.oid, claimId, decision, note.trim().slice(0, 500) || null, { id: session.uid, name: session.name })
    if (!claim) return { error: 'That claim is not pending or not in your agency.' }
    revalidatePath('/agency/businesses')
    return { success: decision === 'approved' ? `${claim.reference} approved. The applicant has been told.` : `${claim.reference} rejected. The applicant has been told.` }
  } catch (error) {
    console.error('reviewBusinessClaim failed', error instanceof Error ? error.message : error)
    return { error: 'Could not review the claim.' }
  }
}

/* ---------- Enquiries ---------- */

export async function answerEnquiryAction(enquiryId: string, answer: string): Promise<ActionState> {
  const session = await requireSession('agency')
  const text = answer.trim()
  if (text.length < 2) return { error: 'Write an answer first.' }
  try {
    const enquiry = await answerEnquiry(session.oid, enquiryId, text, { id: session.uid, name: session.name })
    if (!enquiry) return { error: 'That enquiry is not in your agency.' }
    revalidatePath('/agency/enquiries')
    return { success: `Answered ${enquiry.reference}. The person has been told on WhatsApp and in their portal.` }
  } catch (error) {
    console.error('answerEnquiry failed', error instanceof Error ? error.message : error)
    return { error: 'Could not send the answer.' }
  }
}

/* ---------- Documents (uploads) ---------- */

export async function reviewUploadAction(uploadId: string, kind: string): Promise<ActionState> {
  const session = await requireSession('agency')
  const kinds = ['id', 'policy', 'claim', 'vehicle', 'receipt', 'photo', 'form', 'other']
  try {
    await markUploadReviewed(session.oid, uploadId, session.uid, kinds.includes(kind) ? (kind as UploadKind) : undefined)
    await audit({ organizationId: session.oid, actorUserId: session.uid, action: 'upload.reviewed', target: uploadId })
    revalidatePath('/agency/documents')
    return { success: 'Marked as reviewed.' }
  } catch (error) {
    console.error('reviewUpload failed', error instanceof Error ? error.message : error)
    return { error: 'Could not update the document.' }
  }
}

export async function retryUploadAction(uploadId: string): Promise<ActionState> {
  const session = await requireSession('agency')
  try {
    const upload = await getUpload(session.oid, uploadId)
    if (!upload) return { error: 'Not found.' }
    const { getSql } = await import('@/lib/db/client')
    await getSql()`UPDATE uploads SET ocr_status = 'queued', updated_at = now() WHERE id = ${uploadId}`
    await enqueue({ type: 'ocr-upload', organizationId: session.oid, payload: { uploadId }, idempotencyKey: `ocr:${uploadId}:${Date.now()}` })
    registerJobHandlers()
    await runJobs(2, 120_000)
    revalidatePath('/agency/documents')
    return { success: 'Reading the document again.' }
  } catch (error) {
    console.error('retryUpload failed', error instanceof Error ? error.message : error)
    return { error: 'Could not retry.' }
  }
}

/* ---------- Branding, AI configuration, reminders (agency admins) ---------- */

export async function updateBrandingAction(formData: FormData): Promise<ActionState> {
  const session = await requireAgencyAdmin()
  const colour = (v: FormDataEntryValue | null) => {
    const s = String(v ?? '').trim()
    return /^#[0-9a-f]{6}$/i.test(s) ? s.toLowerCase() : ''
  }
  const url = (v: FormDataEntryValue | null) => {
    const s = String(v ?? '').trim()
    return /^https:\/\/[^\s]+$/i.test(s) ? s.slice(0, 300) : ''
  }
  const branding = {
    primary: colour(formData.get('primary')),
    accent: colour(formData.get('accent')),
    logoUrl: url(formData.get('logoUrl')),
    supportEmail: String(formData.get('supportEmail') ?? '').trim().toLowerCase().slice(0, 120),
    supportPhone: String(formData.get('supportPhone') ?? '').trim().slice(0, 40),
    website: url(formData.get('website')),
    footerNote: String(formData.get('footerNote') ?? '').trim().slice(0, 300),
  }
  const days = String(formData.get('reminderDays') ?? '')
    .split(/[,\s]+/)
    .map((d) => Number(d))
    .filter((d) => Number.isInteger(d) && d >= 0 && d <= 365)
  try {
    await updateBranding(session.oid, branding, days.length ? Array.from(new Set(days)).sort((a, b) => b - a) : [30, 14, 7, 1])
    await audit({ organizationId: session.oid, actorUserId: session.uid, action: 'organization.branding-updated', target: session.oid })
    revalidatePath('/agency/settings')
    return { success: 'Branding and reminders saved. New emails use them from now on.' }
  } catch (error) {
    console.error('updateBranding failed', error instanceof Error ? error.message : error)
    return { error: 'Could not save the branding.' }
  }
}

export async function updateAiSettingsAction(formData: FormData): Promise<ActionState> {
  const session = await requireAgencyAdmin()
  const text = (k: string, max: number) => String(formData.get(k) ?? '').trim().slice(0, max)
  try {
    await updateAiSettings(session.oid, {
      assistantName: text('assistantName', 40),
      tone: text('tone', 300),
      services: text('services', 4000),
      faqs: text('faqs', 6000),
      escalation: text('escalation', 1500),
      doNotSay: text('doNotSay', 1000),
      useGeneralCatalogue: formData.get('useGeneralCatalogue') !== 'off',
    })
    await audit({ organizationId: session.oid, actorUserId: session.uid, action: 'organization.ai-updated', target: session.oid })
    revalidatePath('/agency/ai')
    return { success: 'Assistant settings saved. The next conversation uses them.' }
  } catch (error) {
    console.error('updateAiSettings failed', error instanceof Error ? error.message : error)
    return { error: 'Could not save the assistant settings.' }
  }
}

/* ---------- WhatsApp channel (agency admins) ---------- */

export async function connectWhatsAppAction(label: string): Promise<ActionState> {
  const session = await requireAgencyAdmin()
  try {
    await connectChannel(session.oid, session.uid, label.trim().slice(0, 60) || null)
    revalidatePath('/agency/whatsapp')
    return { success: 'Session created. Scan the QR code with the phone that holds your agency number.' }
  } catch (error) {
    console.error('connectWhatsApp failed', error instanceof Error ? error.message : error)
    return { error: error instanceof Error ? error.message : 'Could not create the WhatsApp session.' }
  }
}

export async function restartWhatsAppAction(): Promise<ActionState> {
  const session = await requireAgencyAdmin()
  try {
    const channel = await channelForOrganization(session.oid)
    if (!channel) return { error: 'No WhatsApp number is connected yet.' }
    await restartChannel(channel)
    await audit({ organizationId: session.oid, actorUserId: session.uid, action: 'whatsapp.channel-restarted', target: channel.id })
    revalidatePath('/agency/whatsapp')
    return { success: 'Restarting the session. Give it a minute.' }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Could not restart the session.' }
  }
}

export async function disconnectWhatsAppAction(): Promise<ActionState> {
  const session = await requireAgencyAdmin()
  try {
    const channel = await channelForOrganization(session.oid)
    if (!channel) return { error: 'No WhatsApp number is connected.' }
    await disconnectChannel(channel, session.uid)
    revalidatePath('/agency/whatsapp')
    return { success: 'Number disconnected. Clients now reach you through the shared Super Agent number with your join code.' }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Could not disconnect.' }
  }
}

/** Hides the setup checklist from Today. The page itself stays at /agency/onboarding. */
export async function dismissOnboardingAction(): Promise<ActionState> {
  const session = await requireSession('agency')
  await dismissOnboarding(session.oid)
  revalidatePath('/agency/today')
  return { success: 'Hidden. Finish setting up any time from Settings.' }
}

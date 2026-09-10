'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAgencyAdmin } from '@/lib/auth/server'
import { cancelCampaign, createCampaign, launchCampaign, resolveAudience, suppress, unsuppress, updateCampaign } from '@/services/campaigns'
import { LARGE_CAMPAIGN } from '@/lib/campaigns/limits'
import type { CampaignAudience, CampaignChannel } from '@/types/campaigns'

/**
 * Campaign actions. Composing and launching are separate on purpose: a
 * campaign is saved as a draft, the agency sees exactly how many people it
 * will reach, and only an explicit launch (with a typed confirmation for
 * large audiences) starts the background send.
 */

export interface CampaignState {
  error?: string
  success?: string
  field?: string
  /** How many people the audience resolves to, for the confirmation step. */
  audienceSize?: number
}

function readAudience(formData: FormData): CampaignAudience {
  const stages = formData.getAll('stages').map(String).filter(Boolean)
  const types = formData.getAll('types').map(String).filter(Boolean)
  const expiring = Number(formData.get('expiringWithinDays') ?? 0)
  const clientIds = formData.getAll('clientIds').map(String).filter(Boolean)
  return {
    stages: stages.length ? stages : undefined,
    types: types.length ? types : undefined,
    expiringWithinDays: Number.isFinite(expiring) && expiring > 0 ? expiring : null,
    clientIds: clientIds.length ? clientIds : undefined,
    includeLeads: formData.get('includeLeads') === 'on',
    includeNumbers: formData.get('includeNumbers') === 'on',
    numberLists: formData.getAll('numberLists').map(String).filter(Boolean),
  }
}

function readCampaign(formData: FormData) {
  const channelRaw = String(formData.get('channel') ?? 'email')
  const channel: CampaignChannel = channelRaw === 'whatsapp' ? 'whatsapp' : channelRaw === 'both' ? 'both' : 'email'
  return {
    name: String(formData.get('name') ?? '').trim(),
    channel,
    subject: String(formData.get('subject') ?? '').trim() || null,
    body: String(formData.get('body') ?? '').trim(),
    ctaLabel: String(formData.get('ctaLabel') ?? '').trim() || null,
    ctaUrl: String(formData.get('ctaUrl') ?? '').trim() || null,
    scheduledAt: String(formData.get('scheduledAt') ?? '').trim() || null,
    audience: readAudience(formData),
  }
}

function validate(input: ReturnType<typeof readCampaign>): CampaignState | null {
  if (input.name.length < 3) return { error: 'Give the campaign a name you will recognise later.', field: 'name' }
  if (input.body.trim().length < 10) return { error: 'Write the message you want to send.', field: 'body' }
  if ((input.channel === 'email' || input.channel === 'both') && !input.subject) return { error: 'An email needs a subject line.', field: 'subject' }
  if (input.ctaUrl && !/^https?:\/\//i.test(input.ctaUrl)) return { error: 'The button link must start with http:// or https://', field: 'ctaUrl' }
  if (input.ctaUrl && !input.ctaLabel) return { error: 'Give the button a label.', field: 'ctaLabel' }
  if (input.scheduledAt && Number.isNaN(Date.parse(input.scheduledAt))) return { error: 'That schedule date is not valid.', field: 'scheduledAt' }
  return null
}

export async function createCampaignAction(formData: FormData): Promise<CampaignState> {
  const session = await requireAgencyAdmin()
  const input = readCampaign(formData)
  const invalid = validate(input)
  if (invalid) return invalid
  let id: string
  try {
    const campaign = await createCampaign({ organizationId: session.oid, actor: { id: session.uid, name: session.name }, ...input })
    id = campaign.id
  } catch (error) {
    console.error('createCampaign failed', error instanceof Error ? error.message : error)
    return { error: 'Could not save the campaign.' }
  }
  revalidatePath('/agency/campaigns')
  redirect(`/agency/campaigns/${id}?created=1`)
}

export async function updateCampaignAction(id: string, formData: FormData): Promise<CampaignState> {
  const session = await requireAgencyAdmin()
  const input = readCampaign(formData)
  const invalid = validate(input)
  if (invalid) return invalid
  try {
    const updated = await updateCampaign(session.oid, id, input)
    if (!updated) return { error: 'That campaign does not belong to your agency.' }
    revalidatePath(`/agency/campaigns/${id}`)
    return { success: input.scheduledAt ? 'Saved and scheduled.' : 'Saved as a draft.' }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Could not save the campaign.' }
  }
}

/** "This will reach N people" — the same resolution the send uses. */
export async function previewAudienceAction(formData: FormData): Promise<CampaignState> {
  const session = await requireAgencyAdmin()
  const audience = readAudience(formData)
  const members = await resolveAudience(session.oid, audience)
  const channel = String(formData.get('channel') ?? 'email')
  const reachable = members.filter((m) => (channel === 'whatsapp' ? m.phone : channel === 'both' ? m.email || m.phone : m.email))
  return { audienceSize: reachable.length, success: `${reachable.length} of your ${members.length} matching clients can be reached this way.` }
}

export async function launchCampaignAction(id: string, formData: FormData): Promise<CampaignState> {
  const session = await requireAgencyAdmin()
  const confirm = String(formData.get('confirm') ?? '').trim()
  const expected = Number(formData.get('expected') ?? 0)
  if (expected >= LARGE_CAMPAIGN && confirm !== String(expected)) {
    return { error: `This reaches ${expected} people. Type ${expected} in the confirmation box to send it.`, field: 'confirm' }
  }
  try {
    const result = await launchCampaign(session.oid, id, { id: session.uid, name: session.name })
    if (!result) return { error: 'That campaign does not belong to your agency.' }
    revalidatePath(`/agency/campaigns/${id}`)
    revalidatePath('/agency/campaigns')
    if (result.recipients === 0) return { error: 'Nobody in that audience can be reached on this channel. Check the filters and contact details.' }
    return { success: `Sending to ${result.recipients} ${result.recipients === 1 ? 'person' : 'people'} now${result.skipped ? `; ${result.skipped} skipped for opting out` : ''}. You can close this page.` }
  } catch (error) {
    console.error('launchCampaign failed', error instanceof Error ? error.message : error)
    return { error: 'Could not start the campaign.' }
  }
}

export async function cancelCampaignAction(id: string): Promise<CampaignState> {
  const session = await requireAgencyAdmin()
  await cancelCampaign(session.oid, id, { id: session.uid, name: session.name })
  revalidatePath(`/agency/campaigns/${id}`)
  revalidatePath('/agency/campaigns')
  return { success: 'Campaign cancelled. Anything already sent has gone.' }
}

export async function suppressAction(formData: FormData): Promise<CampaignState> {
  const session = await requireAgencyAdmin()
  const channel = String(formData.get('channel') ?? 'email') === 'whatsapp' ? 'whatsapp' : 'email'
  const address = String(formData.get('address') ?? '').trim()
  if (!address) return { error: 'Enter the email address or number to suppress.', field: 'address' }
  await suppress(session.oid, channel, address, `added by ${session.name}`)
  revalidatePath('/agency/campaigns')
  return { success: `${address} will not receive campaigns from your agency.` }
}

export async function unsuppressAction(formData: FormData): Promise<CampaignState> {
  const session = await requireAgencyAdmin()
  const channel = String(formData.get('channel') ?? 'email') === 'whatsapp' ? 'whatsapp' : 'email'
  const address = String(formData.get('address') ?? '').trim()
  await unsuppress(session.oid, channel, address)
  revalidatePath('/agency/campaigns')
  return { success: `${address} can receive campaigns again.` }
}

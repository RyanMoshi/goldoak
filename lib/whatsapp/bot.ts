import { advanceFlow, backFlow, cancelFlow, currentPrompt, helpFor, restartFlow, startFlow, type Flow, type FlowContext, type FlowState } from '@/lib/conversation/engine'
import { FLOWS, activeOrganizations, joinFlow, matchProduct } from '@/lib/conversation/flows'
import { bold, formatIntl, handoffReply, helpText, italic, mainMenu, menuBlock, options, processingUpload, success, welcome } from '@/lib/conversation/messages'
import { getSql } from '@/lib/db/client'
import { ensureSchema } from '@/lib/db/migrate'
import { daysUntil, formatKES, formatShortDate } from '@/lib/format'
import { isStaffRole } from '@/lib/auth/session'
import { storageConfigured } from '@/lib/storage/supabase'
import { getProvider, sendWhatsApp, type InboundMessage } from '@/lib/whatsapp/provider'
import { runAgencyCommand } from '@/services/agency/commands'
import { consult } from '@/services/consult'
import { appendMessage, getContact, linkContact, minutesSince, recentMessages, setMode, setWorkflow, touchContact, workflowExpired } from '@/services/conversations'
import { requestHandoff } from '@/services/handoff'
import { registerJobHandlers } from '@/services/jobs/handlers'
import { runJobs } from '@/services/jobs'
import { clientForUser } from '@/services/journey'
import { clearPaused, memoryContext, noteInbound, rememberFact, understand, type Intent } from '@/services/memory'
import { listNotifications, markAllRead, notifyOrganization } from '@/services/notifications'
import { getPortalData } from '@/services/portal'
import { listRequests } from '@/services/requests'
import { confirmUpload, extractedLines, getUpload, storeUpload, uploadAllowed } from '@/services/uploads'
import { getMembership } from '@/services/memberships'
import { findUserByPhone, getOrganization, getOrganizationByCode, updateUserEmail } from '@/services/users'
import { CLAIM_STAGES, JOURNEY_STAGES, type Organization, type PortalData, type PublicUser, type WhatsAppContact } from '@/types/platform'

/**
 * The Super Agent WhatsApp conversation.
 *
 * One shared number serves every agency. Each inbound message is routed to a
 * tenant (the person's account → the saved contact → a JOIN code → a choice),
 * then handled by: a human adviser (handoff), a running workflow, a media
 * upload, the consultation assistant, or the menu. Free text goes through
 * `understand()` so "sign me up", "1" and "I want to register" all start the
 * same structured workflow; the workflow engine, not the model, runs the steps.
 * Every action calls the same services the website uses.
 */

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://goldoak.vercel.app'

export interface InboundResult {
  replies: string[]
  userId: string | null
  organizationId: string | null
  /** False when a person is handling the chat and the assistant stayed quiet. */
  answered: boolean
}

/** Full handling of one inbound message. Returns the replies to send. `channelOrganizationId` is set when the message arrived on an agency's own number. */
export async function handleInbound(message: InboundMessage, channelOrganizationId: string | null = null): Promise<InboundResult> {
  await ensureSchema()
  const phone = message.phone
  const text = (message.text ?? '').trim().slice(0, 4000)
  const before = await getContact(phone)
  const gapMinutes = minutesSince(before?.lastInboundAt ?? null)
  let contact = await touchContact(phone, message.name ?? null)
  let user = await findUserByPhone(phone)

  if (channelOrganizationId) {
    // The agency's own number: this conversation belongs to that agency, whatever the contact was linked to before.
    if (user && user.organizationId !== channelOrganizationId && !(await getMembership(user.id, channelOrganizationId))) user = null
    if (contact.organizationId !== channelOrganizationId || (user && contact.userId !== user.id)) {
      await linkContact(phone, { organizationId: channelOrganizationId, userId: user?.id ?? null })
      contact = (await getContact(phone)) ?? contact
    }
  } else if (user && (contact.userId !== user.id || (user.organizationId && contact.organizationId !== user.organizationId))) {
    await linkContact(phone, { userId: user.id, organizationId: user.organizationId ?? contact.organizationId })
    contact = (await getContact(phone)) ?? contact
  }

  const logged = text || (message.media ? `[${message.media.kind}${message.media.filename ? `: ${message.media.filename}` : ''}]` : '')
  await appendMessage({ phone, organizationId: contact.organizationId, userId: user?.id ?? null, direction: 'in', role: 'user', body: logged })
  await noteInbound(phone, contact.organizationId)

  let result: InboundResult
  try {
    result = await route(phone, text, message, contact, user, gapMinutes)
  } catch (error) {
    console.error('route failed', error instanceof Error ? `${error.message} ${error.stack?.split('\n')[1] ?? ''}` : error)
    result = { replies: ['Something went wrong on our side. Nothing was lost. Please try again in a moment, or reply 7 to talk to a person.'], userId: user?.id ?? null, organizationId: contact.organizationId, answered: true }
  }
  for (const reply of result.replies) {
    await appendMessage({ phone, organizationId: result.organizationId, userId: user?.id ?? null, direction: 'out', role: 'assistant', body: reply })
  }
  return result
}

/** Background path (from the webhook): handle, send, then drain any jobs that were queued. */
export async function processInbound(payload: { message: InboundMessage; channelOrganizationId?: string | null }): Promise<void> {
  registerJobHandlers()
  const result = await handleInbound(payload.message, payload.channelOrganizationId ?? null)
  for (const reply of result.replies) await sendWhatsApp(payload.message.phone, reply, result.organizationId)
  await runJobs(5, 200_000)
}

/* ---------- Routing ---------- */

async function route(phone: string, text: string, message: InboundMessage, contact: WhatsAppContact, user: PublicUser | null, gapMinutes = 0): Promise<InboundResult> {
  const lower = text.toLowerCase()
  const base = { userId: user?.id ?? null, organizationId: contact.organizationId, answered: true }

  // Staff use the number as a command line for their own workspace.
  if (user && isStaffRole(user.role)) {
    const orgId = user.organizationId ?? contact.organizationId ?? 'org_goldoak'
    return { ...base, organizationId: orgId, replies: [await staffReply(user, orgId, text)] }
  }

  // 1. Tenant resolution.
  let organization = contact.organizationId ? await getOrganization(contact.organizationId) : null
  const firstContact = !contact.consentedAt
  if (!organization) {
    const joinCode = lower.match(/^(?:join|agency|code)\s+([a-z0-9-]{3,20})$/i)?.[1] ?? (/^[a-z0-9-]{4,20}$/i.test(text) && !/^\d+$/.test(text) ? text : null)
    const byCode = joinCode ? await getOrganizationByCode(joinCode) : null
    if (byCode) {
      await linkContact(phone, { organizationId: byCode.id })
      await markConsented(phone)
      return { ...base, organizationId: byCode.id, replies: [welcome(byCode.name, byCode.greeting, SITE, Boolean(user), user?.name.split(' ')[0])] }
    }
    const orgs = await activeOrganizations()
    if (orgs.length === 1) {
      organization = orgs[0]
      await linkContact(phone, { organizationId: organization.id })
    } else if (orgs.length === 0) {
      return { ...base, replies: ['Super Agent is not open to new conversations yet. Please try again later.'] }
    } else {
      const flow = joinFlow(orgs)
      const ctx: FlowContext = { phone, organization: null, user, client: null }
      const state = contact.workflow === 'join' && contact.step != null && !workflowExpired(contact) ? { step: contact.step, data: contact.data } : null
      const outcome = state ? await advanceFlow(flow, ctx, state, text) : await startFlow(flow, ctx)
      await setWorkflow(phone, outcome.state ? 'join' : null, outcome.state?.step ?? null, outcome.state?.data ?? {})
      if (outcome.done) {
        const linked = await getContact(phone)
        const org = linked?.organizationId ? await getOrganization(linked.organizationId) : null
        if (org) {
          await markConsented(phone)
          return { ...base, organizationId: org.id, replies: [outcome.reply, welcome(org.name, org.greeting, SITE, Boolean(user), user?.name.split(' ')[0])] }
        }
      }
      return { ...base, replies: [outcome.reply] }
    }
  }

  const org = organization
  const client = user ? await clientForUser(user.id) : null
  const ctx: FlowContext = { phone, organization: org, user, client }
  const scoped = { ...base, organizationId: org.id }
  const registered = Boolean(user)
  const first = user?.name.split(' ')[0]

  // 2. A person is handling this chat.
  if (contact.mode === 'human') {
    if (/^(menu|0|assistant|bot|resume)$/.test(lower)) {
      await setMode(phone, 'ai')
      return { ...scoped, replies: [`Back with the assistant.\n\n${mainMenu(org.shortName, registered, first)}`] }
    }
    const who = client?.name ?? user?.name ?? contact.displayName ?? formatIntl(phone)
    await notifyOrganization(org.id, { clientId: client?.id ?? null, kind: 'message', title: `WhatsApp from ${who}`, body: (text || `[${message.media?.kind ?? 'attachment'}]`).slice(0, 300), reference: `wa-human:${phone}:${Date.now()}`, inAppOnly: true })
    if (message.media) await handleMedia(message, org, user, client, true)
    const history = await recentMessages(phone, org.id, 6)
    const recentAck = history.some((m) => m.direction === 'out' && Date.now() - new Date(m.at).getTime() < 30 * 60 * 1000)
    if (recentAck) return { ...scoped, replies: [], answered: false }
    return { ...scoped, replies: [`Thanks, your message has reached ${org.shortName}. An adviser will reply here shortly.\n\n${italic('Reply MENU to use the assistant meanwhile.')}`] }
  }

  // 3. Media (photos, documents, voice notes).
  if (message.media) {
    const replies = await handleMedia(message, org, user, client, false)
    return { ...scoped, replies }
  }

  // 4. First contact: welcome with consent, unless they already typed something actionable.
  if (firstContact) {
    await markConsented(phone)
    const u = await understand(text, { registered, inFlow: null })
    if (u.intent === 'greeting' || u.intent === 'menu' || u.intent === 'unknown' || u.intent === 'thanks' || u.confidence < 0.6) {
      return { ...scoped, replies: [welcome(org.name, org.greeting, SITE, registered, first)] }
    }
    const replies = await dispatch(u.intent, u.value, text, ctx, contact)
    return { ...scoped, replies: [welcome(org.name, org.greeting, SITE, registered, first), ...replies] }
  }

  // 5. Running workflow, global commands, interruptions.
  const running = contact.workflow && contact.workflow !== 'join' && !workflowExpired(contact) ? contact.workflow : null
  const flow = running && FLOWS[running] && contact.step != null ? FLOWS[running] : null
  const state: FlowState | null = flow ? { step: contact.step as number, data: contact.data } : null

  // A bare digit outside a form is a menu choice (or a mini-state answer): no model call needed.
  if (!flow && /^\d$/.test(lower)) {
    if (running === 'assist-pick') {
      const pick: Intent | null = lower === '1' ? 'quote' : lower === '2' ? 'question' : lower === '3' ? 'claim' : null
      if (pick) {
        await setWorkflow(phone, null, null, {})
        return { ...scoped, replies: await dispatch(pick, undefined, text, ctx, contact) }
      }
    }
    if (running === 'upload-confirm' && contact.data.uploadId) {
      const done = await confirmStep(phone, org, String(contact.data.uploadId), text)
      if (done) return { ...scoped, replies: [done] }
    }
    if (lower === '0') {
      await setWorkflow(phone, null, null, {})
      return { ...scoped, replies: [mainMenu(org.shortName, registered, first)] }
    }
    const numbered = menuIntent(lower, registered)
    if (numbered) {
      if (running) await setWorkflow(phone, null, null, {})
      return { ...scoped, replies: await dispatch(numbered, undefined, text, ctx, contact) }
    }
  }

  const understood = await understand(text, { registered, inFlow: running })

  if (understood.intent === 'cancel') {
    await setWorkflow(phone, null, null, {})
    await clearPaused(contact)
    if (flow || running) return { ...scoped, replies: [cancelFlow().reply] }
    return { ...scoped, replies: [`Nothing to cancel.\n\n${mainMenu(org.shortName, registered, first)}`] }
  }
  if (understood.intent === 'menu' && !(flow && /^\d$/.test(lower) && lower !== '0')) {
    await setWorkflow(phone, null, null, {})
    return { ...scoped, replies: [mainMenu(org.shortName, registered, first)] }
  }
  if (understood.intent === 'help') {
    if (flow && state) return { ...scoped, replies: [helpFor(flow, state)] }
    return { ...scoped, replies: [helpText(org.shortName, registered, SITE)] }
  }
  if (understood.intent === 'agent') {
    await setWorkflow(phone, null, null, {})
    await requestHandoff({ phone, organization: org, user, client, reason: 'Asked for an adviser on WhatsApp.', displayName: contact.displayName })
    return { ...scoped, replies: [handoffReply(org.shortName, client?.adviserName ?? null, org.phone)] }
  }

  if (flow && state) {
    // Coming back hours or days later: remind them where we were instead of treating the greeting as an answer.
    if (gapMinutes >= 360 && (understood.intent === 'greeting' || understood.intent === 'unknown' || understood.intent === 'thanks') && text.length < 40) {
      const back = await currentPrompt(flow, ctx, state)
      return { ...scoped, replies: [`${bold(`Welcome back${first ? `, ${first}` : ''}`)}\nWe were in the middle of ${flow.title.toLowerCase()}. Your answers so far are saved. Here is where we were:\n\n${back}\n\n${italic('Reply CANCEL to drop it, or MENU for other options.')}`] }
    }
    if (understood.intent === 'back') return { ...scoped, replies: [await persist(phone, flow, await backFlow(flow, ctx, state))] }
    if (understood.intent === 'restart') return { ...scoped, replies: [await persist(phone, flow, await restartFlow(flow, ctx, presetFor(flow, state)))] }
    const outcome = await safeAdvance(flow, ctx, state, text)
    // An interruption: the answer did not fit the step but reads as a question. Answer it, then return to the step.
    if (outcome.state && outcome.state.step === state.step && /^⚠️/.test(outcome.reply) && (understood.intent === 'question' || understood.intent === 'assistance') && understood.confidence >= 0.6 && text.length > 12) {
      const answer = await answerQuestion(phone, org, user, client, text, contact)
      const back = await currentPrompt(flow, ctx, state)
      return { ...scoped, replies: [answer, `${bold(`Back to ${flow.title.toLowerCase()}`)}\n\n${back}`] }
    }
    return { ...scoped, replies: [await persist(phone, flow, outcome)] }
  }

  // 6. Consultation mode: free questions until MENU. A greeting after a long gap goes back to the menu.
  if (running === 'consult' && gapMinutes >= 360 && understood.intent === 'greeting') {
    await setWorkflow(phone, null, null, {})
    return { ...scoped, replies: [mainMenu(org.shortName, registered, first)] }
  }
  if (running === 'consult') {
    if (['question', 'assistance', 'unknown', 'status', 'greeting', 'thanks'].includes(understood.intent)) {
      return { ...scoped, replies: [await answerQuestion(phone, org, user, client, text, contact)] }
    }
  }

  // 7. Waiting for a document.
  if (running === 'upload-wait' && (understood.intent === 'unknown' || understood.intent === 'upload')) {
    return { ...scoped, replies: ['Send the document as a photo or PDF in this chat. Reply CANCEL if you no longer want to.'] }
  }

  // 8. Confirming what we read from a document.
  if (running === 'upload-confirm' && contact.data.uploadId) {
    const done = await confirmStep(phone, org, String(contact.data.uploadId), text)
    if (done) return { ...scoped, replies: [done] }
  }
  if (running === 'upload-correct' && contact.data.uploadId) {
    await confirmUpload(String(contact.data.uploadId), org.id, false, { correction: text.slice(0, 500) })
    await setWorkflow(phone, null, null, {})
    return { ...scoped, replies: [success('Correction noted', ['An adviser will update the details.', '', 'Reply 5 to upload another document, or MENU.'])] }
  }

  // 9. Sub-menu: insurance assistance answered in words.
  if (running === 'assist-pick' && (understood.intent === 'quote' || understood.intent === 'question' || understood.intent === 'claim')) {
    await setWorkflow(phone, null, null, {})
    return { ...scoped, replies: await dispatch(understood.intent, understood.value, text, ctx, contact) }
  }

  // 10. Understood intents.
  return { ...scoped, replies: await dispatch(understood.intent, understood.value, text, ctx, contact) }
}

function presetFor(flow: Flow, state: FlowState) {
  return flow.id === 'name-change' ? { newName: state.data.newName } : {}
}

async function persist(phone: string, flow: Flow, outcome: { reply: string; state: FlowState | null }): Promise<string> {
  await setWorkflow(phone, outcome.state ? flow.id : null, outcome.state?.step ?? null, outcome.state?.data ?? {})
  return outcome.reply
}

async function safeAdvance(flow: Flow, ctx: FlowContext, state: FlowState, text: string) {
  try {
    return await advanceFlow(flow, ctx, state, text)
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error)
    console.error(`flow ${flow.id} failed`, detail)
    const friendly = /already on another account|already has an account/.test(detail) ? detail : 'Something went wrong on our side while saving that. Nothing was lost on your end.'
    const debug = (globalThis as { __superAgentDebug?: boolean }).__superAgentDebug ? ` [debug: ${detail.slice(0, 400)}]` : ''
    return { reply: `⚠️ ${friendly} Reply RESTART to try again, or 7 to talk to an adviser.${debug}`, state }
  }
}

async function markConsented(phone: string): Promise<void> {
  const sql = getSql()
  await sql`UPDATE whatsapp_contacts SET consented_at = COALESCE(consented_at, now()) WHERE phone = ${phone}`
}

function menuIntent(lower: string, registered: boolean): Intent | null {
  const map: Record<string, Intent> = registered
    ? { '1': 'status', '2': 'claim_business', '3': 'assistance', '4': 'enquiry', '5': 'upload', '6': 'check_request', '7': 'agent', '8': 'help', '9': 'claim' }
    : { '1': 'signup', '2': 'claim_business', '3': 'assistance', '4': 'enquiry', '5': 'upload', '6': 'check_request', '7': 'agent', '8': 'help' }
  return map[lower] ?? null
}

/* ---------- Intent dispatch ---------- */

async function dispatch(intent: Intent, value: string | undefined, text: string, ctx: FlowContext, contact: WhatsAppContact): Promise<string[]> {
  const { phone, organization: org, user, client } = ctx
  if (!org) return ['Choose your agency first. Reply MENU.']
  const registered = Boolean(user)
  const first = user?.name.split(' ')[0]

  switch (intent) {
    case 'signup': {
      if (user) return [`You already have an account, ${first}. Sign in at ${SITE}/signin with ${user.email}.\n\n${mainMenu(org.shortName, true, first)}`]
      return [await start(phone, FLOWS.signup, ctx)]
    }
    case 'claim_business':
      return [await start(phone, FLOWS['claim-business'], ctx)]
    case 'enquiry':
      return [await start(phone, FLOWS.enquiry, ctx, user ? { name: user.name } : {})]
    case 'assistance': {
      await setWorkflow(phone, 'assist-pick', null, {})
      return [menuBlock('Insurance assistance', ['Ask for a quote', 'Ask a question about cover', 'Report a claim'], 'Reply with a number. You can also just type your question.')]
    }
    case 'upload': {
      if (!storageConfigured()) return [`Document uploads are not switched on yet. Reply 4 to make an enquiry and an adviser will collect your documents.`]
      await setWorkflow(phone, 'upload-wait', null, {})
      return [[bold('Upload a document'), 'Send the document as a photo or PDF in this chat: ID, logbook, policy schedule, claim form, receipt, or a photo of the damage.', '', 'I read it, show you what I found, and you confirm before anything is saved to your file.', '', italic('Reply CANCEL to go back.')].join('\n')]
    }
    case 'check_request': {
      const items = await listRequests(org.id, phone, client?.id ?? null)
      if (!items.length) return [`No requests on file yet${user ? '' : ' for this number'}.\n\n${mainMenu(org.shortName, registered, first)}`]
      return [[bold('Your requests'), '', ...items.map((i) => `• ${bold(i.reference)} ${i.title}\n  ${i.status}${i.detail ? ` · ${i.detail}` : ''} · ${formatShortDate(i.createdAt)}`), '', italic('Reply MENU for other options, or 7 to talk to an adviser about any of these.')].join('\n')]
    }
    case 'agent': {
      await requestHandoff({ phone, organization: org, user, client, reason: 'Asked for an adviser on WhatsApp.', displayName: contact.displayName })
      return [handoffReply(org.shortName, client?.adviserName ?? null, org.phone)]
    }
    case 'help':
      return [helpText(org.shortName, registered, SITE)]
    case 'status': {
      if (!user) return [`Reply 1 to create your account, then I can show you where things stand.\n\n${mainMenu(org.shortName, false)}`]
      const data = await getPortalData(user.id)
      return [data ? statusReply(first ?? 'there', data) : 'We could not load your account right now. Please try again in a moment.']
    }
    case 'quote': {
      if (!user || !client) return [`To ask for a quote I need an account first. Reply 1 to sign up (two minutes), or 3 then 2 to ask a question without an account.`]
      const product = /^\d+$/.test(text.trim()) ? null : matchProduct(text.replace(/^(quote|request|i need|i want|get me|cover for|insure)\s*/i, ''))
      const outcome = await startFlow(FLOWS.quote, ctx)
      if (product && outcome.state) {
        const advanced = await advanceFlow(FLOWS.quote, ctx, outcome.state, product)
        return [await persist(phone, FLOWS.quote, advanced)]
      }
      return [await persist(phone, FLOWS.quote, outcome)]
    }
    case 'claim': {
      if (!user || !client) return [`To report a claim I need to find your policy, so please reply 1 to create your account first, or 7 to talk to an adviser now.`]
      const data = await getPortalData(user.id)
      const live = (data?.policies ?? []).filter((p) => p.status === 'live' || p.status === 'renewal-due')
      if (!live.length) return [`I don't see a live policy on your file yet, so I can't open a claim here. Reply 7 and an adviser will help, or 4 to send an enquiry with the details.`]
      return [await start(phone, FLOWS.claim, ctx)]
    }
    case 'question': {
      await setWorkflow(phone, 'consult', null, {})
      return [await answerQuestion(phone, org, user, client, value ?? text, contact)]
    }
    case 'update_name': {
      const newName = (value ?? '').trim()
      if (!user) return [`Noted, ${newName}. Reply 1 to create your account and I will keep your name on file.`]
      if (newName.length < 2) return ['What should I change your name to?']
      await rememberFact(contact, 'name', newName)
      return [await start(phone, FLOWS['name-change'], ctx, { newName })]
    }
    case 'update_email': {
      const email = (value ?? '').trim().toLowerCase()
      if (!user) return ['Reply 1 to create your account first, then I can update your email.']
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return ['That does not look like an email address. Try again, for example name@example.com.']
      await updateUserEmail(user.id, email)
      return [success('Email updated', [`Your username is now ${email}.`])]
    }
    case 'recall_profile': {
      if (!user) {
        const known = contact.memory.facts?.name
        return [known ? `I have you as ${bold(known)} on this number, but you have not created an account yet. Reply 1 to sign up.` : `I don't have an account for this number yet. Reply 1 to create one.`]
      }
      return [[bold('What I have on file'), `Name: ${user.name}`, `Email: ${user.email}`, `Phone: ${formatIntl(phone)}`, client ? `Client record: ${client.name} (${client.type})` : '', '', italic('To change your name, say "change my name to …".')].filter(Boolean).join('\n')]
    }
    case 'greeting':
      return [mainMenu(org.shortName, registered, first)]
    case 'thanks':
      return [`You're welcome${first ? `, ${first}` : ''}. Reply MENU whenever you need me.`]
    case 'back':
    case 'restart':
    case 'cancel':
    case 'menu':
      return [mainMenu(org.shortName, registered, first)]
    default: {
      // Unknown: try answering as a question when it looks like one; otherwise show the menu with a nudge.
      if (text.length > 15) {
        await setWorkflow(phone, 'consult', null, {})
        return [await answerQuestion(phone, org, user, client, text, contact)]
      }
      return [`I didn't quite get that.\n\n${mainMenu(org.shortName, registered, first)}`]
    }
  }
}

async function start(phone: string, flow: Flow, ctx: FlowContext, preset: Record<string, unknown> = {}): Promise<string> {
  const outcome = await startFlow(flow, ctx, preset)
  return persist(phone, flow, outcome)
}

/* ---------- Media ---------- */

async function handleMedia(message: InboundMessage, org: Organization, user: PublicUser | null, client: PortalData['client'], quiet: boolean): Promise<string[]> {
  const media = message.media!
  if (media.kind === 'audio') return quiet ? [] : ["I can't listen to voice notes yet. Please type your message, or reply 7 to talk to an adviser."]
  if (media.kind === 'video' || media.kind === 'sticker' || media.kind === 'other') return quiet ? [] : ['Please send documents as a photo or PDF. Reply 5 to start an upload.']
  if (!storageConfigured()) return quiet ? [] : ['Document uploads are not switched on yet. Reply 4 to make an enquiry and an adviser will collect your documents.']

  let bytes: Uint8Array | null = null
  let mimetype = media.mimetype
  if (media.base64) bytes = new Uint8Array(Buffer.from(media.base64, 'base64'))
  else {
    // Gateways either inline the bytes, hold them behind a URL, or keep them
    // against the message id. Try whichever handle we were given.
    const provider = getProvider()
    const fetched = media.url && provider?.downloadMediaUrl
      ? await provider.downloadMediaUrl(media.url).catch(() => null)
      : media.chatId && provider?.downloadMedia
        ? await provider.downloadMedia(media.chatId, message.messageId).catch(() => null)
        : null
    if (fetched) {
      bytes = fetched.bytes
      mimetype = fetched.mimetype.includes('octet') ? media.mimetype : fetched.mimetype
    }
  }
  if (!bytes) return ["I couldn't download that file. Please send it again, ideally as a photo or a PDF under 15 MB."]
  const check = uploadAllowed(mimetype, bytes.byteLength)
  if (!check.ok) return [check.reason]

  const upload = await storeUpload({ organizationId: org.id, clientId: client?.id ?? null, userId: user?.id ?? null, phone: message.phone, source: 'whatsapp', bytes, mimetype, filename: media.filename, caption: message.text || null })
  await setWorkflow(message.phone, 'upload-processing', null, { uploadId: upload.id })
  return quiet ? [] : [processingUpload(upload.filename)]
}

/** Called by the OCR job when a document has been read: tell the person and ask them to confirm. */
export async function afterUploadProcessed(uploadId: string): Promise<void> {
  const sql = getSql()
  const rows = await sql`SELECT organization_id, phone, source, user_id FROM uploads WHERE id = ${uploadId} LIMIT 1`
  if (!rows[0]) return
  const orgId = String(rows[0].organization_id)
  const phone = rows[0].phone ? String(rows[0].phone) : null
  if (!phone || String(rows[0].source) !== 'whatsapp') return
  const upload = await getUpload(orgId, uploadId)
  if (!upload) return
  const type = ((upload.extracted?.documentType as string) ?? 'document').replace(/-/g, ' ')
  const lines = extractedLines(upload.extracted)
  let text: string
  if (upload.ocrStatus === 'done' && (lines.length || upload.extracted?.summary)) {
    text = [bold(`I read your ${type}`), upload.extracted?.summary ? String(upload.extracted.summary) : '', '', ...(lines.length ? [bold('What I found'), ...lines.map((l) => `• ${l}`), ''] : []), 'Is this correct?', '', options(['Yes, save it', 'No, something is wrong', 'Skip for now'])].join('\n')
    await setWorkflow(phone, 'upload-confirm', null, { uploadId })
  } else {
    text = [bold('Document received'), `I could not read ${upload.filename} automatically, but it is saved on your file and an adviser will look at it.`, '', italic('Reply MENU for other options.')].join('\n')
    await setWorkflow(phone, null, null, {})
  }
  const contact = await getContact(phone)
  if (contact?.mode === 'human') return
  await sendWhatsApp(phone, text, orgId)
  await appendMessage({ phone, organizationId: orgId, userId: upload.userId, direction: 'out', role: 'assistant', body: text })
}

async function confirmStep(phone: string, org: Organization, uploadId: string, text: string): Promise<string | null> {
  const t = text.trim().toLowerCase()
  if (/^(1|yes|y|correct|ndio|sawa)$/.test(t)) {
    await confirmUpload(uploadId, org.id, true)
    await setWorkflow(phone, null, null, {})
    return success('Saved to your file', ['Your adviser can see the document and the details you confirmed.', '', 'Reply 5 to upload another, 6 to check your requests, or MENU.'])
  }
  if (/^(2|no|n|wrong|hapana)$/.test(t)) {
    await setWorkflow(phone, 'upload-correct', null, { uploadId })
    return 'No problem. Type the correction (for example "policy number is ABC123") and an adviser will fix it, or reply SKIP to leave it for review.'
  }
  if (/^(3|skip|later)$/.test(t)) {
    await setWorkflow(phone, null, null, {})
    return 'Left for review. An adviser will check the document.\n\nReply MENU for other options.'
  }
  return null
}

/* ---------- Consultation with memory ---------- */

async function answerQuestion(phone: string, org: Organization, user: PublicUser | null, client: PortalData['client'], question: string, contact: WhatsAppContact): Promise<string> {
  const history = await recentMessages(phone, org.id, 12)
  const policies = user ? (await getPortalData(user.id))?.policies : undefined
  const memory = memoryContext(contact, history)
  const result = await consult({ question, organization: org, user, client, policies, history: history.slice(0, -1), memory, phone, channel: 'whatsapp' })
  if (result.escalate) {
    await setWorkflow(phone, null, null, {})
    await requestHandoff({ phone, organization: org, user, client, reason: `Assistant escalated: "${question.slice(0, 120)}"` })
    return `${result.answer}\n\n${handoffReply(org.shortName, client?.adviserName ?? null, org.phone)}`
  }
  return `${result.answer}\n\n${italic('Ask another question, or reply MENU.')}`
}

/* ---------- Client summaries ---------- */

function statusReply(first: string, data: PortalData): string {
  if (!data.client) return `Hi ${first}. Your account is set up and your adviser will be in touch to start your risk review.\n\n${italic('Reply MENU for options.')}`
  const stageIndex = Math.max(0, JOURNEY_STAGES.findIndex((s) => s.id === data.client?.stage))
  const stage = JOURNEY_STAGES[stageIndex]
  const live = data.policies.filter((p) => p.status === 'live' || p.status === 'renewal-due')
  const dueSoon = live.filter((p) => daysUntil(p.expiryDate) <= 30)
  const openClaims = data.claims.filter((c) => c.stage !== 'settled' && c.stage !== 'closed')
  const lines = [bold(`Where things stand for ${data.client.name}`), '', `Stage ${stageIndex + 1} of 6: ${bold(stage.label)}`, italic(stage.description), '', `Policies in force: ${live.length}`, `Quotes in progress: ${data.quotes.length}`, `Open claims: ${openClaims.length}`]
  if (live.length) {
    lines.push('', bold('Policies'))
    for (const p of live.slice(0, 6)) {
      const days = daysUntil(p.expiryDate)
      lines.push(`• ${p.product} — ${p.insurer}, ${formatKES(p.premium)}/yr, ${days < 0 ? `expired ${formatShortDate(p.expiryDate)}` : `renews ${formatShortDate(p.expiryDate)}`}`)
    }
  }
  if (openClaims.length) {
    lines.push('', bold('Claims'))
    for (const c of openClaims.slice(0, 4)) lines.push(`• ${c.reference} ${c.product}: ${CLAIM_STAGES.find((s) => s.id === c.stage)?.label ?? c.stage}`)
  }
  if (dueSoon.length) lines.push('', `Renewing within 30 days: ${dueSoon.map((p) => `${p.product} (${formatShortDate(p.expiryDate)})`).join(', ')}`)
  if (data.client.adviserName) lines.push('', `Your adviser: ${data.client.adviserName}${data.organization.phone ? `, ${data.organization.phone}` : ''}`)
  lines.push('', `Portal: ${SITE}/portal`, italic('Reply 6 to check requests, or MENU.'))
  return lines.join('\n')
}

/* ---------- Staff ---------- */

async function staffReply(user: PublicUser, orgId: string, text: string): Promise<string> {
  const org = await getOrganization(orgId)
  const lower = text.toLowerCase()
  if (/^(menu|help|hi|hello|0)$/.test(lower)) {
    return [bold(`${org?.shortName ?? 'Agency'} workspace`), `Hi ${user.name.split(' ')[0]}. Ask me:`, '', options(['TODAY: your queue', 'RENEWALS: next 30 days', 'QUOTES: outstanding', 'CLAIMS: open claims', 'FIND <name>: a client', 'WITHOUT <product>: coverage gaps']), '', `Full workspace: ${SITE}/agency/today`].join('\n')
  }
  const result = await runAgencyCommand(orgId, text)
  const lines = [bold(result.title), '', ...result.lines.map((l) => (l.detail ? `• ${l.text}\n  ${l.detail}` : `• ${l.text}`))]
  if (result.actions[0]) lines.push('', `${result.actions[0].label}: ${SITE}${result.actions[0].href}`)
  return lines.join('\n')
}

/** Recent updates for a client. */
export async function updatesReply(userId: string, first: string): Promise<string> {
  const items = await listNotifications(userId, 5)
  await markAllRead(userId)
  if (!items.length) return `No updates yet, ${first}.`
  return [bold('Your latest updates'), '', ...items.map((i) => `• ${i.title} (${formatShortDate(i.createdAt)})\n  ${i.body.slice(0, 160)}`)].join('\n')
}

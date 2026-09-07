import { advanceFlow, backFlow, cancelFlow, helpFor, restartFlow, startFlow, type Flow, type FlowContext, type FlowState } from '@/lib/conversation/engine'
import { FLOWS, activeOrganizations, joinFlow, matchProduct } from '@/lib/conversation/flows'
import { bold, bullet, italic, menuBlock, options } from '@/lib/conversation/messages'
import { ensureSchema } from '@/lib/db/migrate'
import { daysUntil, formatKES, formatShortDate } from '@/lib/format'
import { isStaffRole } from '@/lib/auth/session'
import { runAgencyCommand } from '@/services/agency/commands'
import { consult } from '@/services/consult'
import { appendMessage, getContact, linkContact, recentMessages, setMode, setWorkflow, touchContact, workflowExpired } from '@/services/conversations'
import { requestHandoff } from '@/services/handoff'
import { clientForUser } from '@/services/journey'
import { listNotifications, markAllRead, notifyOrganization } from '@/services/notifications'
import { getPortalData } from '@/services/portal'
import { findUserByPhone, getOrganization, getOrganizationByCode } from '@/services/users'
import { CLAIM_STAGES, JOURNEY_STAGES, type Organization, type PortalData, type PublicUser, type WhatsAppContact } from '@/types/platform'

/**
 * The Super Agent WhatsApp conversation.
 *
 * One shared number serves every agency. Each inbound message is routed to a
 * tenant (the person's own agency, the contact's saved agency, a JOIN code, or
 * a choice when several agencies exist), then handled by: a running workflow,
 * the consultation assistant, a human adviser (handoff), or the menu.
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

export async function handleInbound(phone: string, text: string, displayName: string | null = null): Promise<InboundResult> {
  await ensureSchema()
  const trimmed = text.trim().slice(0, 4000)
  let contact = await touchContact(phone, displayName)
  const user = await findUserByPhone(phone)

  // Keep the contact linked to the account that owns this number.
  if (user && (contact.userId !== user.id || (user.organizationId && contact.organizationId !== user.organizationId))) {
    await linkContact(phone, { userId: user.id, organizationId: user.organizationId ?? contact.organizationId })
    contact = (await getContact(phone)) ?? contact
  }

  await appendMessage({ phone, organizationId: contact.organizationId, userId: user?.id ?? null, direction: 'in', role: 'user', body: trimmed })

  const result = await route(phone, trimmed, contact, user)
  for (const reply of result.replies) {
    await appendMessage({ phone, organizationId: result.organizationId, userId: user?.id ?? null, direction: 'out', role: 'assistant', body: reply })
  }
  return result
}

async function route(phone: string, text: string, contact: WhatsAppContact, user: PublicUser | null): Promise<InboundResult> {
  const lower = text.toLowerCase()
  const base = { userId: user?.id ?? null, organizationId: contact.organizationId, answered: true }

  // Staff use the number as a command line for their own workspace.
  if (user && isStaffRole(user.role)) {
    const orgId = user.organizationId ?? contact.organizationId ?? 'org_goldoak'
    return { ...base, organizationId: orgId, replies: [await staffReply(user, orgId, text)] }
  }

  // 1. Tenant resolution.
  let organization = contact.organizationId ? await getOrganization(contact.organizationId) : null
  if (!organization) {
    const joinCode = lower.match(/^(?:join|agency|code)\s+([a-z0-9-]{3,20})$/i)?.[1] ?? (/^[a-z0-9-]{4,20}$/i.test(text) ? text : null)
    const byCode = joinCode ? await getOrganizationByCode(joinCode) : null
    if (byCode) {
      organization = byCode
      await linkContact(phone, { organizationId: byCode.id })
      const greeting = byCode.greeting ?? `You are now talking to ${byCode.name}.`
      return { ...base, organizationId: byCode.id, replies: [`${greeting}\n\n${guestMenu(byCode, user)}`] }
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
        if (org) return { ...base, organizationId: org.id, replies: [outcome.reply, guestMenu(org, user)] }
      }
      return { ...base, replies: [outcome.reply] }
    }
  }

  const org = organization
  const client = user ? await clientForUser(user.id) : null
  const ctx: FlowContext = { phone, organization: org, user, client }
  const scoped = { ...base, organizationId: org.id }

  // 2. A person is handling this chat.
  if (contact.mode === 'human') {
    if (/^(menu|0|assistant|bot|resume)$/.test(lower)) {
      await setMode(phone, 'ai')
      return { ...scoped, replies: [`Back with the assistant.\n\n${await mainMenu(org, user, client)}`] }
    }
    const who = client?.name ?? user?.name ?? contact.displayName ?? `+${phone}`
    await notifyOrganization(org.id, {
      clientId: client?.id ?? null,
      kind: 'message',
      title: `WhatsApp from ${who}`,
      body: text.slice(0, 300),
      reference: `wa-human:${phone}:${Date.now()}`,
      inAppOnly: true,
    })
    const history = await recentMessages(phone, org.id, 6)
    const recentAck = history.some((m) => m.direction === 'out' && Date.now() - new Date(m.at).getTime() < 30 * 60 * 1000)
    if (recentAck) return { ...scoped, replies: [], answered: false }
    return { ...scoped, replies: [`Thanks, your message has reached ${org.shortName}. An adviser will reply here shortly.\n\n${italic('Reply MENU to use the assistant meanwhile.')}`] }
  }

  // 3. Global commands.
  const running = contact.workflow && contact.workflow !== 'join' && !workflowExpired(contact) ? contact.workflow : null
  const flow = running && running !== 'consult' && contact.step != null ? FLOWS[running] ?? null : null
  const state: FlowState | null = flow ? { step: contact.step as number, data: contact.data } : null

  if (/^(cancel|stop|exit|quit|acha)$/.test(lower)) {
    await setWorkflow(phone, null, null, {})
    if (running === 'consult' || flow) return { ...scoped, replies: [cancelFlow().reply] }
    return { ...scoped, replies: [`Nothing to cancel.\n\n${await mainMenu(org, user, client)}`] }
  }
  if (/^(menu|0|start|home)$/.test(lower)) {
    await setWorkflow(phone, null, null, {})
    return { ...scoped, replies: [await mainMenu(org, user, client)] }
  }
  if (/^(help|\?)$/.test(lower)) {
    if (flow && state) return { ...scoped, replies: [helpFor(flow, state)] }
    return { ...scoped, replies: [helpText(org, user)] }
  }
  const wantsPerson = /^(adviser|advisor|agent|human|person|talk to (a |an )?(person|adviser|agent|human))$/.test(lower) || (lower === '9' && !flow)
  if (wantsPerson) {
    await setWorkflow(phone, null, null, {})
    await requestHandoff({ phone, organization: org, user, client, reason: 'Asked for an adviser from the WhatsApp menu.', displayName: contact.displayName })
    return { ...scoped, replies: [handoffReply(org, client)] }
  }

  // 4. A running workflow.
  if (flow && state) {
    let outcome
    if (/^back$/.test(lower)) outcome = await backFlow(flow, ctx, state)
    else if (/^(restart|again)$/.test(lower)) outcome = await restartFlow(flow, ctx)
    else outcome = await safeAdvance(flow, ctx, state, text)
    await setWorkflow(phone, outcome.state ? flow.id : null, outcome.state?.step ?? null, outcome.state?.data ?? {})
    return { ...scoped, replies: [outcome.reply] }
  }

  // 5. Consultation mode: free questions until MENU.
  if (running === 'consult') {
    const policies = user ? (await getPortalData(user.id))?.policies : undefined
    return { ...scoped, replies: [await answerQuestion(phone, org, user, client, text, policies)] }
  }

  // 6. Intents from the menu.
  return { ...scoped, replies: await dispatch(phone, text, org, user, client, contact) }
}

async function safeAdvance(flow: Flow, ctx: FlowContext, state: FlowState, text: string) {
  try {
    return await advanceFlow(flow, ctx, state, text)
  } catch (error) {
    console.error(`flow ${flow.id} failed`, error instanceof Error ? error.message : error)
    return { reply: `Something went wrong on our side while saving that. Nothing was lost on your end. Please reply RESTART to try again, or 9 to talk to an adviser.`, state }
  }
}

/* ---------- Menus ---------- */

function guestMenu(org: Organization, user: PublicUser | null): string {
  if (user) return `Hi ${user.name.split(' ')[0]}. Reply MENU to continue.`
  return menuBlock(`Welcome to ${org.name} 👋`, ['Create my account', 'Ask an insurance question', 'Talk to an adviser', `About ${org.shortName}`], 'Reply with a number. Already registered? Message us from the number on your account.')
}

async function mainMenu(org: Organization, user: PublicUser | null, client: PortalData['client']): Promise<string> {
  if (!user) return guestMenu(org, null)
  const first = user.name.split(' ')[0]
  const items = ['Where things stand', 'My policies', 'My quotes', 'My claims', 'Ask for cover', 'Report a claim', 'Ask a question', 'Recent updates', 'Talk to an adviser']
  return menuBlock(`Hi ${first}, this is ${org.shortName} on Super Agent`, items, client ? 'Reply with a number, or type what you need.' : 'Reply with a number. Your adviser will set up your risk review shortly.')
}

function helpText(org: Organization, user: PublicUser | null): string {
  return [
    bold('How this works'),
    `I am the ${org.shortName} assistant on WhatsApp. ${user ? 'Reply MENU for your options.' : 'Reply 1 to create an account, or 2 to ask a question.'}`,
    '',
    bullet(['MENU: main menu', 'BACK / CANCEL / RESTART: control any form', 'HELP: this message', 'ADVISER: talk to a person']),
    '',
    `Website: ${SITE}`,
  ].join('\n')
}

function handoffReply(org: Organization, client: PortalData['client']): string {
  const name = client?.adviserName ? `${client.adviserName} from ${org.shortName}` : `A ${org.shortName} adviser`
  return [`${name} will reply to you here. I will stay quiet until they hand the chat back to me.`, '', `Urgent? Call ${org.phone}.`, '', italic('Reply MENU to use the assistant while you wait.')].join('\n')
}

/* ---------- Intent dispatch ---------- */

type Intent = 'signup' | 'ask' | 'about' | 'status' | 'policies' | 'quotes' | 'claims' | 'quote' | 'claim' | 'updates' | 'menu'

function guestIntent(t: string): Intent {
  if (t === '1' || /^(sign ?up|register|create|account|join|start)/.test(t)) return 'signup'
  if (t === '2' || /^(ask|question|consult)/.test(t) || t.includes('?')) return 'ask'
  if (t === '4' || /^(about|who|info)/.test(t)) return 'about'
  if (/^(quote|cover|insure|claim|policy|status)/.test(t)) return 'signup'
  return 'menu'
}

function clientIntent(t: string): Intent {
  if (t === '1' || /^(status|progress|where|hi|hello|hey|habari|jambo|mambo)\b/.test(t)) return 'status'
  if (t === '2' || /^(polic|cover|insurance)\b/.test(t)) return 'policies'
  if (t === '3' || /^(quotes?|my quotes)$/.test(t)) return 'quotes'
  if (t === '4' || /^(claims|my claims)$/.test(t)) return 'claims'
  if (t === '5' || /^(quote|request|i need|i want|get me|cover for|insure)\b/.test(t)) return 'quote'
  if (t === '6' || /^(claim|report|accident|fire|theft|stolen|damage)\b/.test(t)) return 'claim'
  if (t === '7' || /^(ask|question|consult)\b/.test(t) || t.includes('?')) return 'ask'
  if (t === '8' || /^(updates?|messages?|inbox|news)\b/.test(t)) return 'updates'
  return 'menu'
}

async function dispatch(phone: string, text: string, org: Organization, user: PublicUser | null, client: PortalData['client'], contact: WhatsAppContact): Promise<string[]> {
  const t = text.toLowerCase()
  const ctx: FlowContext = { phone, organization: org, user, client }

  if (!user) {
    const intent = guestIntent(t)
    if (intent === 'signup') {
      const outcome = await startFlow(FLOWS.signup, ctx)
      await setWorkflow(phone, 'signup', outcome.state?.step ?? 0, outcome.state?.data ?? {})
      return [outcome.reply]
    }
    if (intent === 'ask') {
      if (t === '2' || /^(ask|question|consult)$/.test(t)) {
        await setWorkflow(phone, 'consult', null, {})
        return [`Ask me anything about insurance: what a cover includes, what a claim needs, what suits a business like yours. ${italic('Reply MENU when you are done.')}`]
      }
      await setWorkflow(phone, 'consult', null, {})
      return [await answerQuestion(phone, org, null, null, text)]
    }
    if (intent === 'about') return [aboutText(org)]
    const firstContact = Math.abs(new Date(contact.updatedAt).getTime() - new Date(contact.createdAt).getTime()) < 5000
    const greeting = firstContact ? org.greeting : null
    return [greeting ? `${greeting}\n\n${guestMenu(org, null)}` : guestMenu(org, null)]
  }

  const intent = clientIntent(t)
  const data = await getPortalData(user.id)
  if (!data) return ['We could not load your account right now. Please try again in a moment.']
  const first = user.name.split(' ')[0]

  switch (intent) {
    case 'status':
      return [statusReply(first, data)]
    case 'policies':
      return [policiesReply(data)]
    case 'quotes':
      return [quotesReply(data)]
    case 'claims':
      return [claimsReply(data)]
    case 'updates': {
      const items = await listNotifications(user.id, 5)
      await markAllRead(user.id)
      if (!items.length) return [`No updates yet, ${first}.\n\n${await mainMenu(org, user, client)}`]
      return [[bold('Your latest updates'), '', ...items.map((i) => `• ${i.title} (${formatShortDate(i.createdAt)})\n  ${i.body.slice(0, 160)}`)].join('\n')]
    }
    case 'quote': {
      if (!data.client) return ['Your adviser will set up your risk review first. Reply 9 and we will call you.']
      const product = /^\d+$/.test(t) ? null : matchProduct(text.replace(/^(quote|request|i need|i want|get me|cover for|insure)\s*/i, ''))
      const outcome = await startFlow(FLOWS.quote, ctx)
      if (product && outcome.state) {
        const advanced = await advanceFlow(FLOWS.quote, ctx, outcome.state, product)
        await setWorkflow(phone, advanced.state ? 'quote' : null, advanced.state?.step ?? null, advanced.state?.data ?? {})
        return [advanced.reply]
      }
      await setWorkflow(phone, 'quote', outcome.state?.step ?? 0, outcome.state?.data ?? {})
      return [outcome.reply]
    }
    case 'claim': {
      if (!data.client) return ['We need a policy on file before a claim. Reply 9 and we will call you.']
      const live = data.policies.filter((p) => p.status === 'live' || p.status === 'renewal-due')
      if (!live.length) return [`No live policy on file yet. If you believe this is wrong, reply 9 or call ${org.phone}.`]
      const outcome = await startFlow(FLOWS.claim, ctx)
      await setWorkflow(phone, 'claim', outcome.state?.step ?? 0, outcome.state?.data ?? {})
      return [outcome.reply]
    }
    case 'ask': {
      await setWorkflow(phone, 'consult', null, {})
      if (t === '7' || /^(ask|question|consult)$/.test(t)) return [`Ask me anything about your cover or insurance in general. ${italic('Reply MENU when you are done.')}`]
      return [await answerQuestion(phone, org, user, data.client, text, data.policies)]
    }
    default:
      return [await mainMenu(org, user, data.client)]
  }
}

function aboutText(org: Organization): string {
  return [bold(org.name), `Licensed insurance intermediary${org.licenceLabel ? ` (${org.licenceLabel})` : ''}. We compare cover across our insurer panel, place it, and stand with you at claim time.`, '', `Phone: ${org.phone}`, `Email: ${org.email}`, `Website: ${SITE}`, '', 'Reply 1 to create an account or 2 to ask a question.'].join('\n')
}

/* ---------- Consultation ---------- */

async function answerQuestion(phone: string, org: Organization, user: PublicUser | null, client: PortalData['client'], question: string, policies?: PortalData['policies']): Promise<string> {
  const history = await recentMessages(phone, org.id, 12)
  const result = await consult({ question, organization: org, user, client, policies, history: history.slice(0, -1), phone, channel: 'whatsapp' })
  if (result.escalate) {
    await setWorkflow(phone, null, null, {})
    await requestHandoff({ phone, organization: org, user, client, reason: `Assistant escalated: "${question.slice(0, 120)}"` })
    return `${result.answer}\n\n${handoffReply(org, client)}`
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
  const lines = [
    bold(`Where things stand for ${data.client.name}`),
    '',
    `Stage ${stageIndex + 1} of 6: ${bold(stage.label)}`,
    italic(stage.description),
    '',
    `Policies in force: ${live.length}`,
    `Quotes in progress: ${data.quotes.length}`,
    `Open claims: ${openClaims.length}`,
  ]
  if (dueSoon.length) lines.push('', `Renewing within 30 days: ${dueSoon.map((p) => `${p.product} (${formatShortDate(p.expiryDate)})`).join(', ')}`)
  if (data.client.adviserName) lines.push('', `Your adviser: ${data.client.adviserName}, ${data.organization.phone}`)
  lines.push('', italic('Reply MENU for options.'))
  return lines.join('\n')
}

function policiesReply(data: PortalData): string {
  const live = data.policies.filter((p) => p.status !== 'cancelled')
  if (!live.length) return `No policies on file yet. Reply 5 to ask for cover, or your adviser will place it after your risk review.`
  const lines = [bold('Your policies'), '']
  for (const p of live) {
    const days = daysUntil(p.expiryDate)
    lines.push(`• ${p.product} — ${p.insurer}`, `  ${p.policyNumber} · ${formatKES(p.premium)}/yr · ${days < 0 ? `expired ${formatShortDate(p.expiryDate)}` : `renews ${formatShortDate(p.expiryDate)} (${days} days)`}`)
    if (p.keyExclusions) lines.push(`  Note: ${p.keyExclusions}`)
  }
  lines.push('', `Documents: ${SITE}/portal`)
  return lines.join('\n')
}

function quotesReply(data: PortalData): string {
  if (!data.quotes.length) return 'No quotes in progress. Reply 5 to ask for cover.'
  const stageLabel: Record<string, string> = { requested: 'waiting for insurers', compared: 'being compared', proposed: 'proposal sent to you', accepted: 'accepted, being placed' }
  const lines = [bold('Quotes in progress'), '']
  for (const q of data.quotes) {
    const received = q.submissions.filter((s) => s.status === 'received' || s.status === 'ready').length
    lines.push(`• ${q.product} (${q.reference}) — ${stageLabel[q.stage] ?? q.stage}`, `  ${received} of ${q.submissions.length} insurers have replied`)
  }
  lines.push('', `Compare them: ${SITE}/portal`)
  return lines.join('\n')
}

function claimsReply(data: PortalData): string {
  const open = data.claims.filter((c) => c.stage !== 'closed')
  if (!open.length) return `No open claims. Reply 6 to report one, or call ${data.organization.phone}.`
  const lines = [bold('Your claims'), '']
  for (const c of open) {
    const stage = CLAIM_STAGES.find((s) => s.id === c.stage)?.label ?? c.stage
    lines.push(`• ${c.reference} — ${c.product}, ${c.insurer}`, `  Stage: ${stage}${c.amount ? ` · ${formatKES(c.amount)}` : ''}`)
    if (c.nextUpdateDue) lines.push(`  Next update: ${formatShortDate(c.nextUpdateDue)}`)
  }
  return lines.join('\n')
}

/* ---------- Staff ---------- */

async function staffReply(user: PublicUser, orgId: string, text: string): Promise<string> {
  const org = await getOrganization(orgId)
  const lower = text.toLowerCase()
  if (/^(menu|help|hi|hello|0)$/.test(lower)) {
    return [
      bold(`${org?.shortName ?? 'Agency'} workspace`),
      `Hi ${user.name.split(' ')[0]}. Ask me:`,
      '',
      options(['TODAY: your queue', 'RENEWALS: next 30 days', 'QUOTES: outstanding', 'CLAIMS: open claims', 'FIND <name>: a client', 'WITHOUT <product>: coverage gaps']),
      '',
      `Full workspace: ${SITE}/agency/today`,
    ].join('\n')
  }
  const result = await runAgencyCommand(orgId, text)
  const lines = [bold(result.title), '', ...result.lines.map((l) => (l.detail ? `• ${l.text}\n  ${l.detail}` : `• ${l.text}`))]
  if (result.actions[0]) lines.push('', `${result.actions[0].label}: ${SITE}${result.actions[0].href}`)
  return lines.join('\n')
}

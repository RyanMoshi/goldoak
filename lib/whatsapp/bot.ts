import { getSql } from '@/lib/db/client'
import { ensureSchema } from '@/lib/db/migrate'
import { daysUntil, formatKES, formatShortDate } from '@/lib/format'
import { newId } from '@/lib/ids'
import { runAgencyCommand } from '@/services/agency/commands'
import { clientForUser, policiesForClient, reportClaim, requestQuote } from '@/services/journey'
import { listNotifications, markAllRead } from '@/services/notifications'
import { getPortalData } from '@/services/portal'
import { findUserByPhone, getOrganization } from '@/services/users'
import { CLAIM_STAGES, JOURNEY_STAGES, PRODUCT_LINES, type PortalData, type PublicUser } from '@/types/platform'

/**
 * The WhatsApp conversation. Stateless commands answer immediately; QUOTE and
 * CLAIM run short flows whose state lives in whatsapp_sessions. Every action
 * calls the same services the website uses, so both channels stay in step.
 */

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://goldoak.vercel.app'

interface FlowState {
  flow: 'quote' | 'claim' | null
  step: string | null
  data: Record<string, string>
}

async function loadState(phone: string): Promise<FlowState> {
  const sql = getSql()
  const rows = await sql`SELECT flow, step, data FROM whatsapp_sessions WHERE phone = ${phone} AND updated_at > now() - interval '2 hours' LIMIT 1`
  if (!rows[0]) return { flow: null, step: null, data: {} }
  return { flow: (rows[0].flow as FlowState['flow']) ?? null, step: rows[0].step ? String(rows[0].step) : null, data: (rows[0].data as Record<string, string>) ?? {} }
}

async function saveState(phone: string, state: FlowState): Promise<void> {
  const sql = getSql()
  await sql`INSERT INTO whatsapp_sessions (phone, flow, step, data, updated_at) VALUES (${phone}, ${state.flow}, ${state.step}, ${JSON.stringify(state.data)}::jsonb, now())
    ON CONFLICT (phone) DO UPDATE SET flow = EXCLUDED.flow, step = EXCLUDED.step, data = EXCLUDED.data, updated_at = now()`
}

async function clearState(phone: string): Promise<void> {
  const sql = getSql()
  await sql`DELETE FROM whatsapp_sessions WHERE phone = ${phone}`
}

export async function logMessage(phone: string, userId: string | null, direction: 'in' | 'out', body: string): Promise<void> {
  try {
    const sql = getSql()
    await sql`INSERT INTO whatsapp_messages (id, phone, user_id, direction, body) VALUES (${newId('wam')}, ${phone}, ${userId}, ${direction}, ${body.slice(0, 4000)})`
  } catch (error) {
    console.error('whatsapp log failed', error instanceof Error ? error.message : error)
  }
}

/** Entry point: an inbound text from `phone`. Returns the reply text. */
export async function handleInbound(phone: string, text: string): Promise<{ reply: string; userId: string | null }> {
  await ensureSchema()
  const user = await findUserByPhone(phone)
  if (!user) return { reply: unknownReply(), userId: null }

  const trimmed = text.trim()
  const lower = trimmed.toLowerCase()

  if (/^(stop|cancel|exit|quit)$/.test(lower)) {
    await clearState(phone)
    return { reply: 'Cancelled. Send MENU whenever you need us.', userId: user.id }
  }

  if (user.role === 'agency' || user.role === 'admin') {
    return { reply: await agencyReply(user, trimmed), userId: user.id }
  }

  const state = await loadState(phone)
  if (state.flow) {
    return { reply: await continueFlow(user, phone, state, trimmed), userId: user.id }
  }
  return { reply: await clientReply(user, phone, trimmed), userId: user.id }
}

/* ---------- Unknown numbers ---------- */

function unknownReply(): string {
  return [
    'Hello from GoldOak Insurance. This number is not linked to an account yet.',
    '',
    `Create your free account at ${SITE}/signup with this phone number, then message us again to see your progress, policies, quotes and claims, ask for cover or report a claim.`,
    '',
    'Prefer to talk? Call +254 729 911 311.',
  ].join('\n')
}

/* ---------- Clients ---------- */

function menu(): string {
  return ['Reply with a word or number:', '1 STATUS  · where things stand', '2 POLICIES · what you have', '3 QUOTES  · quotes in progress', '4 CLAIMS  · claims and updates', '5 QUOTE   · ask for new cover', '6 CLAIM   · report something', '7 UPDATES · recent messages', '8 ADVISER · talk to a person'].join('\n')
}

type ClientIntent = 'status' | 'policies' | 'quotes' | 'claims' | 'quote' | 'claim' | 'updates' | 'adviser' | 'menu'

function clientIntent(text: string): ClientIntent {
  const t = text.trim().toLowerCase()
  if (t === '1' || /^(status|progress|hi|hello|hey|habari|jambo|mambo|start)\b/.test(t)) return 'status'
  if (t === '2' || /^polic|^cover|^insurance/.test(t)) return 'policies'
  if (t === '3' || /^quotes\b|^my quotes/.test(t)) return 'quotes'
  if (t === '4' || /^claims\b|^my claims/.test(t)) return 'claims'
  if (t === '5' || /^(quote|request|i need|i want|get me|cover for|insure)\b/.test(t)) return 'quote'
  if (t === '6' || /^(claim|report|accident|fire|theft|stolen|damage)\b/.test(t)) return 'claim'
  if (t === '7' || /^(updates?|messages?|inbox|news)\b/.test(t)) return 'updates'
  if (t === '8' || /adviser|advisor|agent|call|talk|human|person/.test(t)) return 'adviser'
  return 'menu'
}

async function clientReply(user: PublicUser, phone: string, text: string): Promise<string> {
  const intent = clientIntent(text)
  const data = await getPortalData(user.id)
  if (!data) return 'We could not load your account right now. Please try again in a moment.'
  const first = user.name.split(' ')[0]

  switch (intent) {
    case 'status':
      return statusReply(first, data)
    case 'policies':
      return policiesReply(data)
    case 'quotes':
      return quotesReply(data)
    case 'claims':
      return claimsReply(data)
    case 'updates': {
      const items = await listNotifications(user.id, 5)
      await markAllRead(user.id)
      if (!items.length) return `No updates yet, ${first}.\n\n${menu()}`
      return ['Your latest updates:', '', ...items.map((i) => `• ${i.title} (${formatShortDate(i.createdAt)})\n  ${i.body.slice(0, 160)}`)].join('\n')
    }
    case 'adviser':
      return adviserReply(data)
    case 'quote':
      return startQuoteFlow(phone, text, data)
    case 'claim':
      return startClaimFlow(phone, data)
    default:
      return `Hi ${first}, this is GoldOak Insurance.\n\n${menu()}`
  }
}

function statusReply(first: string, data: PortalData): string {
  if (!data.client) return `Hi ${first}. Your account is set up and your adviser will be in touch to start your risk review.\n\n${menu()}`
  const stageIndex = JOURNEY_STAGES.findIndex((s) => s.id === data.client?.stage)
  const stage = JOURNEY_STAGES[Math.max(0, stageIndex)]
  const live = data.policies.filter((p) => p.status === 'live' || p.status === 'renewal-due')
  const dueSoon = live.filter((p) => daysUntil(p.expiryDate) <= 30)
  const openClaims = data.claims.filter((c) => c.stage !== 'settled' && c.stage !== 'closed')
  const lines = [
    `Hi ${first}, here is where things stand for ${data.client.name}:`,
    '',
    `Stage ${stageIndex + 1} of 6: ${stage.label} — ${stage.description}`,
    `Policies in force: ${live.length}`,
    `Quotes in progress: ${data.quotes.length}`,
    `Open claims: ${openClaims.length}`,
  ]
  if (dueSoon.length) lines.push('', `Renewing within 30 days: ${dueSoon.map((p) => `${p.product} (${formatShortDate(p.expiryDate)})`).join(', ')}`)
  if (data.client.adviserName) lines.push('', `Your adviser: ${data.client.adviserName}, ${data.organization.phone}`)
  lines.push('', menu())
  return lines.join('\n')
}

function policiesReply(data: PortalData): string {
  const live = data.policies.filter((p) => p.status !== 'cancelled')
  if (!live.length) return `No policies on file yet. Reply QUOTE to ask for cover, or your adviser will place it after your risk review.\n\n${menu()}`
  const lines = ['Your policies:', '']
  for (const p of live) {
    const days = daysUntil(p.expiryDate)
    lines.push(`• ${p.product} — ${p.insurer}`, `  ${p.policyNumber} · ${formatKES(p.premium)}/yr · ${days < 0 ? `expired ${formatShortDate(p.expiryDate)}` : `renews ${formatShortDate(p.expiryDate)} (${days} days)`}`)
    if (p.keyExclusions) lines.push(`  Note: ${p.keyExclusions}`)
  }
  lines.push('', `Documents: ${SITE}/portal`)
  return lines.join('\n')
}

function quotesReply(data: PortalData): string {
  if (!data.quotes.length) return `No quotes in progress. Reply QUOTE to ask for cover.\n\n${menu()}`
  const stageLabel: Record<string, string> = { requested: 'waiting for insurers', compared: 'being compared', proposed: 'proposal sent to you', accepted: 'accepted, being placed' }
  const lines = ['Quotes in progress:', '']
  for (const q of data.quotes) {
    const received = q.submissions.filter((s) => s.status === 'received' || s.status === 'ready').length
    lines.push(`• ${q.product} (${q.reference}) — ${stageLabel[q.stage] ?? q.stage}`, `  ${received} of ${q.submissions.length} insurers have replied`)
  }
  lines.push('', `Compare them: ${SITE}/portal`)
  return lines.join('\n')
}

function claimsReply(data: PortalData): string {
  const open = data.claims.filter((c) => c.stage !== 'closed')
  if (!open.length) return `No open claims. Reply CLAIM to report one, or call ${data.organization.phone}.\n\n${menu()}`
  const lines = ['Your claims:', '']
  for (const c of open) {
    const stage = CLAIM_STAGES.find((s) => s.id === c.stage)?.label ?? c.stage
    lines.push(`• ${c.reference} — ${c.product}, ${c.insurer}`, `  Stage: ${stage}${c.amount ? ` · ${formatKES(c.amount)}` : ''}`)
    if (c.nextUpdateDue) lines.push(`  Next update: ${formatShortDate(c.nextUpdateDue)}`)
  }
  return lines.join('\n')
}

function adviserReply(data: PortalData): string {
  const name = data.client?.adviserName ?? `Your ${data.organization.shortName} adviser`
  return [`${name} will call you back on this number within one working day.`, `Urgent? Call ${data.organization.phone} or email ${data.organization.email}.`].join('\n')
}

/* ---------- Quote flow ---------- */

function matchProduct(text: string): string | null {
  const t = text.toLowerCase()
  const aliases: [RegExp, string][] = [
    [/\bfleet\b/, 'Motor Fleet'],
    [/third\s*party/, 'Motor Third Party'],
    [/\b(motor|car|vehicle|gari)\b/, 'Motor Comprehensive'],
    [/\bfire\b|\bperils?\b/, 'Fire & Allied Perils'],
    [/burglar|theft/, 'Burglary'],
    [/interruption/, 'Business Interruption'],
    [/group\s*medical|staff\s*medical/, 'Group Medical'],
    [/medical|health|hospital/, 'Individual Medical'],
    [/wiba|workmen|work injury|employees?\b/, 'WIBA'],
    [/personal accident|\bgpa\b/, 'Group Personal Accident'],
    [/public liability|liability/, 'Public Liability'],
    [/professional|indemnity/, 'Professional Indemnity'],
    [/transit|goods/, 'Goods in Transit'],
    [/domestic|home|house/, 'Domestic Package'],
    [/travel/, 'Travel'],
    [/\blife\b/, 'Life'],
  ]
  for (const [re, product] of aliases) if (re.test(t)) return product
  return null
}

function productMenu(): string {
  return PRODUCT_LINES.map((p, i) => `${i + 1} ${p}`).join('\n')
}

async function startQuoteFlow(phone: string, text: string, data: PortalData): Promise<string> {
  if (!data.client) return 'Your adviser will set up your risk review first. Reply ADVISER and we will call you.'
  const product = matchProduct(text.replace(/^(quote|request|i need|i want|get me)\s*/i, ''))
  if (product) {
    await saveState(phone, { flow: 'quote', step: 'notes', data: { product } })
    return `${product} — got it. Anything we should know? (vehicle, value, staff numbers, location). Reply with details or SKIP.`
  }
  await saveState(phone, { flow: 'quote', step: 'product', data: {} })
  return `What would you like cover for? Reply with a number or name:\n${productMenu()}`
}

async function startClaimFlow(phone: string, data: PortalData): Promise<string> {
  if (!data.client) return 'We need a policy on file before a claim. Reply ADVISER and we will call you.'
  const policies = data.policies.filter((p) => p.status === 'live' || p.status === 'renewal-due')
  if (!policies.length) return `No live policy on file. If you believe this is wrong, reply ADVISER or call ${data.organization.phone}.`
  await saveState(phone, { flow: 'claim', step: 'policy', data: {} })
  return ['Sorry to hear that. Which policy is this about? Reply with the number:', ...policies.map((p, i) => `${i + 1} ${p.product} — ${p.insurer} (${p.policyNumber})`)].join('\n')
}

async function continueFlow(user: PublicUser, phone: string, state: FlowState, text: string): Promise<string> {
  const client = await clientForUser(user.id)
  if (!client) {
    await clearState(phone)
    return 'Your adviser will set up your risk review first. Reply ADVISER and we will call you.'
  }

  if (state.flow === 'quote') {
    if (state.step === 'product') {
      const index = Number(text) - 1
      const product = PRODUCT_LINES[index] ?? matchProduct(text)
      if (!product) return `I did not catch that. Reply with a number:\n${productMenu()}\nOr STOP to cancel.`
      await saveState(phone, { flow: 'quote', step: 'notes', data: { product } })
      return `${product} — got it. Anything we should know? (vehicle, value, staff numbers, location). Reply with details or SKIP.`
    }
    if (state.step === 'notes') {
      const notes = /^skip$/i.test(text) ? null : text.slice(0, 500)
      await clearState(phone)
      const quote = await requestQuote({ client, product: state.data.product, notes, channel: 'whatsapp', actorUserId: user.id })
      return `Done. Reference ${quote.reference}. Your adviser will approach our panel and you will hear from us as each insurer replies. Reply QUOTES any time to check.`
    }
  }

  if (state.flow === 'claim') {
    const policies = await policiesForClient(client.id)
    if (state.step === 'policy') {
      const policy = policies.filter((p) => p.status === 'live' || p.status === 'renewal-due')[Number(text) - 1]
      if (!policy) return 'Reply with the number of the policy, or STOP to cancel.'
      await saveState(phone, { flow: 'claim', step: 'description', data: { policyId: policy.id } })
      return 'In a few words, what happened, and when? (e.g. "Shop broken into last night, stock taken")'
    }
    if (state.step === 'description') {
      if (text.length < 8) return 'Please tell us a little more about what happened, or STOP to cancel.'
      await saveState(phone, { flow: 'claim', step: 'confirm', data: { ...state.data, description: text.slice(0, 1000) } })
      return `We will report this now and register it with the insurer within 24 hours. Reply YES to confirm or STOP to cancel.`
    }
    if (state.step === 'confirm') {
      if (!/^(yes|y|ndio|ok|confirm)$/i.test(text)) return 'Reply YES to confirm the claim, or STOP to cancel.'
      const policy = policies.find((p) => p.id === state.data.policyId) ?? null
      await clearState(phone)
      const claim = await reportClaim({
        client,
        policy,
        product: policy?.product ?? 'Unknown',
        insurer: policy?.insurer ?? 'Unknown',
        description: state.data.description,
        incidentDate: null,
        channel: 'whatsapp',
        actorUserId: user.id,
      })
      return `Claim ${claim.reference} recorded. Keep photos, receipts and any police or assessor reports safe. We will update you every week. Reply CLAIMS to check progress.`
    }
  }

  await clearState(phone)
  return `Let's start again.\n\n${menu()}`
}

/* ---------- Agency users ---------- */

async function agencyReply(user: PublicUser, text: string): Promise<string> {
  const orgId = user.organizationId ?? 'org_goldoak'
  const org = await getOrganization(orgId)
  const lower = text.toLowerCase()
  if (/^(menu|help|hi|hello)$/.test(lower)) {
    return [`Hi ${user.name.split(' ')[0]} (${org?.shortName ?? 'agency'} workspace). Ask me:`, '', '• TODAY — your queue', '• RENEWALS — next 30 days', '• QUOTES — outstanding', '• CLAIMS — open claims', '• FIND <name> — a client', '• WITHOUT <product> — coverage gaps', '', `Full workspace: ${SITE}/agency/today`].join('\n')
  }
  const result = await runAgencyCommand(orgId, text)
  const lines = [result.title, '', ...result.lines.map((l) => (l.detail ? `• ${l.text}\n  ${l.detail}` : `• ${l.text}`))]
  if (result.actions[0]) lines.push('', `${result.actions[0].label}: ${SITE}${result.actions[0].href}`)
  return lines.join('\n')
}

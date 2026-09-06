import { daysUntil, formatKES, formatShortDate } from '@/lib/format'
import { getPortalData } from '@/services/portal'
import { findUserByPhone } from '@/services/users'
import { CLAIM_STAGES, JOURNEY_STAGES, type PortalData } from '@/types/platform'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://goldoak.vercel.app'

export type Intent = 'status' | 'policies' | 'quotes' | 'claims' | 'adviser' | 'help'

export function detectIntent(text: string): Intent {
  const t = text.trim().toLowerCase()
  if (/^(hi|hello|hey|habari|jambo|status|progress|update|start|menu)\b/.test(t) || t === '1') return 'status'
  if (/polic|cover|insurance/.test(t) || t === '2') return 'policies'
  if (/quote/.test(t) || t === '3') return 'quotes'
  if (/claim/.test(t) || t === '4') return 'claims'
  if (/agent|adviser|advisor|call|talk|human|help me/.test(t) || t === '5') return 'adviser'
  return 'help'
}

/** Builds the reply for an inbound WhatsApp message from `phone` (E.164 digits). */
export async function replyFor(phone: string, text: string): Promise<string> {
  const user = await findUserByPhone(phone)
  if (!user || user.role !== 'client') {
    return [
      'Hello from GoldOak Insurance. This number is not linked to a client account yet.',
      '',
      `Create your free account at ${SITE}/signup using this phone number, then message us again to see your progress, policies, quotes and claims.`,
      '',
      'Prefer to talk? Reply ADVISER and we will call you.',
    ].join('\n')
  }

  const data = await getPortalData(user.id)
  if (!data) return 'We could not load your account right now. Please try again in a moment.'

  const first = user.name.split(' ')[0]
  switch (detectIntent(text)) {
    case 'status':
      return statusReply(first, data)
    case 'policies':
      return policiesReply(data)
    case 'quotes':
      return quotesReply(data)
    case 'claims':
      return claimsReply(data)
    case 'adviser':
      return adviserReply(data)
    default:
      return helpReply(first)
  }
}

function menu(): string {
  return ['Reply with a number or word:', '1  Status', '2  Policies', '3  Quotes', '4  Claims', '5  Adviser'].join('\n')
}

function helpReply(first: string): string {
  return `Hi ${first}, this is GoldOak Insurance.\n\n${menu()}`
}

function statusReply(first: string, data: PortalData): string {
  if (!data.client) {
    return `Hi ${first}. Your account is set up and your adviser will be in touch to start your risk review.\n\n${menu()}`
  }
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
  if (dueSoon.length) {
    lines.push('', `Renewing within 30 days: ${dueSoon.map((p) => `${p.product} (${formatShortDate(p.expiryDate)})`).join(', ')}`)
  }
  if (data.client.adviserName) lines.push('', `Your adviser: ${data.client.adviserName}, ${data.organization.phone}`)
  lines.push('', menu())
  return lines.join('\n')
}

function policiesReply(data: PortalData): string {
  const live = data.policies.filter((p) => p.status !== 'cancelled')
  if (!live.length) return `No policies on file yet. Your adviser will place cover once your risk review is complete.\n\n${menu()}`
  const lines = ['Your policies:', '']
  for (const p of live) {
    const days = daysUntil(p.expiryDate)
    const when = days < 0 ? `expired ${formatShortDate(p.expiryDate)}` : `renews ${formatShortDate(p.expiryDate)} (${days} days)`
    lines.push(`• ${p.product} — ${p.insurer}`, `  ${p.policyNumber} · ${formatKES(p.premium)}/yr · ${when}`)
  }
  lines.push('', `Documents and exclusions: ${SITE}/portal`)
  return lines.join('\n')
}

function quotesReply(data: PortalData): string {
  if (!data.quotes.length) return `No quotes in progress right now.\n\n${menu()}`
  const stageLabel: Record<string, string> = {
    requested: 'waiting for insurers',
    compared: 'being compared',
    proposed: 'proposal sent to you',
    accepted: 'accepted, being placed',
  }
  const lines = ['Quotes in progress:', '']
  for (const q of data.quotes) {
    const received = q.submissions.filter((s) => s.status === 'received' || s.status === 'ready').length
    lines.push(`• ${q.product} (${q.reference}) — ${stageLabel[q.stage] ?? q.stage}`, `  ${received} of ${q.submissions.length} insurers have replied`)
  }
  lines.push('', `See the comparison: ${SITE}/portal`)
  return lines.join('\n')
}

function claimsReply(data: PortalData): string {
  const open = data.claims.filter((c) => c.stage !== 'closed')
  if (!open.length) return `No open claims. To report one, reply ADVISER or call ${data.organization.phone}.\n\n${menu()}`
  const lines = ['Your claims:', '']
  for (const c of open) {
    const stage = CLAIM_STAGES.find((s) => s.id === c.stage)?.label ?? c.stage
    lines.push(`• ${c.reference} — ${c.product}, ${c.insurer}`, `  Stage: ${stage}${c.amount ? ` · ${formatKES(c.amount)}` : ''}`)
    if (c.nextUpdateDue) lines.push(`  Next update: ${formatShortDate(c.nextUpdateDue)}`)
  }
  return lines.join('\n')
}

function adviserReply(data: PortalData): string {
  const name = data.client?.adviserName ?? 'Your GoldOak adviser'
  return [
    `${name} will call you back on this number within one working day.`,
    `Urgent? Call ${data.organization.phone} or email ${data.organization.email}.`,
  ].join('\n')
}

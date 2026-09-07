import { hashPassword } from '@/lib/auth/password'
import { choice, parseDate, parseEmail, parseName, parseText, type Flow, type FlowContext, type FlowData } from '@/lib/conversation/engine'
import { bold, formatIntl, success } from '@/lib/conversation/messages'
import { formatShortDate } from '@/lib/format'
import { onClientSignedUp } from '@/services/automation'
import { linkContact } from '@/services/conversations'
import { policiesForClient, reportClaim, requestQuote } from '@/services/journey'
import { createClientUser, emailOrPhoneTaken, listOrganizations } from '@/services/users'
import { PRODUCT_LINES, type Organization } from '@/types/platform'

/**
 * The WhatsApp workflows, built on the step engine. Each `onComplete` calls the
 * same service the website uses, so a sign-up or a claim from WhatsApp is
 * indistinguishable from one made on the site.
 */

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://goldoak.vercel.app'

export function generatePassword(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  const bytes = new Uint8Array(12)
  crypto.getRandomValues(bytes)
  let out = ''
  for (const b of bytes) out += alphabet[b % alphabet.length]
  return `${out.slice(0, 4)}-${out.slice(4, 8)}-${out.slice(8)}`
}

/* ---------- Sign-up ---------- */

const KINDS = ['Myself or my family', 'My business', 'An organisation or group'] as const

export const signupFlow: Flow = {
  id: 'signup',
  title: 'Create your account',
  intro: (ctx) => `Great, let's set you up with ${ctx.organization?.shortName ?? 'us'}. It takes about a minute.`,
  steps: [
    { id: 'name', label: 'Full name', question: 'What is your full name?', parse: parseName },
    {
      id: 'kind',
      label: 'Cover for',
      question: 'Who is the insurance for?',
      choices: [...KINDS],
      parse: (input) => {
        const value = choice(KINDS, input, { 'My business': /business|company|shop|biashara/, 'Myself or my family': /me|myself|family|personal/, 'An organisation or group': /organi|group|sacco|church|school|ngo/ })
        return value ? { ok: true, value: value === KINDS[0] ? 'individual' : value === KINDS[1] ? 'sme' : 'corporate', display: value } : { ok: false, error: 'Reply 1, 2 or 3.' }
      },
    },
    {
      id: 'businessName',
      label: 'Business name',
      question: 'What is the name of the business or organisation?',
      skip: (data) => data.kind === 'individual',
      parse: parseText(2, 120, 'Please send the registered or trading name.'),
    },
    {
      id: 'email',
      label: 'Email',
      question: 'What is your email address? We use it as your username on the website.',
      parse: async (input) => {
        const parsed = parseEmail(input)
        if (!parsed.ok) return parsed
        const taken = await emailOrPhoneTaken(String(parsed.value), null)
        if (taken === 'email') return { ok: false, error: `${String(parsed.value)} already has an account. Sign in at ${SITE}/signin, or use a different email.` }
        return parsed
      },
    },
    {
      id: 'protect',
      label: 'What to protect',
      question: 'In a few words, what would you like to protect? (for example "my car and my shop stock")',
      optional: true,
      parse: parseText(2, 500, 'A few words is enough, or reply SKIP.'),
    },
  ],
  onComplete: async (ctx, data) => {
    const org = ctx.organization
    if (!org) throw new Error('Sign-up needs an organisation')
    const password = generatePassword()
    const name = String(data.name)
    const kind = data.kind === 'sme' || data.kind === 'corporate' ? data.kind : 'individual'
    const businessName = data.businessName ? String(data.businessName) : null
    const protect = data.protect ? String(data.protect) : null
    const { user, clientId } = await createClientUser({
      organizationId: org.id,
      name,
      email: String(data.email),
      phone: ctx.phone,
      passwordHash: await hashPassword(password),
      businessName,
      clientType: kind,
      notes: protect,
    })
    await linkContact(ctx.phone, { userId: user.id, organizationId: org.id })
    await onClientSignedUp({ user, clientId, clientName: businessName ?? name, protect })
    return success(`Welcome to ${org.shortName}, ${name.split(' ')[0]}`, [
      `Your account is ready and linked to ${formatIntl(ctx.phone)}. Your adviser at ${org.shortName} will contact you within one working day to start your risk review.`,
      '',
      bold('Your website login'),
      `${SITE}/signin`,
      `Username: ${String(data.email)}`,
      `Password: ${password}`,
      '_Keep this message safe. You can change the password in your portal._',
      '',
      'Reply MENU to see everything you can do here.',
    ])
  },
}

/* ---------- Choose an agency (shared number, unknown contact) ---------- */

export function joinFlow(orgs: Organization[]): Flow {
  const names = orgs.map((o) => o.name)
  return {
    id: 'join',
    title: 'Choose your agency',
    noConfirm: true,
    steps: [
      {
        id: 'org',
        label: 'Agency',
        question: 'Super Agent serves several insurance agencies. Which one are you contacting?',
        choices: names,
        hint: 'If your agency gave you a code, send it (for example JOIN GOLDOAK).',
        parse: (input) => {
          const code = input.trim().replace(/^join\s+/i, '').toUpperCase()
          const byCode = orgs.find((o) => o.code?.toUpperCase() === code)
          const picked = byCode ?? orgs.find((o) => o.name === choice(names, input))
          return picked ? { ok: true, value: picked.id, display: picked.name } : { ok: false, error: 'Reply with the number of your agency, or its code.' }
        },
      },
    ],
    onComplete: async (ctx, data) => {
      await linkContact(ctx.phone, { organizationId: String(data.org) })
      const org = orgs.find((o) => o.id === data.org)
      return `You are now talking to ${org?.name ?? 'your agency'}. Reply MENU to continue.`
    },
  }
}

export async function activeOrganizations(): Promise<Organization[]> {
  return listOrganizations(true)
}

/* ---------- Ask for cover (quote) ---------- */

const PRODUCT_ALIASES: Record<string, RegExp> = {
  'Motor Fleet': /\bfleet\b/,
  'Motor Third Party': /third\s*party/,
  'Motor Comprehensive': /\b(motor|car|vehicle|gari|comprehensive)\b/,
  'Fire & Allied Perils': /\bfire\b|\bperils?\b/,
  Burglary: /burglar|theft/,
  'Business Interruption': /interruption/,
  'Group Medical': /group\s*medical|staff\s*medical/,
  'Individual Medical': /medical|health|hospital/,
  WIBA: /wiba|workmen|work injury|employees?\b/,
  'Group Personal Accident': /personal accident|\bgpa\b/,
  'Public Liability': /public liability|liability/,
  'Professional Indemnity': /professional|indemnity/,
  'Goods in Transit': /transit|goods/,
  'Domestic Package': /domestic|home|house/,
  Travel: /travel/,
  Life: /\blife\b/,
}

export function matchProduct(text: string): string | null {
  return choice(PRODUCT_LINES, text, PRODUCT_ALIASES)
}

export const quoteFlow: Flow = {
  id: 'quote',
  title: 'Ask for cover',
  steps: [
    {
      id: 'product',
      label: 'Cover',
      question: 'What would you like cover for?',
      choices: [...PRODUCT_LINES],
      parse: (input) => {
        const product = matchProduct(input)
        return product ? { ok: true, value: product } : { ok: false, error: 'Reply with a number from the list, or the name of the cover.' }
      },
    },
    {
      id: 'notes',
      label: 'Details',
      question: 'Anything we should know? Vehicle, value, number of staff, location, current insurer.',
      optional: true,
      parse: parseText(2, 500, 'A few words help us quote accurately, or reply SKIP.'),
    },
  ],
  onComplete: async (ctx, data) => {
    if (!ctx.client || !ctx.user) throw new Error('Quote needs a client')
    const quote = await requestQuote({ client: ctx.client, product: String(data.product), notes: data.notes ? String(data.notes) : null, channel: 'whatsapp', actorUserId: ctx.user.id })
    return success(`Request ${quote.reference} received`, [
      `Your adviser will approach our panel for ${quote.product} and you will hear from us as each insurer replies.`,
      '',
      'Reply 3 any time to see your quotes, or MENU for everything else.',
    ])
  },
}

/* ---------- Report a claim ---------- */

async function livePolicies(ctx: FlowContext) {
  if (!ctx.client) return []
  const policies = await policiesForClient(ctx.client.id)
  return policies.filter((p) => p.status === 'live' || p.status === 'renewal-due')
}

export const claimFlow: Flow = {
  id: 'claim',
  title: 'Report a claim',
  intro: () => 'Sorry to hear something happened. Let me take the details so your adviser can register the claim today.',
  steps: [
    {
      id: 'policyId',
      label: 'Policy',
      question: 'Which policy is this about?',
      choices: async (ctx) => (await livePolicies(ctx)).map((p) => `${p.product} — ${p.insurer} (${p.policyNumber})`),
      parse: async (input, ctx) => {
        const policies = await livePolicies(ctx)
        const labels = policies.map((p) => `${p.product} — ${p.insurer} (${p.policyNumber})`)
        const label = choice(labels, input)
        const policy = policies[labels.indexOf(label ?? '')]
        return policy ? { ok: true, value: policy.id, display: `${policy.product}, ${policy.insurer}` } : { ok: false, error: 'Reply with the number of the policy.' }
      },
    },
    {
      id: 'description',
      label: 'What happened',
      question: 'In a few sentences, what happened? (for example "Shop broken into overnight, stock and a laptop taken")',
      parse: parseText(8, 1000, 'Please tell us a little more about what happened.'),
    },
    {
      id: 'incidentDate',
      label: 'When',
      question: 'When did it happen?',
      hint: 'Reply TODAY, YESTERDAY or a date like 12/08/2026.',
      optional: true,
      parse: parseDate,
    },
  ],
  onComplete: async (ctx, data: FlowData) => {
    if (!ctx.client || !ctx.user) throw new Error('Claim needs a client')
    const policies = await policiesForClient(ctx.client.id)
    const policy = policies.find((p) => p.id === data.policyId) ?? null
    const claim = await reportClaim({
      client: ctx.client,
      policy,
      product: policy?.product ?? 'Unknown',
      insurer: policy?.insurer ?? 'Unknown',
      description: String(data.description),
      incidentDate: data.incidentDate ? String(data.incidentDate) : null,
      channel: 'whatsapp',
      actorUserId: ctx.user.id,
    })
    return success(`Claim ${claim.reference} recorded`, [
      `We register it with ${claim.insurer} within 24 hours and update you every week until it is settled.`,
      '',
      bold('What to keep safe'),
      '• Photos of the damage or scene',
      '• Receipts, invoices and valuations',
      '• Police abstract or assessor report, if any',
      '',
      `Reply 4 any time to check progress. Your next update is due ${claim.nextUpdateDue ? formatShortDate(claim.nextUpdateDue) : 'within a week'}.`,
    ])
  },
}

export const FLOWS: Record<string, Flow> = { signup: signupFlow, quote: quoteFlow, claim: claimFlow }

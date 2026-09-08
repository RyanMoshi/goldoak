import { generateTempPassword, hashPassword } from '@/lib/auth/password'
import { sendTemplateEmail } from '@/services/emails'
import { choice, parseDate, parseEmail, parseName, parseText, type Flow, type FlowContext, type FlowData } from '@/lib/conversation/engine'
import { bold, formatIntl, success } from '@/lib/conversation/messages'
import { formatShortDate, normalizePhone } from '@/lib/format'
import { onClientSignedUp } from '@/services/automation'
import { searchBusinesses, submitBusinessClaim } from '@/services/businesses'
import { linkContact } from '@/services/conversations'
import { createEnquiry } from '@/services/enquiries'
import { policiesForClient, reportClaim, requestQuote } from '@/services/journey'
import { createClientUser, emailOrPhoneTaken, findUserByPhone, listOrganizations, updateUserName } from '@/services/users'
import { PRODUCT_LINES, type Business, type Organization } from '@/types/platform'

/**
 * The WhatsApp workflows, built on the step engine. Each `onComplete` calls the
 * same service the website uses, so a registration, a business claim or a
 * claim from WhatsApp is indistinguishable from one made on the site.
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

/* ---------- Registration ---------- */

const KINDS = ['Individual', 'Business', 'Agency'] as const

export const registrationFlow: Flow = {
  id: 'signup',
  title: "Let's get you registered",
  intro: (ctx) => `Great, let's set you up with ${ctx.organization?.shortName ?? 'us'}. This takes about two minutes.`,
  steps: [
    {
      id: 'name',
      label: 'Full name',
      question: 'What is your full name?',
      parse: parseName,
    },
    {
      id: 'email',
      label: 'Email',
      question: 'What is your email address? It becomes your username on the website.',
      parse: async (input) => {
        const parsed = parseEmail(input)
        if (!parsed.ok) return parsed
        const taken = await emailOrPhoneTaken(String(parsed.value), null)
        if (taken === 'email') return { ok: false, error: `${String(parsed.value)} already has an account. Sign in at ${SITE}/signin, or use a different email.` }
        return parsed
      },
    },
    {
      id: 'kind',
      label: 'Customer type',
      question: 'What type of customer are you?',
      choices: [...KINDS],
      parse: (input) => {
        const value = choice(KINDS, input, { Business: /business|company|shop|biashara|sme/, Individual: /me|myself|family|personal|individual/, Agency: /agency|agent|broker/ })
        if (value === 'Agency') return { ok: false, error: `Agencies register on the website so we can set up your workspace: ${SITE}/agencies/signup\n\nIf you are here as a customer, reply 1 or 2.` }
        return value ? { ok: true, value: value === 'Business' ? 'sme' : 'individual', display: value } : { ok: false, error: 'Reply 1 for Individual or 2 for Business.' }
      },
    },
    {
      id: 'businessName',
      label: 'Business name',
      question: 'What is the name of the business?',
      skip: (data) => data.kind !== 'sme',
      parse: parseText(2, 120, 'Please send the registered or trading name.'),
    },
    {
      id: 'phone',
      label: 'Phone',
      question: (ctx) => `Please confirm your phone number. Reply 1 to use ${formatIntl(ctx.phone)} (this chat), or type another number.`,
      hint: 'WhatsApp reminders and updates go to this number.',
      parse: (input, ctx) => {
        if (/^(1|yes|y|this|same|ok)$/i.test(input.trim())) return { ok: true, value: ctx.phone, display: formatIntl(ctx.phone) }
        const phone = normalizePhone(input)
        if (!phone) return { ok: false, error: 'Reply 1 to use this number, or type a valid mobile number like 0712 345 678.' }
        return { ok: true, value: phone, display: formatIntl(phone) }
      },
    },
  ],
  onComplete: async (ctx, data) => {
    const org = ctx.organization
    if (!org) throw new Error('Registration needs an organisation')
    const phone = String(data.phone ?? ctx.phone)
    if (phone !== ctx.phone) {
      const taken = await emailOrPhoneTaken(null, phone)
      if (taken === 'phone') throw new Error('That phone number is already on another account.')
    }
    const password = generateTempPassword()
    const name = String(data.name)
    const kind = data.kind === 'sme' ? 'sme' : 'individual'
    const businessName = data.businessName ? String(data.businessName) : null
    const { user, clientId } = await createClientUser({ organizationId: org.id, name, email: String(data.email), phone, passwordHash: await hashPassword(password), businessName, clientType: kind, notes: null, temporaryPassword: true })
    await linkContact(ctx.phone, { userId: user.id, organizationId: org.id })
    void sendTemplateEmail({ key: 'temp-password', to: String(data.email), organizationId: org.id, userId: user.id, clientId, vars: { first_name: name.split(' ')[0], email: String(data.email), temporary_password: password, login_url: `${SITE}/signin`, role_label: '' }, category: 'security' }).catch(() => null)
    await onClientSignedUp({ user, clientId, clientName: businessName ?? name, protect: null })
    return success(`Welcome to ${org.shortName}, ${name.split(' ')[0]}`, [
      `Your account is ready. Your adviser at ${org.shortName} will contact you within one working day.`,
      '',
      bold('Your website login'),
      `${SITE}/signin`,
      `Username: ${String(data.email)}`,
      `Temporary password: ${password}`,
      '_You will choose your own password the first time you sign in. We have also emailed these details._',
      '',
      bold('What next?'),
      'Reply 3 for insurance assistance, 5 to upload a document, or MENU for everything.',
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
      return `You are now talking to ${org?.name ?? 'your agency'}.`
    },
  }
}

export async function activeOrganizations(): Promise<Organization[]> {
  return listOrganizations(true)
}

/* ---------- Find or claim a business ---------- */

const RELATIONSHIPS = ['Owner or director', 'Manager or staff', 'Authorised representative'] as const

function businessLabel(b: Business): string {
  return b.registrationNo ? `${b.name} (${b.registrationNo})` : b.name
}

export const claimBusinessFlow: Flow = {
  id: 'claim-business',
  title: 'Claim a business',
  intro: () => "I'll help you link an existing business to your account.",
  steps: [
    {
      id: 'query',
      label: 'Business name',
      question: 'What is the business name? Type the name (or registration number) and I will search.',
      parse: async (input, ctx) => {
        const q = input.trim()
        if (q.length < 2) return { ok: false, error: 'Type at least two letters of the business name.' }
        if (!ctx.organization) return { ok: false, error: 'Choose your agency first (reply MENU).' }
        const found = await searchBusinesses(ctx.organization.id, q)
        if (!found.length) return { ok: false, error: `I could not find a business matching "${q}". Check the spelling, or reply CANCEL and ask an adviser (7) to add it.` }
        return { ok: true, value: { q, matches: found.map((b) => ({ id: b.id, label: businessLabel(b) })) }, display: q }
      },
    },
    {
      id: 'businessId',
      label: 'Business',
      question: 'I found these businesses. Which one is yours?',
      choices: (_ctx, data) => ((data.query as { matches?: { label: string }[] })?.matches ?? []).map((m) => m.label),
      parse: (input, _ctx, data) => {
        const matches = (data.query as { matches?: { id: string; label: string }[] })?.matches ?? []
        const label = choice(
          matches.map((m) => m.label),
          input,
        )
        const picked = matches.find((m) => m.label === label)
        return picked ? { ok: true, value: picked.id, display: picked.label } : { ok: false, error: 'Reply with the number of the business.' }
      },
    },
    {
      id: 'relationship',
      label: 'Your role',
      question: 'What is your relationship with this business?',
      choices: [...RELATIONSHIPS],
      parse: (input) => {
        const value = choice(RELATIONSHIPS, input, { 'Owner or director': /owner|director|founder|proprietor/, 'Manager or staff': /manager|staff|employee|accountant/, 'Authorised representative': /represent|agent|lawyer|advocate/ })
        return value ? { ok: true, value } : { ok: false, error: 'Reply 1, 2 or 3.' }
      },
    },
    {
      id: 'verification',
      label: 'Verification',
      question: 'How can the agency verify you? Send the business registration number, a business phone or email, or the name of the person at the agency who knows you.',
      hint: 'An adviser checks this before approving. You can also upload a document afterwards (reply 5).',
      parse: parseText(3, 300, 'Send something the agency can check, for example the registration number.'),
    },
  ],
  onComplete: async (ctx, data) => {
    if (!ctx.organization) throw new Error('Business claim needs an organisation')
    const matches = (data.query as { matches?: { id: string; label: string }[] })?.matches ?? []
    const picked = matches.find((m) => m.id === data.businessId)
    const applicant = ctx.user?.name ?? (ctx.client?.name ?? 'WhatsApp contact')
    const claim = await submitBusinessClaim({
      organizationId: ctx.organization.id,
      businessId: String(data.businessId),
      clientId: ctx.client?.id ?? null,
      userId: ctx.user?.id ?? null,
      phone: ctx.phone,
      applicantName: applicant,
      relationship: String(data.relationship),
      verification: data.verification ? String(data.verification) : null,
      channel: 'whatsapp',
    })
    return success(`Claim ${claim.reference} submitted`, [
      `${bold('Business')}: ${picked?.label ?? claim.businessName}`,
      `${bold('Applicant')}: ${applicant}`,
      '',
      `${ctx.organization.shortName} will verify your details and confirm here, usually within one working day.`,
      '',
      'Reply 6 any time to check this request, or 5 to upload a supporting document.',
      ctx.user ? '' : '\nTip: reply 1 to create your account so the business is linked to it once approved.',
    ].filter((l) => l !== undefined))
  },
}

/* ---------- Enquiry ---------- */

export const enquiryFlow: Flow = {
  id: 'enquiry',
  title: 'Make an enquiry',
  steps: [
    { id: 'subject', label: 'Subject', question: 'In a few words, what is your enquiry about?', hint: 'For example "Motor cover for a new car" or "My policy documents".', parse: parseText(3, 160, 'A few words are enough.') },
    { id: 'body', label: 'Details', question: 'Tell me the details. Include anything that helps the agency answer you in one go.', parse: parseText(8, 2000, 'Please add a little more detail.') },
    {
      id: 'name',
      label: 'Your name',
      question: 'What name should we use for you?',
      skip: (data) => typeof data.name === 'string' && data.name.length > 1,
      parse: parseName,
    },
  ],
  onComplete: async (ctx, data) => {
    if (!ctx.organization) throw new Error('Enquiry needs an organisation')
    const name = ctx.user?.name ?? String(data.name)
    const enquiry = await createEnquiry({ organizationId: ctx.organization.id, clientId: ctx.client?.id ?? null, userId: ctx.user?.id ?? null, phone: ctx.phone, name, subject: String(data.subject), body: String(data.body), channel: 'whatsapp' })
    return success(`Enquiry ${enquiry.reference} received`, [`${ctx.organization.shortName} will reply here, usually within one working day.`, '', 'Reply 6 any time to check its status, or MENU for other options.'])
  },
}

/* ---------- Change my name ---------- */

export const nameChangeFlow: Flow = {
  id: 'name-change',
  title: 'Update your name',
  noConfirm: true,
  steps: [
    {
      id: 'confirm',
      label: 'Confirm',
      question: (ctx, data) => `Change your name from ${bold(ctx.user?.name ?? 'unknown')} to ${bold(String(data.newName ?? ''))}?`,
      choices: ['Yes, update it', 'No, keep it'],
      parse: (input) => (/^(1|yes|y|ndio|sawa)$/i.test(input.trim()) ? { ok: true, value: true } : /^(2|no|n|hapana)$/i.test(input.trim()) ? { ok: true, value: false } : { ok: false, error: 'Reply 1 to update or 2 to keep it.' }),
    },
  ],
  onComplete: async (ctx, data) => {
    if (!data.confirm) return 'Kept as it was. Reply MENU for options.'
    if (!ctx.user) return 'Reply 1 to create an account first, then I can keep your name on file.'
    const newName = String(data.newName)
    await updateUserName(ctx.user.id, newName)
    return success('Name updated', [`I now have you as ${bold(newName)}. Your portal and documents use this name from now on.`])
  },
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
    return success(`Request ${quote.reference} received`, [`Your adviser will approach our panel for ${quote.product} and you will hear from us as each insurer replies.`, '', 'Reply 6 any time to check this request, or MENU for everything else.'])
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
    { id: 'description', label: 'What happened', question: 'In a few sentences, what happened?', hint: 'For example "Shop broken into overnight, stock and a laptop taken".', parse: parseText(8, 1000, 'Please tell us a little more about what happened.') },
    { id: 'incidentDate', label: 'When', question: 'When did it happen?', hint: 'Reply TODAY, YESTERDAY or a date like 12/08/2026.', optional: true, parse: parseDate },
  ],
  onComplete: async (ctx, data: FlowData) => {
    if (!ctx.client || !ctx.user) throw new Error('Claim needs a client')
    const policies = await policiesForClient(ctx.client.id)
    const policy = policies.find((p) => p.id === data.policyId) ?? null
    const claim = await reportClaim({ client: ctx.client, policy, product: policy?.product ?? 'Unknown', insurer: policy?.insurer ?? 'Unknown', description: String(data.description), incidentDate: data.incidentDate ? String(data.incidentDate) : null, channel: 'whatsapp', actorUserId: ctx.user.id })
    return success(`Claim ${claim.reference} recorded`, [
      `We register it with ${claim.insurer} within 24 hours and update you every week until it is settled.`,
      '',
      bold('What to send next'),
      'Reply 5 to upload photos of the damage, receipts, and any police abstract or assessor report. I read them and attach them to this claim.',
      '',
      `Reply 6 any time to check progress. Your next update is due ${claim.nextUpdateDue ? formatShortDate(claim.nextUpdateDue) : 'within a week'}.`,
    ])
  },
}

export const FLOWS: Record<string, Flow> = { signup: registrationFlow, quote: quoteFlow, claim: claimFlow, 'claim-business': claimBusinessFlow, enquiry: enquiryFlow, 'name-change': nameChangeFlow }

/** Whether this phone already belongs to an account (used before offering registration). */
export async function phoneRegistered(phone: string): Promise<boolean> {
  return Boolean(await findUserByPhone(phone))
}

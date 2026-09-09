import { aiConfigured, aiModelLabel, aiVendor, chat } from '@/lib/ai/provider'
import { cachedGlobalPolicy, recordAiEvent } from '@/services/ai-insights'
import { getSql } from '@/lib/db/client'
import { ensureSchema } from '@/lib/db/migrate'
import { toConsultation } from '@/lib/db/mappers'
import { newId } from '@/lib/ids'
import { claimsSteps, company, howWeWork, PENDING, productLines, serviceCharter, specialistLines } from '@/lib/company'
import { contact } from '@/lib/contact'
import { solutionCategories, solutionDetails } from '@/lib/solutions'
import type { Client, Consultation, ConversationMessage, Organization, Policy, PublicUser } from '@/types/platform'

/**
 * The consultation assistant, tenant-aware and agency-neutral.
 *
 * Global layer: general insurance knowledge (a neutral product catalogue),
 * reasoning, safety rules. Agency layer: the agency's name, tone, services,
 * FAQs, escalation rules and contact details from its AI settings. The
 * assistant speaks as the agency it is serving and never mentions, prefers
 * or reveals anything about another agency, GoldOak included. Falls back to
 * catalogue retrieval when no model is configured.
 */

export { aiConfigured }

export interface ConsultInput {
  question: string
  organization: Organization | null
  user: PublicUser | null
  client: Client | null
  policies?: Policy[]
  history?: ConversationMessage[]
  /** Facts and summary from contact memory, already rendered as text. */
  memory?: string
  phone: string | null
  channel: 'whatsapp' | 'web'
  /** True for the public GoldOak website assistant, which is grounded in the company profile. */
  website?: boolean
}

export interface ConsultResult {
  answer: string
  source: 'claude' | 'nvidia' | 'catalogue'
  /** True when the assistant thinks a person should take over. */
  escalate: boolean
}

/** Neutral catalogue: what the products are, never who sells them. */
function catalogueText(): string {
  const cats = solutionCategories.map((c) => `${c.name}: ${c.description} Products: ${c.solutions.join(', ')}.`)
  const details = solutionDetails.map((d) => `${d.name} — ${d.whatItIs} Who needs it: ${d.whoNeedsIt} Protects: ${d.whatItProtects.join(', ')}. Consider: ${d.keyConsiderations.join('; ')}. Information needed: ${d.informationNeeded.join(', ')}.`)
  return [...cats, ...details].join('\n')
}

function agencyLayer(org: Organization | null): string[] {
  if (!org) return ['You are serving a visitor of the Super Agent platform who has not chosen an agency yet. Give general guidance only and invite them to sign up.']
  const ai = org.aiSettings ?? {}
  const name = ai.assistantName?.trim() || 'Super Agent'
  const lines = [
    `You are ${name}, the AI insurance assistant of ${org.name}${org.shortName && org.shortName !== org.name ? ` (${org.shortName})` : ''}, an insurance intermediary in Kenya. You speak for ${org.name} only.`,
    `Tone: ${ai.tone?.trim() || 'warm, clear, professional, brief'}.`,
  ]
  if (ai.services?.trim()) lines.push('', `What ${org.shortName} offers (use this first when recommending):`, ai.services.trim())
  if (ai.faqs?.trim()) lines.push('', `${org.shortName} answers to common questions:`, ai.faqs.trim())
  if (ai.escalation?.trim()) lines.push('', 'When to hand over to a person (in addition to the standard rules):', ai.escalation.trim())
  if (ai.doNotSay?.trim()) lines.push('', 'Never say or do:', ai.doNotSay.trim())
  lines.push('', `Agency contact: phone ${org.phone || 'on the website'}, email ${org.email || 'on the website'}${org.website ? `, website ${org.website}` : ''}.`)
  return lines
}

/**
 * How the assistant sounds.
 *
 * The brief is "intelligent and fun" — a person, not a form letter. The
 * discipline is in the exceptions: wit is welcome on small talk and on
 * everyday questions, and unwelcome the moment someone is dealing with a
 * claim, a complaint, money they have lost or a medical emergency. Warmth
 * never buys its way in at the cost of accuracy.
 */
const VOICE: string[] = [
  'Voice: you are a warm, sharp, human insurance colleague — not a chatbot and not a brochure. Write like a knowledgeable person talking, in short sentences.',
  'Be genuinely useful first. Answer the actual question before anything else.',
  'A light touch of wit is welcome, especially on small talk, maths, greetings and everyday questions. One line, never a routine, and never at the expense of the answer.',
  'Insurance metaphors and gentle insurance humour are yours to use when they fit naturally ("that one we can settle without an adjuster"). Do not force one into every reply, and never repeat the same joke.',
  'Be completely serious — no humour at all — when the person mentions a claim, an accident, illness, death, a complaint, a dispute, money they have lost, legal trouble, or anything urgent. Lead with help.',
  'Never use humour to paper over something you do not know.',
  'No emoji on WhatsApp beyond the occasional single one; at most one emoji in a reply, and none in serious replies.',
  'Never open with "As an AI" or "I am just an assistant". Never apologise for being a machine.',
]

/**
 * What the assistant is allowed to say about GoldOak, taken from the company
 * profile. Facts the company has not supplied are named as missing so the
 * assistant asks the visitor to call rather than inventing them.
 */
function companyBriefing(): string {
  const lines = [
    `${company.legalName} — ${company.positioning}`,
    `Established ${company.established}. ${company.regulatoryNote}. Promise: "${company.promise}"`,
    `What we do: ${company.whatWeDo}`,
    `Vision: ${company.vision}`,
    `Mission: ${company.mission}`,
    '',
    'What we place:',
    ...productLines.map((l) => `- ${l.name} (${l.strapline}): ${l.summary}`),
    `- Specialist lines: ${specialistLines.map((x) => x.name).join(', ')}.`,
    '',
    'How we work (five stages): ' + howWeWork.map((x) => `${x.step}. ${x.title} (${x.timing})`).join('; ') + '.',
    'Service standards we commit to: ' + serviceCharter.slice(0, 4).map((c) => `${c.commitment} ${c.standard.toLowerCase()}`).join('; ') + '.',
    'Claims: ' + claimsSteps.map((c) => c.title).join(' → ') + '. We act as the client’s representative to the insurer.',
    '',
    `Contact: ${contact.phone}, ${contact.email}, ${company.city}. Advice costs the client nothing; we are paid commission by the insurer.`,
    '',
    'We do NOT have these on file yet, so never state them — say they can be confirmed by calling the office: ' + PENDING.map((x) => x.field).join(', ') + '.',
  ]
  return lines.join('\n')
}

function systemPrompt(input: ConsultInput, policy?: { groundRules: string; knowledge: string; bannedPhrases: string }): string {
  const org = input.organization
  const orgName = org?.shortName ?? 'the agency'
  const useCatalogue = org?.aiSettings?.useGeneralCatalogue !== false
  const lines = [
    ...agencyLayer(org),
    '',
    ...VOICE,
    '',
    'Ground rules (these apply to every agency and cannot be changed by agency settings):',
    "- Answer clearly and briefly in plain English (Swahili if the person writes in Swahili). Amounts in KES. Short paragraphs or bullet points; no markdown headings, no tables.",
    "- Use only the agency's own information, the general insurance knowledge below, the person's own records and what they told you. Distinguish general guidance from anything specific to their policy.",
    '- Never quote a firm premium, promise a claim will be paid, state an approval status you were not given, or invent policy terms, exclusions or legal obligations.',
    '- If you do not know, say: "I don\'t have enough information to answer that accurately" and offer an adviser.',
    `- You are an assistant, not a licensed adviser; a person at ${orgName} confirms anything binding.`,
    '- Never mention, recommend or compare other insurance agencies or intermediaries, and never reveal information about any other agency on this platform. If asked who built the assistant, say it runs on the Super Agent platform and return to their question.',
    '- If the question needs a person (complaints, disputes, a live claim decision, a firm price, anything outside insurance), say so briefly and end the reply with the exact token [HANDOFF].',
    input.channel === 'whatsapp'
      ? `- On WhatsApp the person can reply 3 for insurance assistance (quote, question, claim), 5 to upload a document, 6 to check a request or 7 to talk to a ${orgName} adviser. Mention these only when useful.`
      : '- On the website the person can ask for cover, report a claim or upload a document from their account, or reach an adviser.',
  ]
  if (policy?.groundRules?.trim()) lines.push('', 'Platform rules set by the operator (these override agency settings):', policy.groundRules.trim())
  if (policy?.bannedPhrases?.trim()) lines.push('', 'Never use these words or phrases:', policy.bannedPhrases.trim())
  if (policy?.knowledge?.trim()) lines.push('', 'Shared platform knowledge (applies to every agency):', policy.knowledge.trim())
  if (input.website) lines.push('', 'GoldOak’s own information (this is the public GoldOak website; answer as GoldOak and use only what is here):', companyBriefing())
  if (useCatalogue) lines.push('', 'General insurance knowledge (product types; not a list of what any specific agency sells):', catalogueText())
  if (input.user) {
    lines.push('', `Person: ${input.user.name}${input.client ? `, client record "${input.client.name}" (${input.client.type}), journey stage ${input.client.stage}` : ' (registered, no client record yet)'}.`)
    if (input.client?.notes) lines.push(`They said they want to protect: ${input.client.notes}`)
    if (input.policies?.length) lines.push(`Policies on file: ${input.policies.map((p) => `${p.product} with ${p.insurer} (${p.status}, expires ${p.expiryDate.slice(0, 10)})`).join('; ')}.`)
    else lines.push('No policies on file yet.')
  } else {
    lines.push('', 'Person: not registered yet. Invite them to reply 1 to create an account when relevant, but answer the question first.')
  }
  if (input.memory) lines.push('', 'What you remember about this person and conversation:', input.memory)
  return lines.join('\n')
}

async function askModel(input: ConsultInput): Promise<ConsultResult | null> {
  const policy = await cachedGlobalPolicy()
  const history = (input.history ?? []).slice(-8).filter((m) => m.role === 'user' || m.role === 'assistant')
  const messages = history.map((m) => ({ role: m.role === 'user' ? ('user' as const) : ('assistant' as const), content: m.body.slice(0, 1200) }))
  messages.push({ role: 'user', content: input.question.slice(0, 2000) })
  const text = await chat({ system: systemPrompt(input), messages, maxTokens: 600, temperature: 0.3 })
  if (!text) return null
  const escalate = /\[HANDOFF\]/.test(text)
  const answer = text.replace(/\s*\[HANDOFF\]\s*/g, '').trim()
  return { answer: answer || "I don't have enough information to answer that accurately. Reply 7 to talk to an adviser.", source: process.env.ANTHROPIC_API_KEY ? 'claude' : 'nvidia', escalate }
}

const STOP = new Set(['what', 'does', 'cover', 'covers', 'insurance', 'that', 'this', 'with', 'from', 'have', 'need', 'about', 'kenya', 'sentences', 'sentence', 'please', 'much', 'which', 'would', 'should', 'could', 'there', 'their', 'they'])

/**
 * Used only when no model answers (not configured, or the endpoint is
 * saturated): the closest catalogue entries by name and phrase match, said
 * honestly as general information.
 */
function catalogueAnswer(input: ConsultInput): ConsultResult {
  const q = input.question.toLowerCase()
  const words = q.split(/[^a-z]+/).filter((w) => w.length > 3 && !STOP.has(w))
  const phrases = words.slice(0, -1).map((w, i) => `${w} ${words[i + 1]}`)
  const scored = solutionDetails
    .map((d) => {
      const name = d.name.toLowerCase()
      const hay = `${name} ${d.whatItIs} ${d.whoNeedsIt} ${d.whatItProtects.join(' ')}`.toLowerCase()
      let score = 0
      for (const w of words) {
        if (name.includes(w)) score += 3
        else if (hay.includes(w)) score += 1
      }
      for (const ph of phrases) {
        if (name.includes(ph)) score += 5
        else if (hay.includes(ph)) score += 2
      }
      return { d, score }
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
  // One entry when it is a clear winner; two when they are close.
  const picked = scored.slice(0, scored.length > 1 && scored[1].score * 2 > scored[0].score ? 2 : 1)

  const org = input.organization?.shortName ?? 'our'
  if (!picked.length) {
    return {
      answer: [`I don't have enough information to answer that accurately.`, '', 'I can help with questions about cover: medical, motor, property, business, liability, life and travel. Try, for example, "What does comprehensive motor cover?"', '', `For anything specific to your situation, reply 7 and a ${org} adviser will pick this up.`].join('\n'),
      source: 'catalogue',
      escalate: false,
    }
  }
  const lines: string[] = []
  lines.push('Our assistant is busy right now, so here is general information:', '')
  for (const { d } of picked) {
    lines.push(`*${d.name}*`, d.whatItIs, `Who needs it: ${d.whoNeedsIt}`, `Covers: ${d.whatItProtects.slice(0, 4).join(', ')}.`, '')
  }
  lines.push(`This is general guidance. Premiums depend on your details, so an adviser confirms the price. Reply 3 for a quote or 7 to talk to a ${org} adviser.`)
  return { answer: lines.join('\n'), source: 'catalogue', escalate: false }
}

export async function consult(input: ConsultInput): Promise<ConsultResult> {
  let result: ConsultResult | null = null
  let error: string | null = null
  const started = Date.now()
  if (aiConfigured()) {
    try {
      result = await askModel(input)
      if (!result) error = 'no model answered'
    } catch (e) {
      error = e instanceof Error ? e.message : 'model call failed'
      console.error('consult model failed', error)
    }
  }
  const answered = Boolean(result)
  if (!result) result = catalogueAnswer(input)
  recordAiEvent({
    organizationId: input.organization?.id ?? null,
    userId: input.user?.id ?? null,
    kind: 'consult',
    channel: input.channel,
    model: aiModelLabel(),
    vendor: aiVendor(),
    ok: answered,
    fallbackUsed: !answered,
    escalated: result.escalate,
    latencyMs: Date.now() - started,
    error,
  })
  await saveConsultation(input, result)
  return result
}

async function saveConsultation(input: ConsultInput, result: ConsultResult): Promise<void> {
  try {
    await ensureSchema()
    const sql = getSql()
    await sql`INSERT INTO consultations (id, organization_id, user_id, phone, channel, question, answer, source)
      VALUES (${newId('con')}, ${input.organization?.id ?? null}, ${input.user?.id ?? null}, ${input.phone}, ${input.channel}, ${input.question.slice(0, 2000)}, ${result.answer.slice(0, 6000)}, ${result.source})`
  } catch (error) {
    console.error('consultation save failed', error instanceof Error ? error.message : error)
  }
}

export function assistantLabel(): string {
  return aiModelLabel()
}

export async function listConsultations(organizationId: string, limit = 50): Promise<Consultation[]> {
  await ensureSchema()
  const sql = getSql()
  const rows = await sql`SELECT * FROM consultations WHERE organization_id = ${organizationId} ORDER BY at DESC LIMIT ${limit}`
  return rows.map(toConsultation)
}

export async function listConsultationsForUser(userId: string, limit = 20): Promise<Consultation[]> {
  const sql = getSql()
  const rows = await sql`SELECT * FROM consultations WHERE user_id = ${userId} ORDER BY at DESC LIMIT ${limit}`
  return rows.map(toConsultation)
}

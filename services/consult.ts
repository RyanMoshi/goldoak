import { aiConfigured, aiModelLabel, chat } from '@/lib/ai/provider'
import { getSql } from '@/lib/db/client'
import { ensureSchema } from '@/lib/db/migrate'
import { toConsultation } from '@/lib/db/mappers'
import { newId } from '@/lib/ids'
import { solutionCategories, solutionDetails } from '@/lib/solutions'
import type { Client, Consultation, ConversationMessage, Organization, Policy, PublicUser } from '@/types/platform'

/**
 * The consultation assistant. Answers insurance questions in the agency's
 * voice using the product catalogue, the person's own profile, their memory
 * and the recent conversation. Grounded: it says what it does not know and
 * hands sensitive matters to a person. Falls back to catalogue retrieval when
 * no model is configured.
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
}

export interface ConsultResult {
  answer: string
  source: 'claude' | 'nvidia' | 'catalogue'
  /** True when the assistant thinks a person should take over. */
  escalate: boolean
}

function catalogueText(): string {
  const cats = solutionCategories.map((c) => `${c.name}: ${c.description} Products: ${c.solutions.join(', ')}.`)
  const details = solutionDetails.map((d) => `${d.name} — ${d.whatItIs} Who needs it: ${d.whoNeedsIt} Protects: ${d.whatItProtects.join(', ')}. Consider: ${d.keyConsiderations.join('; ')}. Information needed: ${d.informationNeeded.join(', ')}.`)
  return [...cats, ...details].join('\n')
}

function systemPrompt(input: ConsultInput): string {
  const org = input.organization
  const orgName = org?.name ?? 'the agency'
  const lines = [
    `You are Super Agent, the AI insurance assistant for ${orgName}${org?.shortName ? ` (${org.shortName})` : ''}, an insurance intermediary in Kenya.`,
    'Answer clearly and briefly in plain English (Swahili if the person writes in Swahili). Amounts in KES. Short paragraphs or bullet points; no markdown headings, no tables.',
    'Ground rules:',
    '- Use only the catalogue, the person\'s own records and what they told you. Distinguish general guidance from anything specific to their policy.',
    '- Never quote a firm premium, promise a claim will be paid, state an approval status you were not given, or invent policy terms, exclusions or legal obligations.',
    '- If you do not know, say: "I don\'t have enough information to answer that accurately" and offer an adviser.',
    '- You are an assistant, not a licensed adviser; a person at the agency confirms anything binding.',
    '- If the question needs a person (complaints, disputes, a live claim decision, a firm price, anything outside insurance), say so briefly and end the reply with the exact token [HANDOFF].',
    input.channel === 'whatsapp'
      ? `- On WhatsApp the person can reply 3 for insurance assistance (quote, question, claim), 5 to upload a document, 6 to check a request or 7 to talk to a ${orgName} adviser. Mention these only when useful.`
      : '- On the website the person can ask for cover, report a claim or upload a document from their portal, or reach an adviser.',
    '',
    `Agency contact: phone ${org?.phone || 'on the website'}, email ${org?.email || 'on the website'}.`,
    '',
    'Product catalogue:',
    catalogueText(),
  ]
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
  const history = (input.history ?? []).slice(-8).filter((m) => m.role === 'user' || m.role === 'assistant')
  const messages = history.map((m) => ({ role: m.role === 'user' ? ('user' as const) : ('assistant' as const), content: m.body.slice(0, 1200) }))
  messages.push({ role: 'user', content: input.question.slice(0, 2000) })
  const text = await chat({ system: systemPrompt(input), messages, maxTokens: 600, temperature: 0.3 })
  if (!text) return null
  const escalate = /\[HANDOFF\]/.test(text)
  const answer = text.replace(/\s*\[HANDOFF\]\s*/g, '').trim()
  return { answer: answer || "I don't have enough information to answer that accurately. Reply 7 to talk to an adviser.", source: process.env.ANTHROPIC_API_KEY ? 'claude' : 'nvidia', escalate }
}

function catalogueAnswer(input: ConsultInput): ConsultResult {
  const q = input.question.toLowerCase()
  const words = q.split(/[^a-z]+/).filter((w) => w.length > 3)
  const scored = solutionDetails
    .map((d) => {
      const hay = `${d.name} ${d.whatItIs} ${d.whoNeedsIt} ${d.whatItProtects.join(' ')}`.toLowerCase()
      const score = words.reduce((n, w) => n + (hay.includes(w) ? 1 : 0), 0) + (hay.includes(q) ? 3 : 0)
      return { d, score }
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)

  const org = input.organization?.shortName ?? 'our'
  if (!scored.length) {
    return {
      answer: [`I don't have enough information to answer that accurately.`, '', 'I can help with questions about cover: medical, motor, property, business, liability, life and travel. Try, for example, "What does comprehensive motor cover?"', '', `For anything specific to your situation, reply 7 and a ${org} adviser will pick this up.`].join('\n'),
      source: 'catalogue',
      escalate: false,
    }
  }
  const lines: string[] = []
  for (const { d } of scored) {
    lines.push(`*${d.name}*`, d.whatItIs, `Who needs it: ${d.whoNeedsIt}`, `Covers: ${d.whatItProtects.slice(0, 4).join(', ')}.`, '')
  }
  lines.push(`This is general guidance. Premiums depend on your details, so an adviser confirms the price. Reply 3 for a quote or 7 to talk to a ${org} adviser.`)
  return { answer: lines.join('\n'), source: 'catalogue', escalate: false }
}

export async function consult(input: ConsultInput): Promise<ConsultResult> {
  let result: ConsultResult | null = null
  if (aiConfigured()) {
    try {
      result = await askModel(input)
    } catch (error) {
      console.error('consult model failed', error instanceof Error ? error.message : error)
    }
  }
  if (!result) result = catalogueAnswer(input)
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

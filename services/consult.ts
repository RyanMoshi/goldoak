import Anthropic from '@anthropic-ai/sdk'
import { getSql } from '@/lib/db/client'
import { ensureSchema } from '@/lib/db/migrate'
import { toConsultation } from '@/lib/db/mappers'
import { newId } from '@/lib/ids'
import { solutionCategories, solutionDetails } from '@/lib/solutions'
import type { Client, Consultation, ConversationMessage, Organization, Policy, PublicUser } from '@/types/platform'

/**
 * The consultation assistant. Answers insurance questions in the agency's
 * voice using the product catalogue, the person's own profile and the recent
 * conversation. Uses Claude when ANTHROPIC_API_KEY is set; otherwise answers
 * from the catalogue so the feature never goes dark.
 */

export interface ConsultInput {
  question: string
  organization: Organization | null
  user: PublicUser | null
  client: Client | null
  policies?: Policy[]
  history?: ConversationMessage[]
  phone: string | null
  channel: 'whatsapp' | 'web'
}

export interface ConsultResult {
  answer: string
  source: 'claude' | 'catalogue'
  /** True when the assistant thinks a person should take over. */
  escalate: boolean
}

const MODEL = 'claude-opus-5'

export function aiConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY)
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
    `You are Super Agent, the insurance assistant for ${orgName}${org?.shortName ? ` (${org.shortName})` : ''}, an insurance agency in Kenya.`,
    'Answer clearly and briefly in plain English (Swahili if the person writes in Swahili). Amounts in KES. Use short paragraphs or bullet points; no markdown headings.',
    'You may explain products, what they cover and exclude, how claims and quotes work, and what documents are usually needed. Never quote a firm premium, never promise that a claim will be paid, and never give legal or medical advice; say an adviser will confirm.',
    'If the question needs a person (complaints, disputes, a live claim decision, a firm price, something outside insurance), say so and end your reply with the exact line: [HANDOFF]',
    `When useful, mention that the person can reply 5 to ask for cover, 6 to report a claim, or 9 to talk to a ${orgName} adviser (on WhatsApp), or use their portal on the website.`,
    '',
    `Agency contact: phone ${org?.phone ?? 'on the website'}, email ${org?.email ?? 'on the website'}.`,
    '',
    'Product catalogue:',
    catalogueText(),
  ]
  if (input.user) {
    lines.push('', `Person: ${input.user.name}${input.client ? `, client record "${input.client.name}" (${input.client.type}), journey stage ${input.client.stage}` : ' (registered, no client record yet)'}.`)
    if (input.client?.notes) lines.push(`They said they want to protect: ${input.client.notes}`)
    if (input.policies?.length) lines.push(`Policies on file: ${input.policies.map((p) => `${p.product} with ${p.insurer} (${p.status}, expires ${p.expiryDate.slice(0, 10)})`).join('; ')}.`)
  } else {
    lines.push('', 'Person: not registered yet. Invite them to reply 1 to create an account when relevant.')
  }
  return lines.join('\n')
}

async function askClaude(input: ConsultInput): Promise<ConsultResult> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const history = (input.history ?? []).slice(-10).filter((m) => m.role === 'user' || m.role === 'assistant')
  const messages: Anthropic.MessageParam[] = []
  for (const m of history) {
    const role = m.role === 'user' ? 'user' : 'assistant'
    if (messages.length && messages[messages.length - 1].role === role) continue
    messages.push({ role, content: m.body.slice(0, 1500) })
  }
  if (!messages.length || messages[messages.length - 1].role === 'user') messages.length = 0
  messages.push({ role: 'user', content: input.question.slice(0, 2000) })

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 700,
    thinking: { type: 'adaptive' },
    system: systemPrompt(input),
    messages,
  })
  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
    .trim()
  const escalate = /\[HANDOFF\]/.test(text)
  return { answer: text.replace(/\s*\[HANDOFF\]\s*/g, '').trim() || 'I could not put together an answer. Reply 9 to talk to an adviser.', source: 'claude', escalate }
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
      answer: [`I can help with questions about cover: medical, motor, property, business, liability, life and travel.`, '', `Try asking, for example, "What does comprehensive motor cover?" or "Do I need WIBA for my staff?"`, '', `For anything specific to your situation, reply 9 and a ${org} adviser will pick this up.`].join('\n'),
      source: 'catalogue',
      escalate: false,
    }
  }
  const lines: string[] = []
  for (const { d } of scored) {
    lines.push(`*${d.name}*`, d.whatItIs, `Who needs it: ${d.whoNeedsIt}`, `Covers: ${d.whatItProtects.slice(0, 4).join(', ')}.`)
    lines.push('')
  }
  lines.push(`Premiums depend on your details, so an adviser confirms the price. Reply 5 to ask for cover or 9 to talk to a ${org} adviser.`)
  return { answer: lines.join('\n'), source: 'catalogue', escalate: false }
}

export async function consult(input: ConsultInput): Promise<ConsultResult> {
  let result: ConsultResult
  if (aiConfigured()) {
    try {
      result = await askClaude(input)
    } catch (error) {
      console.error('claude consult failed', error instanceof Error ? error.message : error)
      result = catalogueAnswer(input)
    }
  } else {
    result = catalogueAnswer(input)
  }
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

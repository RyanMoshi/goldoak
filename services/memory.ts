import { chat, parseJson } from '@/lib/ai/provider'
import { getSql } from '@/lib/db/client'
import { enqueue } from '@/services/jobs'
import type { ContactMemory, ConversationMessage, WhatsAppContact } from '@/types/platform'

/**
 * Conversation memory for the assistant, in layers:
 *  - short-term: the last messages (read from conversation_messages when needed)
 *  - workflow state: whatsapp_contacts.workflow/step/data (the engine)
 *  - user profile: users/clients rows (name, email, phone, what they protect)
 *  - contact memory: facts the person told us and a rolling summary (whatsapp_contacts.memory)
 *  - organisation context: the tenant the contact is routed to
 * The summary is refreshed in the background every few inbound messages.
 */

export async function saveMemory(phone: string, memory: ContactMemory): Promise<void> {
  const sql = getSql()
  await sql`UPDATE whatsapp_contacts SET memory = ${sql.json(memory as never)}, updated_at = now() WHERE phone = ${phone}`
}

export async function rememberFact(contact: WhatsAppContact, key: string, value: string): Promise<ContactMemory> {
  const memory: ContactMemory = { ...contact.memory, facts: { ...(contact.memory.facts ?? {}), [key]: value } }
  await saveMemory(contact.phone, memory)
  return memory
}

export async function pauseWorkflow(contact: WhatsAppContact, paused: NonNullable<ContactMemory['paused']>): Promise<void> {
  await saveMemory(contact.phone, { ...contact.memory, paused })
}

export async function clearPaused(contact: WhatsAppContact): Promise<void> {
  if (!contact.memory.paused) return
  await saveMemory(contact.phone, { ...contact.memory, paused: null })
}

/** Counts an inbound message and schedules a summary refresh every 8 messages. */
export async function noteInbound(phone: string, organizationId: string | null): Promise<void> {
  const sql = getSql()
  const rows = await sql`UPDATE whatsapp_contacts SET inbound_count = inbound_count + 1 WHERE phone = ${phone} RETURNING inbound_count, summarised_at`
  const count = Number(rows[0]?.inbound_count ?? 0)
  const last = Number(rows[0]?.summarised_at ?? 0)
  if (count - last >= 8) await enqueue({ type: 'memory-summary', organizationId, payload: { phone }, idempotencyKey: `summary:${phone}:${count}` })
}

/** Background: condense the recent conversation into a short summary the assistant can carry. */
export async function refreshSummary(phone: string): Promise<void> {
  const sql = getSql()
  const contactRows = await sql`SELECT memory, inbound_count FROM whatsapp_contacts WHERE phone = ${phone} LIMIT 1`
  if (!contactRows[0]) return
  const memory = ((contactRows[0].memory as ContactMemory) ?? {}) as ContactMemory
  const messages = await sql`SELECT role, body FROM (SELECT role, body, at FROM conversation_messages WHERE phone = ${phone} ORDER BY at DESC LIMIT 30) m ORDER BY at ASC`
  if (!messages.length) return
  const transcript = messages.map((m) => `${m.role === 'user' ? 'Person' : m.role === 'agent' ? 'Adviser' : 'Assistant'}: ${String(m.body).slice(0, 400)}`).join('\n')
  const answer = await chat({
    system: 'You keep notes for an insurance assistant. Summarise what matters about this person and this conversation in at most 5 short lines: who they are, what they want, what was done, what is still open. Also list stable facts as key/value pairs (name, business, email, vehicle, preferences). Return JSON {"summary": string, "facts": {key: value}}.',
    messages: [{ role: 'user', content: `${memory.summary ? `Previous notes:\n${memory.summary}\n\n` : ''}Recent conversation:\n${transcript}` }],
    json: true,
    maxTokens: 400,
  })
  const parsed = parseJson<{ summary?: string; facts?: Record<string, string> }>(answer)
  if (!parsed) return
  const next: ContactMemory = { ...memory, summary: parsed.summary?.slice(0, 1200) ?? memory.summary, facts: { ...(memory.facts ?? {}), ...(parsed.facts ?? {}) } }
  await sql`UPDATE whatsapp_contacts SET memory = ${sql.json(next as never)}, summarised_at = inbound_count WHERE phone = ${phone}`
}

/* ---------- Intent understanding ---------- */

export type Intent =
  | 'menu'
  | 'signup'
  | 'claim_business'
  | 'assistance'
  | 'enquiry'
  | 'upload'
  | 'check_request'
  | 'agent'
  | 'help'
  | 'status'
  | 'quote'
  | 'claim'
  | 'question'
  | 'update_name'
  | 'update_email'
  | 'recall_profile'
  | 'greeting'
  | 'thanks'
  | 'cancel'
  | 'back'
  | 'restart'
  | 'unknown'

export interface Understanding {
  intent: Intent
  /** For update_* intents: the new value. For question: the question itself. */
  value?: string
  confidence: number
}

const KEYWORDS: [RegExp, Intent][] = [
  [/^(menu|main menu|home|start|0)$/i, 'menu'],
  [/^(cancel|stop|exit|quit|acha|cancel this|never mind)$/i, 'cancel'],
  [/^(back|go back|previous)$/i, 'back'],
  [/^(restart|start again|start over|again)$/i, 'restart'],
  [/^(help|\?|i need help|what can you do)$/i, 'help'],
  [/^(agent|adviser|advisor|human|person|talk to (a |an |some)?(one|person|agent|adviser|human)|i want to talk to (an? )?(agent|person|someone))$/i, 'agent'],
  [/\b(sign ?up|register|registration|create (an |my )?account|get started|open an account)\b/i, 'signup'],
  [/\b(claim (a |my |the )?business|claim business|find (a |my )?business|my business is|link my business)\b/i, 'claim_business'],
  [/\b(upload|send (you )?(a |my |the )?(document|photo|picture|file|id|logbook)|attach)\b/i, 'upload'],
  [/\b(check (a |my |the )?(request|status|progress|claim status|enquiry)|track|where is my|any update)\b/i, 'check_request'],
  [/\b(enquir|inquir|complain|feedback|i have a question for|message for the agency)\b/i, 'enquiry'],
  [/\b(report (a |my )?claim|accident|stolen|theft|fire at|damage|make a claim)\b/i, 'claim'],
  [/\b(quote|quotation|price|how much|cover for|insure my|i need (cover|insurance))\b/i, 'quote'],
  [/\b(status|where things stand|my policies|my policy|my insurance)\b/i, 'status'],
  [/^(my name is|call me|i am|i'm)\s+([a-z][a-z' -]{1,60})$/i, 'update_name'],
  [/^(change|update|correct) my name to\s+([a-z][a-z' -]{1,60})$/i, 'update_name'],
  [/^(my email is|change my email to|update my email to)\s+(\S+@\S+)$/i, 'update_email'],
  [/\b(what name do you have|what('s| is) my name|who am i|what do you know about me|what number do you have)\b/i, 'recall_profile'],
  [/^(hi|hello|hey|habari|jambo|mambo|good (morning|afternoon|evening)|sasa|niaje)\b/i, 'greeting'],
  [/^(thanks?|thank you|asante( sana)?|ok(ay)?|sawa|great|cool)[.!]*$/i, 'thanks'],
]

function keywordIntent(text: string): Understanding | null {
  const t = text.trim()
  for (const [re, intent] of KEYWORDS) {
    const m = t.match(re)
    if (!m) continue
    if (intent === 'update_name' || intent === 'update_email') return { intent, value: (m[2] ?? '').trim(), confidence: 0.9 }
    return { intent, confidence: 0.85 }
  }
  if (/\?$/.test(t) || /^(what|how|why|which|when|where|is|are|do|does|can|could|should|explain|tell me)\b/i.test(t)) return { intent: 'question', value: t, confidence: 0.7 }
  return null
}

/** Understands a free-text message: rules first, then the model for anything ambiguous. */
export async function understand(text: string, context: { registered: boolean; inFlow: string | null }): Promise<Understanding> {
  const byRule = keywordIntent(text)
  if (byRule && byRule.confidence >= 0.85) return byRule
  const answer = await chat({
    system: `Classify a WhatsApp message to an insurance assistant. The person is ${context.registered ? 'registered' : 'not registered'}${context.inFlow ? ` and currently in the "${context.inFlow}" form` : ''}.
Intents: menu, signup, claim_business (link/claim an existing business), assistance (wants help choosing or understanding insurance), enquiry (a message for the agency), upload (wants to send a document), check_request (status of a request/claim/quote), agent (wants a human), help, status (their own policies/progress), quote (wants cover/price), claim (report an incident), question (a general insurance question), update_name, update_email, recall_profile (asks what we know about them), greeting, thanks, cancel, back, restart, unknown.
Return JSON {"intent": string, "value": string|null, "confidence": 0..1}. "value" is the new name/email for update_*, otherwise null.`,
    messages: [{ role: 'user', content: text.slice(0, 500) }],
    json: true,
    maxTokens: 120,
    timeoutMs: 15_000,
  })
  const parsed = parseJson<{ intent?: string; value?: string | null; confidence?: number }>(answer)
  const allowed: Intent[] = ['menu', 'signup', 'claim_business', 'assistance', 'enquiry', 'upload', 'check_request', 'agent', 'help', 'status', 'quote', 'claim', 'question', 'update_name', 'update_email', 'recall_profile', 'greeting', 'thanks', 'cancel', 'back', 'restart', 'unknown']
  if (parsed?.intent && allowed.includes(parsed.intent as Intent)) {
    return { intent: parsed.intent as Intent, value: parsed.value ?? (parsed.intent === 'question' ? text : undefined), confidence: Math.min(1, Math.max(0, Number(parsed.confidence ?? 0.6))) }
  }
  return byRule ?? { intent: 'unknown', confidence: 0.3 }
}

/** The memory block the assistant sees. Compact by design: facts + summary, never the whole log. */
export function memoryContext(contact: WhatsAppContact, recent: ConversationMessage[]): string {
  const lines: string[] = []
  const facts = Object.entries(contact.memory.facts ?? {}).filter(([, v]) => v)
  if (facts.length) lines.push(`Known facts: ${facts.map(([k, v]) => `${k}=${v}`).join('; ')}`)
  if (contact.memory.summary) lines.push(`Notes so far: ${contact.memory.summary}`)
  if (recent.length) lines.push(`Last messages:\n${recent.slice(-6).map((m) => `${m.role === 'user' ? 'Person' : 'Assistant'}: ${m.body.slice(0, 200)}`).join('\n')}`)
  return lines.join('\n')
}

import { cancelled, confirmation, options, stepPrompt, validationError } from '@/lib/conversation/messages'
import type { Client, Organization, PublicUser } from '@/types/platform'

/**
 * A small, reusable step-based workflow engine for chat channels.
 *
 * A flow is a list of steps. Each step asks one question, validates the answer
 * and stores it under the step id. Steps can be skipped on the basis of earlier
 * answers. When all steps are done the engine shows a summary and asks for
 * confirmation; the person can change any answer before it is saved.
 *
 * The engine is stateless: the caller keeps `{ step, data }` (in the database)
 * and passes it back with the next message. Global commands (BACK, CANCEL,
 * RESTART, HELP, MENU) are handled by the caller, which calls `back`/`restart`.
 */

export interface FlowContext {
  phone: string
  organization: Organization | null
  user: PublicUser | null
  client: Client | null
}

export type ParseResult = { ok: true; value: unknown; display?: string } | { ok: false; error: string }

export interface FlowStep {
  id: string
  /** Shown in the summary and the "change something" list. */
  label: string
  question: string | ((ctx: FlowContext, data: FlowData) => string | Promise<string>)
  hint?: string
  /** Numbered choices; the parser receives the raw text, so accept numbers too. */
  choices?: string[] | ((ctx: FlowContext, data: FlowData) => string[] | Promise<string[]>)
  optional?: boolean
  /** Skip this step (and its answer) when it does not apply. */
  skip?: (data: FlowData) => boolean
  parse: (input: string, ctx: FlowContext, data: FlowData) => ParseResult | Promise<ParseResult>
}

export type FlowData = Record<string, unknown>

export interface Flow {
  id: string
  title: string
  /** Sent before the first question. */
  intro?: (ctx: FlowContext) => string
  steps: FlowStep[]
  /** Skip the confirmation summary (single-step flows). */
  noConfirm?: boolean
  onComplete: (ctx: FlowContext, data: FlowData) => Promise<string>
}

export interface FlowState {
  step: number
  data: FlowData
}

export interface FlowOutcome {
  reply: string
  /** null when the flow has finished or was cancelled. */
  state: FlowState | null
  done?: boolean
}

const CONFIRM_STEP = -1
const EDIT_PICK_STEP = -2
const DISPLAY_KEY = '__display'
const EDITING_KEY = '__editing'

function displays(data: FlowData): Record<string, string> {
  return (data[DISPLAY_KEY] as Record<string, string>) ?? {}
}

function activeSteps(flow: Flow, data: FlowData): FlowStep[] {
  return flow.steps.filter((s) => !s.skip?.(data))
}

async function ask(flow: Flow, ctx: FlowContext, data: FlowData, stepIndex: number, prefix?: string): Promise<string> {
  const step = flow.steps[stepIndex]
  const active = activeSteps(flow, data)
  const n = active.indexOf(step) + 1
  const question = typeof step.question === 'function' ? await step.question(ctx, data) : step.question
  const choices = typeof step.choices === 'function' ? await step.choices(ctx, data) : step.choices
  const body = stepPrompt({ n: Math.max(1, n), total: Math.max(active.length, n), question, hint: step.hint, choices, optional: step.optional, title: n === 1 ? flow.title : undefined })
  return prefix ? `${prefix}\n\n${body}` : body
}

function nextIndex(flow: Flow, data: FlowData, from: number): number {
  let i = from + 1
  while (i < flow.steps.length && flow.steps[i].skip?.(data)) i++
  return i
}

function prevIndex(flow: Flow, data: FlowData, from: number): number {
  let i = from - 1
  while (i >= 0 && flow.steps[i].skip?.(data)) i--
  return i
}

function summary(flow: Flow, data: FlowData): string {
  const d = displays(data)
  const rows = activeSteps(flow, data).map((s) => ({ label: s.label, value: d[s.id] ?? (data[s.id] == null || data[s.id] === '' ? '—' : String(data[s.id])) }))
  return confirmation({ title: `${flow.title}: please check`, rows })
}

export async function startFlow(flow: Flow, ctx: FlowContext): Promise<FlowOutcome> {
  const data: FlowData = {}
  const first = nextIndex(flow, data, -1)
  const intro = flow.intro?.(ctx)
  return { reply: await ask(flow, ctx, data, first, intro), state: { step: first, data } }
}

export async function restartFlow(flow: Flow, ctx: FlowContext): Promise<FlowOutcome> {
  const out = await startFlow(flow, ctx)
  return { ...out, reply: `Starting again.\n\n${out.reply}` }
}

export function cancelFlow(): FlowOutcome {
  return { reply: cancelled(), state: null }
}

export async function backFlow(flow: Flow, ctx: FlowContext, state: FlowState): Promise<FlowOutcome> {
  const data = { ...state.data }
  if (state.step === CONFIRM_STEP || state.step === EDIT_PICK_STEP) {
    const last = prevIndex(flow, data, flow.steps.length)
    delete data[EDITING_KEY]
    return { reply: await ask(flow, ctx, data, last), state: { step: last, data } }
  }
  const prev = prevIndex(flow, data, state.step)
  if (prev < 0) return { reply: await ask(flow, ctx, data, state.step, 'You are at the first step.'), state }
  return { reply: await ask(flow, ctx, data, prev), state: { step: prev, data } }
}

export function helpFor(flow: Flow, state: FlowState): string {
  const active = activeSteps(flow, state.data)
  const where = state.step === CONFIRM_STEP ? 'You are checking your answers before we save them.' : state.step === EDIT_PICK_STEP ? 'Pick the number of the answer you want to change.' : `You are on step ${Math.max(1, active.indexOf(flow.steps[state.step]) + 1)} of ${active.length} in ${flow.title}.`
  return [where, '', 'Commands that work at any time:', '• BACK: previous question', '• SKIP: leave an optional answer blank', '• RESTART: start this over', '• CANCEL: stop without saving', '• MENU: main menu', '• ADVISER: talk to a person'].join('\n')
}

/** Feed the next message into a running flow. */
export async function advanceFlow(flow: Flow, ctx: FlowContext, state: FlowState, input: string): Promise<FlowOutcome> {
  const text = input.trim()
  const data: FlowData = { ...state.data }

  if (state.step === CONFIRM_STEP) {
    if (/^(1|yes|y|confirm|ok|okay|ndio|sawa)$/i.test(text)) {
      delete data[DISPLAY_KEY]
      delete data[EDITING_KEY]
      const reply = await flow.onComplete(ctx, data)
      return { reply, state: null, done: true }
    }
    if (/^(2|change|edit|no|n)$/i.test(text)) {
      const list = activeSteps(flow, data).map((s) => s.label)
      return { reply: `Which one would you like to change?\n\n${options(list)}\n\n_Reply with a number, or BACK._`, state: { step: EDIT_PICK_STEP, data } }
    }
    if (/^(3|cancel|stop)$/i.test(text)) return cancelFlow()
    return { reply: validationError('Please reply 1, 2 or 3.', summary(flow, data)), state }
  }

  if (state.step === EDIT_PICK_STEP) {
    const active = activeSteps(flow, data)
    const pick = active[Number(text) - 1]
    if (!pick) return { reply: validationError('Reply with the number of the answer to change.', options(active.map((s) => s.label))), state }
    const index = flow.steps.indexOf(pick)
    data[EDITING_KEY] = true
    return { reply: await ask(flow, ctx, data, index), state: { step: index, data } }
  }

  const step = flow.steps[state.step]
  if (!step) return cancelFlow()

  let parsed: ParseResult
  if (step.optional && /^(skip|-|none|no|hapana)$/i.test(text)) parsed = { ok: true, value: null, display: '—' }
  else parsed = await step.parse(text, ctx, data)

  if (!parsed.ok) {
    return { reply: validationError(parsed.error, await ask(flow, ctx, data, state.step)), state }
  }

  data[step.id] = parsed.value
  data[DISPLAY_KEY] = { ...displays(data), [step.id]: parsed.display ?? (parsed.value == null ? '—' : String(parsed.value)) }

  const editing = data[EDITING_KEY] === true
  const next = nextIndex(flow, data, state.step)
  const finished = next >= flow.steps.length

  if (editing && !finished) {
    // Changing one answer: return to the summary unless the change revealed a new step that has no answer yet.
    const nextStep = flow.steps[next]
    if (data[nextStep.id] !== undefined) {
      delete data[EDITING_KEY]
      return { reply: summary(flow, data), state: { step: CONFIRM_STEP, data } }
    }
  }

  if (!finished) return { reply: await ask(flow, ctx, data, next), state: { step: next, data } }

  delete data[EDITING_KEY]
  if (flow.noConfirm) {
    delete data[DISPLAY_KEY]
    const reply = await flow.onComplete(ctx, data)
    return { reply, state: null, done: true }
  }
  return { reply: summary(flow, data), state: { step: CONFIRM_STEP, data } }
}

/* ---------- Parser helpers shared by flows ---------- */

export function choice(items: readonly string[], input: string, aliases?: Record<string, RegExp>): string | null {
  const n = Number(input.trim())
  if (Number.isInteger(n) && n >= 1 && n <= items.length) return items[n - 1]
  const lower = input.trim().toLowerCase()
  const exact = items.find((i) => i.toLowerCase() === lower)
  if (exact) return exact
  if (aliases) for (const [item, re] of Object.entries(aliases)) if (re.test(lower) && items.includes(item)) return item
  const partial = items.find((i) => i.toLowerCase().startsWith(lower) && lower.length >= 3)
  return partial ?? null
}

export function parseEmail(input: string): ParseResult {
  const email = input.trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: 'That does not look like an email address (for example name@example.com).' }
  return { ok: true, value: email }
}

export function parseName(input: string): ParseResult {
  const name = input.trim().replace(/\s+/g, ' ')
  if (name.length < 2 || name.length > 80 || /\d{4,}/.test(name)) return { ok: false, error: 'Please send your full name, for example "Amina Hassan".' }
  return { ok: true, value: name }
}

export function parseText(min: number, max: number, problem: string) {
  return (input: string): ParseResult => {
    const text = input.trim()
    if (text.length < min) return { ok: false, error: problem }
    return { ok: true, value: text.slice(0, max) }
  }
}

/** Accepts "today", "yesterday", "12/08/2026", "12 Aug 2026", "2026-08-12". */
export function parseDate(input: string): ParseResult {
  const t = input.trim().toLowerCase()
  const today = new Date()
  const day = (d: Date) => d.toISOString().slice(0, 10)
  if (/^(today|leo)$/.test(t)) return { ok: true, value: day(today), display: 'Today' }
  if (/^(yesterday|jana)$/.test(t)) {
    const y = new Date(today.getTime() - 86_400_000)
    return { ok: true, value: day(y), display: 'Yesterday' }
  }
  const dmy = t.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})$/)
  let date: Date | null = null
  if (dmy) {
    const year = dmy[3].length === 2 ? 2000 + Number(dmy[3]) : Number(dmy[3])
    date = new Date(Date.UTC(year, Number(dmy[2]) - 1, Number(dmy[1])))
  } else {
    const parsed = new Date(input.trim())
    if (!Number.isNaN(parsed.getTime())) date = parsed
  }
  if (!date || Number.isNaN(date.getTime())) return { ok: false, error: 'Send the date as 12/08/2026, or reply TODAY or YESTERDAY.' }
  if (date.getTime() > today.getTime() + 86_400_000) return { ok: false, error: 'That date is in the future. When did it happen?' }
  return { ok: true, value: day(date), display: day(date) }
}

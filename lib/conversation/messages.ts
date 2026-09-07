/**
 * Message templates for WhatsApp. One voice everywhere: short, warm, specific.
 * Every important message answers: what is happening, what do I do, what
 * happens next. WhatsApp renders *bold* and _italic_; keep lines short.
 * OpenWA on whatsapp-web.js has no interactive buttons, so menus are numbered.
 */

export const DIGITS = ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'] as const

export function bold(text: string): string {
  return `*${text}*`
}

export function italic(text: string): string {
  return `_${text}_`
}

export function digit(n: number): string {
  return n >= 0 && n < DIGITS.length ? DIGITS[n] : `${n}.`
}

/** A numbered option list: "1️⃣ Create my account". */
export function options(items: string[], startAt = 1): string {
  return items.map((item, i) => `${digit(i + startAt)} ${item}`).join('\n')
}

/** A workflow question with a progress indicator and the standard controls. */
export function stepPrompt(input: { n: number; total: number; question: string; hint?: string; choices?: string[]; optional?: boolean; title?: string }): string {
  const lines: string[] = []
  if (input.title) lines.push(bold(input.title))
  lines.push(bold(`Step ${input.n} of ${input.total}`))
  lines.push(input.question)
  if (input.choices?.length) lines.push('', options(input.choices))
  if (input.hint) lines.push('', italic(input.hint))
  lines.push('', controls(input.n > 1, input.optional))
  return lines.join('\n')
}

export function controls(canGoBack: boolean, optional?: boolean): string {
  const parts: string[] = []
  if (optional) parts.push('SKIP')
  if (canGoBack) parts.push('BACK')
  parts.push('CANCEL', 'HELP')
  return italic(`Reply ${parts.join(' · ')}`)
}

export function validationError(problem: string, retry: string): string {
  return `⚠️ ${problem}\n\n${retry}`
}

export function confirmation(input: { title: string; rows: { label: string; value: string }[]; question?: string; actions?: [string, string, string] }): string {
  const [a, b, c] = input.actions ?? ['Confirm', 'Edit', 'Cancel']
  return [bold(input.title), '', ...input.rows.map((r) => `${bold(r.label)}: ${r.value}`), '', input.question ?? 'Is everything correct?', '', options([a, b, c])].join('\n')
}

export function success(title: string, body: string[]): string {
  return [`✅ ${bold(title)}`, '', ...body].join('\n')
}

export function menuBlock(title: string, items: string[], footer?: string): string {
  const lines = [bold(title), '', options(items)]
  if (footer) lines.push('', italic(footer))
  return lines.join('\n')
}

export function cancelled(): string {
  return 'Cancelled. Nothing was saved.\n\nReply MENU to see what I can do.'
}

export function bullet(items: string[]): string {
  return items.map((i) => `• ${i}`).join('\n')
}

export function formatIntl(digits: string): string {
  return `+${digits.replace(/\D/g, '')}`
}

/** wa.me link that opens a chat with the assistant and pre-fills a message. */
export function waLink(botNumber: string, text: string): string {
  return `https://wa.me/${botNumber.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`
}

/* ---------- Standard messages ---------- */

export const GUEST_MENU = ['Get started / Sign up', 'Find or claim a business', 'Get insurance assistance', 'Make an enquiry', 'Upload a document', 'Check a request', 'Talk to an agent', 'Help']
export const CLIENT_MENU = ['My insurance (where things stand)', 'Find or claim a business', 'Get insurance assistance', 'Make an enquiry', 'Upload a document', 'Check a request', 'Talk to an agent', 'Help', 'Report a claim']

export function welcome(orgName: string, greeting: string | null, siteUrl: string, registered: boolean, firstName?: string): string {
  const head = greeting?.trim() ? greeting.trim() : `${bold(`Welcome to ${orgName} 👋`)}\n\nI'm your AI insurance assistant.`
  const lines = [head, '', registered ? `Hi ${firstName ?? 'there'}, here is what I can do:` : 'I can help you with:', '', options(registered ? CLIENT_MENU : GUEST_MENU), '', italic('Reply with a number, or just tell me what you need.')]
  if (!registered) lines.push('', italic(`By chatting you agree to our privacy notice: ${siteUrl}/privacy. Reply STOP any time to end.`))
  return lines.join('\n')
}

export function mainMenu(orgName: string, registered: boolean, firstName?: string): string {
  return menuBlock(registered ? `${orgName} · Hi ${firstName ?? 'there'}` : `${orgName} · Main menu`, registered ? CLIENT_MENU : GUEST_MENU, 'Reply with a number, or tell me what you need.')
}

export function helpText(orgName: string, registered: boolean, siteUrl: string): string {
  return [
    bold('How this works'),
    `I am the ${orgName} assistant on WhatsApp. ${registered ? 'Reply MENU for your options.' : 'Reply 1 to create an account, or 3 to ask a question.'}`,
    '',
    bullet(['MENU: main menu', 'BACK / CANCEL / RESTART: control any form', 'SKIP: leave an optional answer blank', 'AGENT: talk to a person', 'HELP: this message']),
    '',
    'You can also just type what you need, for example "I want to register", "claim my business" or "what documents do I need for a motor claim?".',
    '',
    `Website: ${siteUrl}`,
  ].join('\n')
}

export function handoffReply(orgName: string, adviserName: string | null, orgPhone: string): string {
  const who = adviserName ? `${adviserName} from ${orgName}` : `A ${orgName} adviser`
  return [bold('Connecting you to a person'), `${who} will reply to you here. I will stay quiet until they hand the chat back to me.`, '', orgPhone ? `Urgent? Call ${orgPhone}.` : '', italic('Reply MENU to use the assistant while you wait.')].filter(Boolean).join('\n')
}

export function processingUpload(filename: string): string {
  return [bold('Document received'), `Got it: ${filename}.`, '', 'I am reading it now. In a moment I will send you what I found so you can confirm it.', '', italic('You can keep chatting meanwhile.')].join('\n')
}

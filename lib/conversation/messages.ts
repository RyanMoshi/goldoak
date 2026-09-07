/**
 * Message templates for WhatsApp. One voice everywhere: short, warm, specific.
 * WhatsApp renders *bold* and _italic_; keep lines short for phones.
 */

export const DIGITS = ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'] as const

export function bold(text: string): string {
  return `*${text}*`
}

export function italic(text: string): string {
  return `_${text}_`
}

/** A numbered option list: "1️⃣ Create my account". */
export function options(items: string[], startAt = 1): string {
  return items.map((item, i) => `${digit(i + startAt)} ${item}`).join('\n')
}

export function digit(n: number): string {
  return n >= 0 && n < DIGITS.length ? DIGITS[n] : `${n}.`
}

/** A workflow question with a progress indicator and the standard controls. */
export function stepPrompt(input: { n: number; total: number; question: string; hint?: string; choices?: string[]; optional?: boolean; title?: string }): string {
  const lines: string[] = []
  if (input.title) lines.push(bold(input.title))
  lines.push(`${italic(`Step ${input.n} of ${input.total}`)}`)
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

export function confirmation(input: { title: string; rows: { label: string; value: string }[]; question?: string }): string {
  const lines = [bold(input.title), '', ...input.rows.map((r) => `• ${r.label}: ${r.value}`), '', input.question ?? 'Is everything correct?', '', options(['Yes, confirm', 'Change something', 'Cancel'])]
  return lines.join('\n')
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

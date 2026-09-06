export interface CommandSuggestion {
  id: string
  text: string
  hint: string
}

export const commandSuggestions: CommandSuggestion[] = [
  { id: 'sug_quotes', text: 'Prepare motor quotes for John Kamau', hint: 'Quote request' },
  { id: 'sug_renewing', text: 'Show clients renewing this month', hint: 'Renewals' },
  { id: 'sug_outstanding', text: 'Which quotes are still outstanding?', hint: 'Quotes' },
  { id: 'sug_claims', text: 'Show claims needing attention', hint: 'Claims' },
  { id: 'sug_bi', text: 'Find SME clients without business interruption cover', hint: 'Coverage gap' },
]

export type CommandIntent = 'prepare-quotes' | 'renewals-this-month' | 'outstanding-quotes' | 'claims-attention' | 'coverage-gap' | 'unknown'

export interface CommandResult {
  intent: CommandIntent
  title: string
  lines: { text: string; detail?: string }[]
  actions: { label: string; href: string }[]
  source: string
}

export interface CommandHandler {
  handle(command: string): Promise<CommandResult>
}

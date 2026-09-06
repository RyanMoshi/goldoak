import type { CommandResult } from '@/types/platform'

export interface CommandSuggestion {
  id: string
  text: string
  hint: string
}

/** Example commands. Every one is answered from the organisation's own records. */
export const commandSuggestions: CommandSuggestion[] = [
  { id: 'sug_today', text: 'What needs attention today?', hint: 'Queue' },
  { id: 'sug_renewing', text: 'Show clients renewing this month', hint: 'Renewals' },
  { id: 'sug_outstanding', text: 'Which quotes are still outstanding?', hint: 'Quotes' },
  { id: 'sug_claims', text: 'Show claims needing attention', hint: 'Claims' },
  { id: 'sug_gap', text: 'Clients without WIBA cover', hint: 'Coverage gap' },
]

export interface CommandHandler {
  handle(command: string): Promise<CommandResult>
}

export type { CommandResult }

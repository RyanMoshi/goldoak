/**
 * Contract between the command bar UI and whatever answers it. In Step 1 the
 * handler is a local mock; later it is an AI service behind an API route.
 */

export interface CommandSuggestion {
  id: string;
  text: string;
  /** Short hint shown beside the suggestion. */
  hint: string;
}

export type CommandIntent =
  | "prepare-quotes"
  | "renewals-this-month"
  | "outstanding-quotes"
  | "claims-attention"
  | "coverage-gap"
  | "unknown";

export interface CommandResultLine {
  /** Primary text of the line. */
  text: string;
  /** Optional ledger-style detail (premium, count, reference). */
  detail?: string;
}

export interface CommandResultAction {
  label: string;
  href: string;
}

export interface CommandResult {
  intent: CommandIntent;
  title: string;
  lines: CommandResultLine[];
  actions: CommandResultAction[];
  /** Plain statement of where the answer came from. Never implies a live AI call in Step 1. */
  source: string;
}

export interface CommandHandler {
  handle(command: string): Promise<CommandResult>;
}

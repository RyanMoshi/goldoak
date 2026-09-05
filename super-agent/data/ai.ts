import type { CommandSuggestion } from "@/types/ai";

export const commandSuggestions: CommandSuggestion[] = [
  {
    id: "sug_quotes_kamau",
    text: "Prepare motor quotes for John Kamau",
    hint: "Quote request",
  },
  {
    id: "sug_renewing",
    text: "Show clients renewing this month",
    hint: "Renewals",
  },
  {
    id: "sug_outstanding",
    text: "Which quotes are still outstanding?",
    hint: "Quotes",
  },
  {
    id: "sug_claims",
    text: "Show claims needing attention",
    hint: "Claims",
  },
  {
    id: "sug_bi_gap",
    text: "Find SME clients without business interruption cover",
    hint: "Coverage gap",
  },
];

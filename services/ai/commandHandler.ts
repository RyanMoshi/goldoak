import type { CommandHandler, CommandIntent, CommandResult } from '@/data/platform/ai'

/**
 * Local, deterministic command handling. Answers in the same shape a real
 * assistant will; swap `createCommandHandler` for an API-backed one later.
 */

const rules: { intent: CommandIntent; test: RegExp }[] = [
  { intent: 'prepare-quotes', test: /\b(prepare|get|request|run)\b.*\bquotes?\b/i },
  { intent: 'renewals-this-month', test: /\brenew(al|ing|s)?\b/i },
  { intent: 'outstanding-quotes', test: /\b(outstanding|pending|awaiting|waiting)\b.*\bquotes?\b|\bquotes?\b.*\b(outstanding|pending|awaiting|waiting)\b/i },
  { intent: 'claims-attention', test: /\bclaims?\b/i },
  { intent: 'coverage-gap', test: /\bwithout\b|\bgap\b|\bno\s+cover\b|\bmissing\s+cover\b/i },
]

const SOURCE = 'Answered from workspace data on this device. Not a live AI call.'

function extractName(command: string): string | undefined {
  return command.match(/\bfor\s+([A-Z][\w'&.-]*(?:\s+[A-Z][\w'&.-]*){0,3})/)?.[1]?.trim()
}

function respond(command: string): CommandResult {
  const intent = rules.find((r) => r.test.test(command))?.intent ?? 'unknown'
  switch (intent) {
    case 'prepare-quotes': {
      const name = extractName(command) ?? 'the client'
      const motor = /\bmotor\b|\bcar\b|\bvehicle\b|\bfleet\b/i.test(command)
      return {
        intent,
        title: `Quote request for ${name}`,
        lines: [
          { text: 'Client found', detail: name },
          { text: motor ? 'Vehicle details on file' : 'Risk profile on file', detail: motor ? '1 vehicle · logbook uploaded' : 'Approved' },
          { text: 'Missing before we can request', detail: motor ? 'Current sum insured' : 'None' },
          { text: 'Insurers with appetite', detail: 'APA · CIC · Jubilee' },
        ],
        actions: [
          { label: 'Open quotes', href: '/agency/quotes' },
          { label: 'View clients', href: '/agency/clients' },
        ],
        source: SOURCE,
      }
    }
    case 'renewals-this-month':
      return {
        intent,
        title: 'Renewing within 30 days',
        lines: [
          { text: 'Apex Pharmacy · Group Medical', detail: '18 days · KES 1,240,000' },
          { text: 'Mwangi Hardware · WIBA', detail: '25 days · KES 36,000' },
        ],
        actions: [{ label: 'Open renewal diary', href: '/agency/renewals' }],
        source: SOURCE,
      }
    case 'outstanding-quotes':
      return {
        intent,
        title: 'Quotes awaiting insurer response',
        lines: [
          { text: 'Britam · Mwangi Hardware · Fire', detail: '4 days · at risk' },
          { text: 'Britam · Wanjiru Motors · Fleet', detail: '3 days' },
          { text: 'CIC · Nairobi Heights · Liability', detail: '2 days · clarification' },
          { text: 'Britam · Kamau & Sons · WIBA', detail: '1 day' },
        ],
        actions: [{ label: 'Open quotes', href: '/agency/quotes' }],
        source: SOURCE,
      }
    case 'claims-attention':
      return {
        intent,
        title: 'Claims needing action',
        lines: [
          { text: 'Mwangi Hardware · Fire', detail: 'CLM-2026-00124 · client update due today' },
          { text: 'Karanja Logistics · Goods in transit', detail: 'CLM-2026-00131 · documenting' },
        ],
        actions: [{ label: 'Open claims', href: '/agency/claims' }],
        source: SOURCE,
      }
    case 'coverage-gap':
      return {
        intent,
        title: 'SME clients without business interruption cover',
        lines: [
          { text: 'Mwangi Hardware', detail: 'Fire in force · no BI' },
          { text: 'Apex Pharmacy', detail: 'Medical and PI in force · no BI' },
          { text: 'Kamau & Sons', detail: 'No property cover yet' },
        ],
        actions: [{ label: 'Open clients', href: '/agency/clients' }],
        source: SOURCE,
      }
    default:
      return {
        intent,
        title: 'I can help with quotes, renewals, claims and coverage gaps',
        lines: [{ text: 'Try “Prepare motor quotes for John Kamau”' }, { text: 'Or “Show clients renewing this month”' }],
        actions: [],
        source: SOURCE,
      }
  }
}

export function createCommandHandler(): CommandHandler {
  return {
    async handle(command: string) {
      await new Promise((resolve) => setTimeout(resolve, 420))
      return respond(command.trim())
    },
  }
}

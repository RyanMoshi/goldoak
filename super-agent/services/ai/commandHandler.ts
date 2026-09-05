import type { CommandHandler, CommandIntent, CommandResult } from "@/types/ai";

/**
 * Local, deterministic command handling for Step 1. Matches a handful of
 * intents against mock workspace data and answers in the same shape a real
 * assistant will. Swap `createCommandHandler` for a service that calls an
 * API route; the command bar does not change.
 */

interface IntentRule {
  intent: CommandIntent;
  test: RegExp;
}

const rules: IntentRule[] = [
  { intent: "prepare-quotes", test: /\b(prepare|get|request|run)\b.*\bquotes?\b/i },
  { intent: "renewals-this-month", test: /\brenew(al|ing|s)?\b/i },
  { intent: "outstanding-quotes", test: /\b(outstanding|pending|awaiting|waiting)\b.*\bquotes?\b|\bquotes?\b.*\b(outstanding|pending|awaiting|waiting)\b/i },
  { intent: "claims-attention", test: /\bclaims?\b/i },
  { intent: "coverage-gap", test: /\bwithout\b|\bgap\b|\bno\s+cover\b|\bmissing\s+cover\b/i },
];

function detectIntent(command: string): CommandIntent {
  return rules.find((rule) => rule.test.test(command))?.intent ?? "unknown";
}

function extractName(command: string): string | undefined {
  const match = command.match(/\bfor\s+([A-Z][\w'&.-]*(?:\s+[A-Z][\w'&.-]*){0,3})/);
  return match?.[1]?.trim();
}

const MOCK_SOURCE = "Answered from workspace data on this device. Not a live AI call.";

function respond(command: string): CommandResult {
  const intent = detectIntent(command);

  switch (intent) {
    case "prepare-quotes": {
      const name = extractName(command) ?? "the client";
      const isMotor = /\bmotor\b|\bcar\b|\bvehicle\b|\bfleet\b/i.test(command);
      return {
        intent,
        title: `Quote request for ${name}`,
        lines: [
          { text: `Client found`, detail: name },
          {
            text: isMotor ? "Vehicle details on file" : "Risk profile on file",
            detail: isMotor ? "1 vehicle · logbook uploaded" : "Approved 12 Aug 2026",
          },
          { text: "Missing before we can request", detail: isMotor ? "Current sum insured" : "None" },
          { text: "Insurers with appetite", detail: "APA · CIC · Jubilee" },
        ],
        actions: [
          { label: "Open quote workspace", href: "/quotes" },
          { label: "View client", href: "/clients" },
        ],
        source: MOCK_SOURCE,
      };
    }
    case "renewals-this-month":
      return {
        intent,
        title: "Renewing within 30 days",
        lines: [
          { text: "Apex Pharmacy · Group Medical", detail: "18 days · KES 1,240,000" },
          { text: "Karanja Logistics · Motor Fleet", detail: "22 days · KES 1,600,000" },
          { text: "Nairobi Heights Apartments · Fire", detail: "27 days · KES 388,000" },
          { text: "6 more policies", detail: "KES 1,662,000" },
        ],
        actions: [{ label: "Open renewal diary", href: "/renewals" }],
        source: MOCK_SOURCE,
      };
    case "outstanding-quotes":
      return {
        intent,
        title: "7 quotes awaiting insurer response",
        lines: [
          { text: "Britam · Mwangi Hardware · Fire", detail: "4 days · at risk" },
          { text: "Britam · Wanjiru Motors · Fleet", detail: "3 days" },
          { text: "Britam · Kamau & Sons · WIBA", detail: "1 day" },
          { text: "CIC · Nairobi Heights · Liability", detail: "2 days · clarification" },
          { text: "3 more", detail: "within SLA" },
        ],
        actions: [
          { label: "Chase all overdue", href: "/quotes" },
          { label: "Open quotes", href: "/quotes" },
        ],
        source: MOCK_SOURCE,
      };
    case "claims-attention":
      return {
        intent,
        title: "2 claims need action",
        lines: [
          { text: "Mwangi Hardware · Fire", detail: "CLM-2026-00124 · client update due today" },
          { text: "Karanja Logistics · Motor", detail: "CLM-2026-00131 · documents uploaded, register with insurer" },
        ],
        actions: [{ label: "Open claims board", href: "/claims" }],
        source: MOCK_SOURCE,
      };
    case "coverage-gap":
      return {
        intent,
        title: "SME clients without business interruption cover",
        lines: [
          { text: "Mwangi Hardware", detail: "Fire in force · no BI" },
          { text: "Apex Pharmacy", detail: "Fire & burglary in force · no BI" },
          { text: "Kamau & Sons", detail: "No property cover yet" },
        ],
        actions: [{ label: "Open clients", href: "/clients" }],
        source: MOCK_SOURCE,
      };
    default:
      return {
        intent,
        title: "I can help with quotes, renewals, claims and coverage gaps",
        lines: [
          { text: "Try “Prepare motor quotes for John Kamau”" },
          { text: "Or “Show clients renewing this month”" },
        ],
        actions: [],
        source: MOCK_SOURCE,
      };
  }
}

export function createCommandHandler(): CommandHandler {
  return {
    async handle(command: string): Promise<CommandResult> {
      // A short pause so the UI's working state is visible and the swap to a
      // network-backed handler later does not change perceived behaviour.
      await new Promise((resolve) => setTimeout(resolve, 420));
      return respond(command.trim());
    },
  };
}

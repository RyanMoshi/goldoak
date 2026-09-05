import type { WorkspaceRoute } from "@/types/navigation";

export interface RoadmapEntry {
  step: string;
  title: string;
  description: string;
  capabilities: string[];
}

/** Which build step delivers each workspace. Used by the coming-next pages. */
export const roadmap: Record<Exclude<WorkspaceRoute, "/today">, RoadmapEntry> = {
  "/quotes": {
    step: "Step 2 · Multi-insurer comparison engine",
    title: "Quotes",
    description:
      "Request quotes from the panel with one standard pack, capture every reply in any format, and compare them on identical terms.",
    capabilities: [
      "Generate a request pack per insurer from the risk profile",
      "Track each submission, days outstanding and chase at the SLA",
      "Extract premium, limits, excess and exclusions from insurer PDFs",
      "Compare side by side: best price, best value, broadest, recommended",
      "Record the reasoning behind the recommendation",
    ],
  },
  "/clients": {
    step: "Step 3 · Client risk discovery",
    title: "Clients",
    description: "One record per client, with the guided fact-find that turns a conversation into a risk profile.",
    capabilities: [
      "Individual and business clients with contacts, assets, vehicles and staff",
      "Guided SME and motor fact-find with progressive disclosure",
      "Versioned risk profile, approved by the adviser",
      "Documents, consents and a full interaction timeline",
      "Covers per client, and the gaps",
    ],
  },
  "/pipeline": {
    step: "Step 5 · Proposal and placement",
    title: "Pipeline",
    description: "Every opportunity from lead to placement, with the service deadline on each card.",
    capabilities: [
      "Lead → Fact-find → Requested → Compared → Proposed → Accepted → Placed → Live",
      "Estimated premium per stage",
      "Stage timers driven by the service charter",
      "Board and table views",
    ],
  },
  "/renewals": {
    step: "Step 7 · Renewals automation",
    title: "Renewals",
    description: "The renewal diary from 90 days out, so no policy lapses because it lived in someone's head.",
    capabilities: [
      "90 / 45 / 30 / 14 / 7 / 0 cadence per policy",
      "“What changed?” review before remarketing",
      "Renewal options presented 30 days before expiry",
      "Retention and premium-change reporting",
    ],
  },
  "/claims": {
    step: "Step 8 · Claims workspace",
    title: "Claims",
    description: "Every open claim, its stage, and the next client update due.",
    capabilities: [
      "Notified → Registered → Documenting → With insurer → Assessed → Offer → Settled",
      "Checklist by product class",
      "Weekly client update, automatic",
      "Escalation when an insurer goes quiet",
      "Outcome recorded against the insurer's record",
    ],
  },
  "/insurers": {
    step: "Step 9 · Insurer integrations",
    title: "Insurers",
    description: "The panel as an asset: appetite, contacts, and the turnaround record your own placements build.",
    capabilities: [
      "Appetite grid by class",
      "Underwriter contacts and documentation requirements",
      "Turnaround, hit-rate and claims conduct from your own submissions",
      "Adapters for email, portal and API channels",
    ],
  },
  "/reports": {
    step: "Later · Business intelligence",
    title: "Reports",
    description: "Premium, commission, conversion and retention by insurer, class, adviser and month.",
    capabilities: [
      "Premium and commission ledger",
      "Lead-to-placement conversion",
      "Renewal retention by segment",
      "Insurer concentration",
    ],
  },
  "/settings": {
    step: "Later · Organisation settings",
    title: "Settings",
    description: "Organisation, users and roles, templates and the disclosure texts that appear on every proposal.",
    capabilities: [
      "Organisation profile and licence details",
      "Users, roles and approvals",
      "Proposal and document templates",
      "Consent and disclosure texts",
      "Service-level targets",
    ],
  },
};

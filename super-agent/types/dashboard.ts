import type { InsurerId, ProductLine } from "@/types/domain";

/* ---------- Priority metrics ---------- */

export type MetricId =
  | "new-leads"
  | "quotes-awaited"
  | "proposals-out"
  | "renewals-30d"
  | "claims-action";

export type MetricIcon = "leads" | "quotes" | "proposals" | "renewals" | "claims";

export interface PriorityMetric {
  id: MetricId;
  label: string;
  value: number;
  /** One line of context under the number, e.g. "3 require follow-up today". */
  context: string;
  /** Whether the context line describes something urgent. */
  contextTone: "neutral" | "warning" | "error";
  icon: MetricIcon;
  /** Optional financial figure shown as a chip, in KES. */
  amount?: number;
  /** Task filter this metric narrows the work queue to when clicked. */
  taskType: TaskType;
}

/* ---------- Work queue ---------- */

export type TaskType =
  | "lead-contact"
  | "quote-follow-up"
  | "ai-review"
  | "documents-missing"
  | "proposal"
  | "renewal"
  | "claim-update";

export type SLAStatus = "on-track" | "at-risk" | "overdue" | "needs-review";

export type TaskActionKind =
  | "follow-up"
  | "review"
  | "request-documents"
  | "call"
  | "send"
  | "update-client";

export interface TaskAction {
  kind: TaskActionKind;
  label: string;
}

export interface SLATask {
  id: string;
  type: TaskType;
  client: string;
  insurer?: InsurerId;
  product: ProductLine;
  /** Short description of what the task is about. */
  summary: string;
  /** Age or timing statement, e.g. "4 days outstanding", "Renews in 18 days". */
  timing: string;
  sla: SLAStatus;
  /** Higher sorts first. */
  priority: number;
  dueToday: boolean;
  /** Premium or claim value relevant to the task, in KES. */
  amount?: number;
  /** Optional identifier shown in ledger type (claim or quote reference). */
  reference?: string;
  action: TaskAction;
}

export type TaskFilter = "all" | "urgent" | "today" | TaskType;

/* ---------- Pipeline ---------- */

export type PipelineStageId =
  | "leads"
  | "risk-profiling"
  | "quoting"
  | "proposal"
  | "won";

export interface PipelineStage {
  id: PipelineStageId;
  label: string;
  count: number;
  /** Estimated premium in the stage, KES. */
  value: number;
}

/* ---------- Activity ---------- */

export type ActivityKind =
  | "quote-received"
  | "risk-profile"
  | "proposal-sent"
  | "documents-uploaded"
  | "renewal"
  | "claim";

export interface ActivityItem {
  id: string;
  kind: ActivityKind;
  title: string;
  client: string;
  /** Pre-formatted relative time, e.g. "8 min ago". */
  when: string;
  /** ISO timestamp for future sorting / live updates. */
  at: string;
}

/* ---------- Insurer activity ---------- */

export type InsurerActivityStatus =
  | "awaiting"
  | "received"
  | "clarification"
  | "ready";

export interface InsurerActivity {
  insurer: InsurerId;
  summary: string;
  status: InsurerActivityStatus;
  count: number;
}

/* ---------- Aggregate ---------- */

export interface DashboardData {
  metrics: PriorityMetric[];
  tasks: SLATask[];
  pipeline: PipelineStage[];
  activity: ActivityItem[];
  insurerActivity: InsurerActivity[];
}

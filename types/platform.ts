/* ---------- Tenancy and identity ---------- */

export type Role = 'agency' | 'client'

export interface Organization {
  id: string
  name: string
  shortName: string
  phone: string
  email: string
  /** E.164 without plus, e.g. 254729911311 */
  whatsapp: string
}

export interface PublicUser {
  id: string
  role: Role
  organizationId: string | null
  name: string
  email: string
  phone: string | null
  title: string | null
}

/* ---------- Client journey ---------- */

export type ClientType = 'individual' | 'sme' | 'corporate'

/** The six GoldOak stages, in order. */
export type JourneyStage = 'understand' | 'solve' | 'compare' | 'implement' | 'support' | 'review'

export const JOURNEY_STAGES: { id: JourneyStage; label: string; description: string }[] = [
  { id: 'understand', label: 'Understand', description: 'We build your risk picture before anything else.' },
  { id: 'solve', label: 'Solve', description: 'We design the programme around your exposures.' },
  { id: 'compare', label: 'Compare', description: 'We approach our panel and compare options on identical terms.' },
  { id: 'implement', label: 'Implement', description: 'Proposal forms, documents, premium, cover confirmed.' },
  { id: 'support', label: 'Support', description: 'Endorsements, certificates, questions and claims.' },
  { id: 'review', label: 'Review', description: 'A review report at least 45 days before renewal.' },
]

export interface Client {
  id: string
  organizationId: string
  userId: string | null
  name: string
  type: ClientType
  phone: string | null
  email: string | null
  stage: JourneyStage
  adviserName: string | null
  createdAt: string
}

export interface ClientListRow extends Client {
  policyCount: number
  openQuoteCount: number
  openClaimCount: number
  nextExpiry: string | null
  annualPremium: number
}

export type PolicyStatus = 'live' | 'renewal-due' | 'lapsed' | 'cancelled'

export interface Policy {
  id: string
  clientId: string
  insurer: string
  product: string
  policyNumber: string
  sumInsured: number | null
  premium: number
  startDate: string
  expiryDate: string
  status: PolicyStatus
  keyExclusions: string | null
}

export type QuoteStage = 'requested' | 'compared' | 'proposed' | 'accepted' | 'placed' | 'declined'
export type SubmissionStatus = 'awaiting' | 'received' | 'clarification' | 'ready' | 'declined'

export interface QuoteSubmission {
  id: string
  insurer: string
  status: SubmissionStatus
  premium: number | null
  sentAt: string
}

export interface QuoteRequest {
  id: string
  clientId: string
  reference: string
  product: string
  stage: QuoteStage
  premiumEstimate: number | null
  createdAt: string
  updatedAt: string
  submissions: QuoteSubmission[]
}

export type ClaimStage =
  | 'notified'
  | 'registered'
  | 'documenting'
  | 'with-insurer'
  | 'assessed'
  | 'offer'
  | 'settled'
  | 'closed'

export const CLAIM_STAGES: { id: ClaimStage; label: string }[] = [
  { id: 'notified', label: 'Notified' },
  { id: 'registered', label: 'Registered' },
  { id: 'documenting', label: 'Documenting' },
  { id: 'with-insurer', label: 'With insurer' },
  { id: 'assessed', label: 'Assessed' },
  { id: 'offer', label: 'Offer' },
  { id: 'settled', label: 'Settled' },
  { id: 'closed', label: 'Closed' },
]

export interface Claim {
  id: string
  clientId: string
  policyId: string | null
  reference: string
  insurer: string
  product: string
  stage: ClaimStage
  amount: number | null
  nextUpdateDue: string | null
  notifiedAt: string
  updatedAt: string
}

/* ---------- Agency work queue and dashboard ---------- */

export type TaskType =
  | 'lead-contact'
  | 'quote-follow-up'
  | 'ai-review'
  | 'documents-missing'
  | 'proposal'
  | 'renewal'
  | 'claim-update'

export type SLAStatus = 'on-track' | 'at-risk' | 'overdue' | 'needs-review'

export type TaskActionKind = 'follow-up' | 'review' | 'request-documents' | 'call' | 'send' | 'update-client'

export interface SLATask {
  id: string
  type: TaskType
  clientId: string | null
  client: string
  insurer: string | null
  product: string
  summary: string
  timing: string
  sla: SLAStatus
  priority: number
  dueToday: boolean
  amount: number | null
  reference: string | null
  action: { kind: TaskActionKind; label: string }
}

export type TaskFilter = 'all' | 'urgent' | 'today' | TaskType

export type MetricId = 'new-leads' | 'quotes-awaited' | 'proposals-out' | 'renewals-30d' | 'claims-action'
export type MetricIcon = 'leads' | 'quotes' | 'proposals' | 'renewals' | 'claims'

export interface PriorityMetric {
  id: MetricId
  label: string
  value: number
  context: string
  contextTone: 'neutral' | 'warning' | 'error'
  icon: MetricIcon
  amount?: number
  taskType: TaskType
}

export type PipelineStageId = 'leads' | 'risk-profiling' | 'quoting' | 'proposal' | 'won'

export interface PipelineStage {
  id: PipelineStageId
  label: string
  count: number
  value: number
}

export type ActivityKind = 'quote-received' | 'risk-profile' | 'proposal-sent' | 'documents-uploaded' | 'renewal' | 'claim' | 'signup'

export interface ActivityItem {
  id: string
  kind: ActivityKind
  title: string
  client: string
  at: string
}

export type InsurerActivityStatus = 'awaiting' | 'received' | 'clarification' | 'ready'

export interface InsurerActivity {
  insurer: string
  summary: string
  status: InsurerActivityStatus
  count: number
}

export interface DashboardData {
  metrics: PriorityMetric[]
  tasks: SLATask[]
  pipeline: PipelineStage[]
  activity: ActivityItem[]
  insurerActivity: InsurerActivity[]
}

/* ---------- Client portal ---------- */

export interface PortalData {
  user: PublicUser
  organization: Organization
  client: Client | null
  policies: Policy[]
  quotes: QuoteRequest[]
  claims: Claim[]
}

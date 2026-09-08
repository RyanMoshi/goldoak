/* ---------- Tenancy and identity ---------- */

/** admin = platform super admin; agency_admin = runs an agency; agency = agency staff; client = end user. */
export type Role = 'admin' | 'agency_admin' | 'agency' | 'client'

export const ROLE_LABELS: Record<Role, string> = { admin: 'Super admin', agency_admin: 'Agency admin', agency: 'Agency staff', client: 'Client' }

export interface Organization {
  id: string
  name: string
  shortName: string
  phone: string
  email: string
  /** E.164 without plus, e.g. 255742473493. The number clients message. */
  whatsapp: string
  /** Short join code clients send on WhatsApp (JOIN GOLDOAK) to be routed to this agency. */
  code: string | null
  active: boolean
  /** First line the assistant sends to a new contact of this agency. */
  greeting: string | null
  licenceLabel: string | null
  /** pending = self-registered, waiting for the platform admin; active = live. */
  status: 'pending' | 'active' | 'suspended'
  type: string | null
  address: string | null
  description: string | null
  logoPath: string | null
  contactName: string | null
  website: string | null
  /** Email/portal branding chosen by the agency: primary, accent, logoUrl, supportEmail, supportPhone, footerNote. */
  branding: Record<string, string>
  /** What the assistant knows about this agency: services, faqs, tone, escalation, disclosure. */
  aiSettings: AiSettings
  /** Days before expiry on which renewal reminders go out. */
  reminderDays: number[]
}

export interface AiSettings {
  assistantName?: string
  tone?: string
  services?: string
  faqs?: string
  escalation?: string
  doNotSay?: string
  /** Allow the general insurance catalogue as background knowledge (default true). */
  useGeneralCatalogue?: boolean
}

export interface OrganizationSummary extends Organization {
  staffCount: number
  clientCount: number
  openConversations: number
}

export interface PublicUser {
  id: string
  role: Role
  organizationId: string | null
  name: string
  email: string
  phone: string | null
  title: string | null
  active: boolean
  whatsappOptIn: boolean
  mustChangePassword: boolean
  emailVerifiedAt?: string | null
  emailPrefs?: Record<string, boolean>
  createdAt?: string
  lastSeenAt?: string | null
}

/** A person's relationship with one agency. The same identity can hold several. */
export interface Membership {
  id: string
  userId: string
  organizationId: string
  organizationName: string
  organizationShortName: string
  role: 'agency_admin' | 'agency' | 'client'
  clientId: string | null
  status: 'invited' | 'active' | 'suspended'
  createdAt: string
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

export const PRODUCT_LINES = [
  'Motor Comprehensive',
  'Motor Third Party',
  'Motor Fleet',
  'Fire & Allied Perils',
  'Burglary',
  'Business Interruption',
  'Group Medical',
  'Individual Medical',
  'WIBA',
  'Group Personal Accident',
  'Public Liability',
  'Professional Indemnity',
  'Goods in Transit',
  'Domestic Package',
  'Travel',
  'Life',
  'Other',
] as const

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
  notes: string | null
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
  notes: string | null
  channel: string
  createdAt: string
  updatedAt: string
  submissions: QuoteSubmission[]
}

export type ClaimStage = 'notified' | 'registered' | 'documenting' | 'with-insurer' | 'assessed' | 'offer' | 'settled' | 'closed'

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
  description: string | null
  incidentDate: string | null
  channel: string
  nextUpdateDue: string | null
  notifiedAt: string
  updatedAt: string
}

/* ---------- Notifications ---------- */

export type NotificationKind =
  | 'welcome'
  | 'quote-requested'
  | 'quote-update'
  | 'claim-reported'
  | 'claim-update'
  | 'renewal-reminder'
  | 'stage-update'
  | 'policy-added'
  | 'message'
  | 'new-client'
  | 'task'

export interface Notification {
  id: string
  userId: string | null
  clientId: string | null
  kind: NotificationKind
  title: string
  body: string
  reference: string | null
  whatsappStatus: 'skipped' | 'sent' | 'failed'
  readAt: string | null
  createdAt: string
}

/* ---------- Agency work queue and dashboard ---------- */

export type TaskType = 'lead-contact' | 'quote-follow-up' | 'ai-review' | 'documents-missing' | 'proposal' | 'renewal' | 'claim-update'

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

export type ActivityKind =
  | 'quote-received'
  | 'quote-requested'
  | 'risk-profile'
  | 'proposal-sent'
  | 'documents-uploaded'
  | 'renewal'
  | 'claim'
  | 'claim-reported'
  | 'signup'
  | 'stage'
  | 'policy'
  | 'message'
  | 'whatsapp'

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
  notifications: Notification[]
}

/* ---------- Command bar ---------- */

export interface CommandResult {
  title: string
  lines: { text: string; detail?: string }[]
  actions: { label: string; href: string }[]
  source: string
}

/* ---------- Conversations (WhatsApp and web chat) ---------- */

export type ContactMode = 'ai' | 'human'

export interface WhatsAppContact {
  phone: string
  organizationId: string | null
  userId: string | null
  displayName: string | null
  mode: ContactMode
  assignedUserId: string | null
  workflow: string | null
  step: number | null
  data: Record<string, unknown>
  /** Long-lived facts and a rolling summary the assistant uses as memory. */
  memory: ContactMemory
  consentedAt: string | null
  inboundCount: number
  lastInboundAt: string | null
  handoffAt: string | null
  createdAt: string
  updatedAt: string
}

export interface ContactMemory {
  facts?: Record<string, string>
  summary?: string
  /** A workflow paused by an interruption (question mid-flow), restored on return. */
  paused?: { workflow: string; step: number; data: Record<string, unknown> } | null
  lastIntent?: string
}

export interface ConversationMessage {
  id: string
  phone: string
  organizationId: string | null
  userId: string | null
  direction: 'in' | 'out'
  role: 'user' | 'assistant' | 'agent' | 'system'
  body: string
  at: string
}

export interface ConversationRow extends WhatsAppContact {
  userName: string | null
  clientId: string | null
  clientName: string | null
  assignedName: string | null
  organizationName: string | null
  lastMessage: string | null
  lastMessageAt: string | null
  inboundCount: number
}

export interface Consultation {
  id: string
  organizationId: string | null
  userId: string | null
  phone: string | null
  channel: string
  question: string
  answer: string
  source: string
  at: string
}

export interface AuditEntry {
  id: string
  organizationId: string | null
  actorUserId: string | null
  action: string
  target: string | null
  detail: Record<string, unknown> | null
  at: string
}

/* ---------- Businesses, uploads, enquiries ---------- */

export interface Business {
  id: string
  organizationId: string
  clientId: string | null
  name: string
  registrationNo: string | null
  sector: string | null
  phone: string | null
  email: string | null
  address: string | null
  verified: boolean
  createdAt: string
}

export type BusinessClaimStatus = 'pending' | 'approved' | 'rejected'

export interface BusinessClaim {
  id: string
  organizationId: string
  businessId: string
  businessName: string
  clientId: string | null
  userId: string | null
  phone: string | null
  reference: string
  applicantName: string
  relationship: string
  verification: string | null
  status: BusinessClaimStatus
  reviewNote: string | null
  reviewedBy: string | null
  reviewedAt: string | null
  channel: string
  createdAt: string
}

export type UploadKind = 'id' | 'policy' | 'claim' | 'vehicle' | 'receipt' | 'photo' | 'form' | 'other'
export type OcrStatus = 'queued' | 'processing' | 'done' | 'failed' | 'skipped'

export interface Upload {
  id: string
  organizationId: string
  clientId: string | null
  userId: string | null
  phone: string | null
  source: 'whatsapp' | 'web' | 'agency'
  storagePath: string
  filename: string
  mimetype: string
  sizeBytes: number
  kind: UploadKind
  caption: string | null
  ocrStatus: OcrStatus
  ocrText: string | null
  extracted: Record<string, unknown> | null
  confirmedAt: string | null
  confirmedData: Record<string, unknown> | null
  claimId: string | null
  reviewedBy: string | null
  reviewedAt: string | null
  createdAt: string
}

export interface UploadRow extends Upload {
  clientName: string | null
}

export type EnquiryStatus = 'open' | 'answered' | 'closed'

export interface Enquiry {
  id: string
  organizationId: string
  clientId: string | null
  userId: string | null
  phone: string | null
  reference: string
  subject: string
  body: string
  status: EnquiryStatus
  answer: string | null
  answeredBy: string | null
  answeredAt: string | null
  channel: string
  createdAt: string
}

export interface EnquiryRow extends Enquiry {
  clientName: string | null
}

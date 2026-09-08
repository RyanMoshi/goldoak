import type { AgencySettings } from '@/types/billing'
import type {
  ActivityItem,
  AuditEntry,
  Business,
  BusinessClaim,
  Enquiry,
  EnquiryRow,
  Membership,
  Upload,
  UploadRow,
  Claim,
  Client,
  ClientListRow,
  Consultation,
  ConversationMessage,
  ConversationRow,
  Notification,
  Organization,
  OrganizationSummary,
  Role,
  WhatsAppContact,
  Policy,
  PublicUser,
  QuoteRequest,
  QuoteSubmission,
  SLATask,
} from '@/types/platform'

type Row = Record<string, unknown>

const str = (v: unknown): string => (v == null ? '' : String(v))
const strOrNull = (v: unknown): string | null => (v == null ? null : String(v))
const num = (v: unknown): number => (v == null ? 0 : Number(v))
const numOrNull = (v: unknown): number | null => (v == null ? null : Number(v))
const iso = (v: unknown): string => (v instanceof Date ? v.toISOString() : str(v))
const isoOrNull = (v: unknown): string | null => (v == null ? null : iso(v))
/** jsonb columns arrive as objects; tolerate a JSON string (older rows) and anything else becomes an empty object. */
const obj = (v: unknown): Record<string, unknown> => {
  if (v && typeof v === 'object' && !Array.isArray(v)) return v as Record<string, unknown>
  if (typeof v === 'string') {
    try {
      const parsed: unknown = JSON.parse(v)
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : {}
    } catch {
      return {}
    }
  }
  return {}
}

export function toOrganization(r: Row): Organization {
  return {
    id: str(r.id),
    name: str(r.name),
    shortName: str(r.short_name),
    phone: str(r.phone),
    email: str(r.email),
    whatsapp: str(r.whatsapp),
    code: strOrNull(r.code),
    active: r.active === undefined ? true : Boolean(r.active),
    greeting: strOrNull(r.greeting),
    licenceLabel: strOrNull(r.licence_label),
    status: r.status === 'pending' || r.status === 'suspended' ? r.status : 'active',
    type: strOrNull(r.type),
    address: strOrNull(r.address),
    description: strOrNull(r.description),
    logoPath: strOrNull(r.logo_path),
    contactName: strOrNull(r.contact_name),
    website: strOrNull(r.website),
    branding: obj(r.branding) as Record<string, string>,
    aiSettings: obj(r.ai_settings) as Organization['aiSettings'],
    settings: (r.settings as AgencySettings) ?? {},
    onboarding: (r.onboarding as Record<string, boolean>) ?? {},
    reminderDays: Array.isArray(r.reminder_days) ? (r.reminder_days as unknown[]).map(Number).filter((n) => Number.isFinite(n) && n >= 0) : [30, 14, 7, 1],
  }
}

export function toOrganizationSummary(r: Row): OrganizationSummary {
  return { ...toOrganization(r), staffCount: num(r.staff_count), clientCount: num(r.client_count), openConversations: num(r.open_conversations) }
}

export function toRole(v: unknown): Role {
  return v === 'admin' || v === 'agency_admin' || v === 'agency' ? v : 'client'
}

export function toContact(r: Row): WhatsAppContact {
  return {
    phone: str(r.phone),
    organizationId: strOrNull(r.organization_id),
    userId: strOrNull(r.user_id),
    displayName: strOrNull(r.display_name),
    mode: r.mode === 'human' ? 'human' : 'ai',
    assignedUserId: strOrNull(r.assigned_user_id),
    workflow: strOrNull(r.workflow),
    step: r.step == null ? null : Number(r.step),
    data: obj(r.data),
    memory: obj(r.memory) as WhatsAppContact['memory'],
    consentedAt: isoOrNull(r.consented_at),
    inboundCount: num(r.inbound_count),
    lastInboundAt: isoOrNull(r.last_inbound_at),
    handoffAt: isoOrNull(r.handoff_at),
    createdAt: iso(r.created_at),
    updatedAt: iso(r.updated_at),
  }
}

export function toConversationRow(r: Row): ConversationRow {
  return {
    ...toContact(r),
    userName: strOrNull(r.user_name),
    clientId: strOrNull(r.client_id),
    clientName: strOrNull(r.client_name),
    assignedName: strOrNull(r.assigned_name),
    organizationName: strOrNull(r.organization_name),
    lastMessage: strOrNull(r.last_message),
    lastMessageAt: isoOrNull(r.last_message_at),
    inboundCount: num(r.inbound_count),
  }
}

export function toConversationMessage(r: Row): ConversationMessage {
  return {
    id: str(r.id),
    phone: str(r.phone),
    organizationId: strOrNull(r.organization_id),
    userId: strOrNull(r.user_id),
    direction: r.direction === 'in' ? 'in' : 'out',
    role: (r.role as ConversationMessage['role']) ?? 'assistant',
    body: str(r.body),
    at: iso(r.at),
  }
}

export function toConsultation(r: Row): Consultation {
  return { id: str(r.id), organizationId: strOrNull(r.organization_id), userId: strOrNull(r.user_id), phone: strOrNull(r.phone), channel: str(r.channel), question: str(r.question), answer: str(r.answer), source: str(r.source), at: iso(r.at) }
}

export function toAuditEntry(r: Row): AuditEntry {
  return { id: str(r.id), organizationId: strOrNull(r.organization_id), actorUserId: strOrNull(r.actor_user_id), action: str(r.action), target: strOrNull(r.target), detail: r.detail == null ? null : obj(r.detail), at: iso(r.at) }
}

export function toPublicUser(r: Row): PublicUser {
  const role = toRole(r.role)
  return {
    id: str(r.id),
    role,
    organizationId: strOrNull(r.organization_id),
    name: str(r.name),
    email: str(r.email),
    phone: strOrNull(r.phone),
    title: strOrNull(r.title),
    active: r.active === undefined ? true : Boolean(r.active),
    whatsappOptIn: r.whatsapp_opt_in === undefined ? true : Boolean(r.whatsapp_opt_in),
    mustChangePassword: Boolean(r.must_change_password),
    emailVerifiedAt: isoOrNull(r.email_verified_at),
    emailPrefs: obj(r.email_prefs) as Record<string, boolean>,
    createdAt: r.created_at ? iso(r.created_at) : undefined,
    lastSeenAt: isoOrNull(r.last_seen_at),
  }
}

export function toClient(r: Row): Client {
  return {
    id: str(r.id),
    organizationId: str(r.organization_id),
    userId: strOrNull(r.user_id),
    name: str(r.name),
    type: (r.type as Client['type']) ?? 'individual',
    phone: strOrNull(r.phone),
    email: strOrNull(r.email),
    stage: (r.stage as Client['stage']) ?? 'understand',
    adviserName: strOrNull(r.adviser_name),
    notes: strOrNull(r.notes),
    createdAt: iso(r.created_at),
  }
}

export function toClientListRow(r: Row): ClientListRow {
  return {
    ...toClient(r),
    policyCount: num(r.policy_count),
    openQuoteCount: num(r.open_quote_count),
    openClaimCount: num(r.open_claim_count),
    nextExpiry: isoOrNull(r.next_expiry),
    annualPremium: num(r.annual_premium),
  }
}

export function toPolicy(r: Row): Policy {
  return {
    id: str(r.id),
    clientId: str(r.client_id),
    insurer: str(r.insurer),
    product: str(r.product),
    policyNumber: str(r.policy_number),
    sumInsured: numOrNull(r.sum_insured),
    premium: num(r.premium),
    startDate: iso(r.start_date),
    expiryDate: iso(r.expiry_date),
    status: (r.status as Policy['status']) ?? 'live',
    keyExclusions: strOrNull(r.key_exclusions),
  }
}

export function toSubmission(r: Row): QuoteSubmission {
  return { id: str(r.id), insurer: str(r.insurer), status: (r.status as QuoteSubmission['status']) ?? 'awaiting', premium: numOrNull(r.premium), sentAt: iso(r.sent_at) }
}

export function toQuoteRequest(r: Row, submissions: QuoteSubmission[] = []): QuoteRequest {
  return {
    id: str(r.id),
    clientId: str(r.client_id),
    reference: str(r.reference),
    product: str(r.product),
    stage: (r.stage as QuoteRequest['stage']) ?? 'requested',
    premiumEstimate: numOrNull(r.premium_estimate),
    notes: strOrNull(r.notes),
    channel: str(r.channel) || 'web',
    createdAt: iso(r.created_at),
    updatedAt: iso(r.updated_at),
    submissions,
  }
}

export function toClaim(r: Row): Claim {
  return {
    id: str(r.id),
    clientId: str(r.client_id),
    policyId: strOrNull(r.policy_id),
    reference: str(r.reference),
    insurer: str(r.insurer),
    product: str(r.product),
    stage: (r.stage as Claim['stage']) ?? 'notified',
    amount: numOrNull(r.amount),
    description: strOrNull(r.description),
    incidentDate: isoOrNull(r.incident_date),
    channel: str(r.channel) || 'web',
    nextUpdateDue: isoOrNull(r.next_update_due),
    notifiedAt: iso(r.notified_at),
    updatedAt: iso(r.updated_at),
  }
}

export function toTask(r: Row): SLATask {
  return {
    id: str(r.id),
    type: r.type as SLATask['type'],
    clientId: strOrNull(r.client_id),
    client: str(r.client_name),
    insurer: strOrNull(r.insurer),
    product: str(r.product),
    summary: str(r.summary),
    timing: str(r.timing),
    sla: (r.sla as SLATask['sla']) ?? 'on-track',
    priority: num(r.priority),
    dueToday: Boolean(r.due_today),
    amount: numOrNull(r.amount),
    reference: strOrNull(r.reference),
    action: { kind: r.action_kind as SLATask['action']['kind'], label: str(r.action_label) },
  }
}

export function toActivity(r: Row): ActivityItem {
  return { id: str(r.id), kind: r.kind as ActivityItem['kind'], title: str(r.title), client: str(r.client_name), at: iso(r.at) }
}

export function toNotification(r: Row): Notification {
  return {
    id: str(r.id),
    userId: strOrNull(r.user_id),
    clientId: strOrNull(r.client_id),
    kind: r.kind as Notification['kind'],
    title: str(r.title),
    body: str(r.body),
    reference: strOrNull(r.reference),
    whatsappStatus: (r.whatsapp_status as Notification['whatsappStatus']) ?? 'skipped',
    readAt: isoOrNull(r.read_at),
    createdAt: iso(r.created_at),
  }
}

export function toBusiness(r: Row): Business {
  return {
    id: str(r.id),
    organizationId: str(r.organization_id),
    clientId: strOrNull(r.client_id),
    name: str(r.name),
    registrationNo: strOrNull(r.registration_no),
    sector: strOrNull(r.sector),
    phone: strOrNull(r.phone),
    email: strOrNull(r.email),
    address: strOrNull(r.address),
    verified: Boolean(r.verified),
    createdAt: iso(r.created_at),
  }
}

export function toBusinessClaim(r: Row): BusinessClaim {
  return {
    id: str(r.id),
    organizationId: str(r.organization_id),
    businessId: str(r.business_id),
    businessName: str(r.business_name),
    clientId: strOrNull(r.client_id),
    userId: strOrNull(r.user_id),
    phone: strOrNull(r.phone),
    reference: str(r.reference),
    applicantName: str(r.applicant_name),
    relationship: str(r.relationship),
    verification: strOrNull(r.verification),
    status: (r.status as BusinessClaim['status']) ?? 'pending',
    reviewNote: strOrNull(r.review_note),
    reviewedBy: strOrNull(r.reviewed_by),
    reviewedAt: isoOrNull(r.reviewed_at),
    channel: str(r.channel) || 'whatsapp',
    createdAt: iso(r.created_at),
  }
}

export function toUpload(r: Row): Upload {
  return {
    id: str(r.id),
    organizationId: str(r.organization_id),
    clientId: strOrNull(r.client_id),
    userId: strOrNull(r.user_id),
    phone: strOrNull(r.phone),
    source: (r.source as Upload['source']) ?? 'whatsapp',
    storagePath: str(r.storage_path),
    filename: str(r.filename),
    mimetype: str(r.mimetype),
    sizeBytes: num(r.size_bytes),
    kind: (r.kind as Upload['kind']) ?? 'other',
    caption: strOrNull(r.caption),
    ocrStatus: (r.ocr_status as Upload['ocrStatus']) ?? 'queued',
    ocrText: strOrNull(r.ocr_text),
    extracted: r.extracted == null ? null : obj(r.extracted),
    confirmedAt: isoOrNull(r.confirmed_at),
    confirmedData: r.confirmed_data == null ? null : obj(r.confirmed_data),
    claimId: strOrNull(r.claim_id),
    reviewedBy: strOrNull(r.reviewed_by),
    reviewedAt: isoOrNull(r.reviewed_at),
    createdAt: iso(r.created_at),
  }
}

export function toUploadRow(r: Row): UploadRow {
  return { ...toUpload(r), clientName: strOrNull(r.client_name) }
}

export function toEnquiry(r: Row): Enquiry {
  return {
    id: str(r.id),
    organizationId: str(r.organization_id),
    clientId: strOrNull(r.client_id),
    userId: strOrNull(r.user_id),
    phone: strOrNull(r.phone),
    reference: str(r.reference),
    subject: str(r.subject),
    body: str(r.body),
    status: (r.status as Enquiry['status']) ?? 'open',
    answer: strOrNull(r.answer),
    answeredBy: strOrNull(r.answered_by),
    answeredAt: isoOrNull(r.answered_at),
    channel: str(r.channel) || 'whatsapp',
    createdAt: iso(r.created_at),
  }
}

export function toEnquiryRow(r: Row): EnquiryRow {
  return { ...toEnquiry(r), clientName: strOrNull(r.client_name) }
}

export function toMembership(r: Row): Membership {
  return {
    id: str(r.id),
    userId: str(r.user_id),
    organizationId: str(r.organization_id),
    organizationName: str(r.organization_name),
    organizationShortName: str(r.organization_short_name),
    role: (r.role as Membership['role']) ?? 'client',
    clientId: strOrNull(r.client_id),
    status: (r.status as Membership['status']) ?? 'active',
    createdAt: iso(r.created_at),
  }
}

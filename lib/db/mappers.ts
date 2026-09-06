import type {
  ActivityItem,
  Claim,
  Client,
  ClientListRow,
  Notification,
  Organization,
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

export function toOrganization(r: Row): Organization {
  return { id: str(r.id), name: str(r.name), shortName: str(r.short_name), phone: str(r.phone), email: str(r.email), whatsapp: str(r.whatsapp) }
}

export function toPublicUser(r: Row): PublicUser {
  const role = r.role === 'admin' ? 'admin' : r.role === 'agency' ? 'agency' : 'client'
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

export interface CampaignMedia {
  path: string
  filename: string
  mimetype: string
  kind: 'image' | 'document'
}

/**
 * Promotional and announcement campaigns. A campaign is composed once, its
 * audience is resolved into `campaign_recipients` rows, and a background
 * worker sends them a few at a time so the dashboard never blocks and the
 * provider is never flooded.
 */

export type CampaignChannel = 'whatsapp' | 'email' | 'both'
export type CampaignStatus = 'draft' | 'scheduled' | 'processing' | 'sent' | 'partial' | 'failed' | 'cancelled'
export type RecipientStatus = 'pending' | 'sent' | 'failed' | 'skipped'

/** Who to send to. Empty filters mean "every client of this agency". */
export interface CampaignAudience {
  /** Client journey stages to include, e.g. ['client','renewal']. */
  stages?: string[]
  /** Client types to include: individual, sme, corporate. */
  types?: string[]
  /** Only clients with a policy expiring within this many days. */
  expiringWithinDays?: number | null
  /** Explicit client ids; when present, filters are ignored. */
  clientIds?: string[]
  /** Include clients that have no login yet (lead records). */
  includeLeads?: boolean
  /**
   * Lists from the agency's number book to include. These are people the
   * agency can message who are not clients yet, which is most of a marketing
   * list. An empty array means every list.
   */
  numberLists?: string[]
  /** Whether the number book is part of this audience at all. */
  includeNumbers?: boolean
}

export interface Campaign {
  id: string
  organizationId: string
  name: string
  channel: CampaignChannel
  status: CampaignStatus
  audience: CampaignAudience
  subject: string | null
  body: string
  ctaLabel: string | null
  ctaUrl: string | null
  /** A picture or document sent alongside the message. */
  media: CampaignMedia | null
  scheduledAt: string | null
  startedAt: string | null
  finishedAt: string | null
  cancelledAt: string | null
  createdBy: string | null
  createdByName?: string | null
  totalRecipients: number
  sentCount: number
  failedCount: number
  skippedCount: number
  createdAt: string
  updatedAt: string
}

export interface CampaignRecipient {
  id: string
  campaignId: string
  clientId: string | null
  name: string
  email: string | null
  phone: string | null
  channel: 'email' | 'whatsapp'
  status: RecipientStatus
  error: string | null
  sentAt: string | null
}

export const CAMPAIGN_STATUS_LABEL: Record<CampaignStatus, string> = {
  draft: 'Draft',
  scheduled: 'Scheduled',
  processing: 'Processing',
  sent: 'Sent',
  partial: 'Partially sent',
  failed: 'Failed',
  cancelled: 'Cancelled',
}

/** Variables an agency may use in campaign text. */
export const CAMPAIGN_VARIABLES = ['first_name', 'last_name', 'full_name', 'agency_name', 'agent_name'] as const

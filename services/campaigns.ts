import { getSql } from '@/lib/db/client'
import { ensureSchema } from '@/lib/db/migrate'
import { newId } from '@/lib/ids'
import { sendWhatsApp } from '@/lib/whatsapp/provider'
import { audit } from '@/services/audit'
import { deliverCampaignEmail } from '@/services/emails'
import { enqueue } from '@/services/jobs'
import { getOrganization } from '@/services/users'
import type { Campaign, CampaignAudience, CampaignChannel, CampaignRecipient, CampaignStatus } from '@/types/campaigns'

/**
 * Campaigns: one message to many clients over WhatsApp, email or both.
 *
 * Sending is never done in the request that starts it. The audience is
 * resolved into `campaign_recipients` rows (deduplicated, opt-outs removed),
 * the campaign is marked `processing`, and a `campaign-batch` job sends a
 * small batch at a time, re-queueing itself until the list is done. That
 * keeps the dashboard responsive, respects provider rate limits, and means a
 * crash resumes instead of starting again or double-sending: each recipient
 * row moves from `pending` to `sent`/`failed`/`skipped` exactly once.
 */

const BATCH = 20
/** Pause between WhatsApp sends inside a batch, so we never look like a flood. */
const WHATSAPP_GAP_MS = 900

export interface CreateCampaignInput {
  organizationId: string
  actor: { id: string; name: string }
  name: string
  channel: CampaignChannel
  subject?: string | null
  body: string
  ctaLabel?: string | null
  ctaUrl?: string | null
  audience: CampaignAudience
  scheduledAt?: string | null
}

export async function createCampaign(input: CreateCampaignInput): Promise<Campaign> {
  await ensureSchema()
  const sql = getSql()
  const id = newId('cmp')
  await sql`INSERT INTO campaigns (id, organization_id, name, channel, status, audience, subject, body, cta_label, cta_url, scheduled_at, created_by)
    VALUES (${id}, ${input.organizationId}, ${input.name.slice(0, 160)}, ${input.channel}, ${input.scheduledAt ? 'scheduled' : 'draft'}, ${sql.json(input.audience as never)},
      ${input.subject?.slice(0, 200) ?? null}, ${input.body.slice(0, 4000)}, ${input.ctaLabel?.slice(0, 60) ?? null}, ${input.ctaUrl?.slice(0, 500) ?? null},
      ${input.scheduledAt ?? null}, ${input.actor.id})`
  await audit({ organizationId: input.organizationId, actorUserId: input.actor.id, action: 'campaign.created', target: id, detail: { name: input.name, channel: input.channel } })
  const c = await getCampaign(input.organizationId, id)
  if (!c) throw new Error('Campaign was not created')
  return c
}

export async function updateCampaign(organizationId: string, id: string, input: Omit<CreateCampaignInput, 'organizationId' | 'actor'>): Promise<Campaign | null> {
  const sql = getSql()
  const existing = await getCampaign(organizationId, id)
  if (!existing) return null
  if (existing.status !== 'draft' && existing.status !== 'scheduled') throw new Error('A campaign that has started can no longer be edited.')
  await sql`UPDATE campaigns SET name = ${input.name.slice(0, 160)}, channel = ${input.channel}, audience = ${sql.json(input.audience as never)},
      subject = ${input.subject?.slice(0, 200) ?? null}, body = ${input.body.slice(0, 4000)}, cta_label = ${input.ctaLabel?.slice(0, 60) ?? null},
      cta_url = ${input.ctaUrl?.slice(0, 500) ?? null}, scheduled_at = ${input.scheduledAt ?? null},
      status = ${input.scheduledAt ? 'scheduled' : 'draft'}, updated_at = now()
    WHERE id = ${id} AND organization_id = ${organizationId}`
  return getCampaign(organizationId, id)
}

export async function getCampaign(organizationId: string, id: string): Promise<Campaign | null> {
  await ensureSchema()
  const sql = getSql()
  const rows = await sql`SELECT c.*, u.name AS created_by_name FROM campaigns c LEFT JOIN users u ON u.id = c.created_by
    WHERE c.id = ${id} AND c.organization_id = ${organizationId} LIMIT 1`
  return rows[0] ? toCampaign(rows[0]) : null
}

export async function listCampaigns(organizationId: string | null, limit = 60): Promise<Campaign[]> {
  await ensureSchema()
  const sql = getSql()
  const rows = organizationId
    ? await sql`SELECT c.*, u.name AS created_by_name FROM campaigns c LEFT JOIN users u ON u.id = c.created_by
        WHERE c.organization_id = ${organizationId} ORDER BY c.created_at DESC LIMIT ${limit}`
    : await sql`SELECT c.*, u.name AS created_by_name FROM campaigns c LEFT JOIN users u ON u.id = c.created_by ORDER BY c.created_at DESC LIMIT ${limit}`
  return rows.map(toCampaign)
}

export async function listRecipients(organizationId: string, campaignId: string, limit = 200): Promise<CampaignRecipient[]> {
  const sql = getSql()
  const rows = await sql`SELECT * FROM campaign_recipients WHERE campaign_id = ${campaignId} AND organization_id = ${organizationId}
    ORDER BY CASE status WHEN 'failed' THEN 0 WHEN 'pending' THEN 1 WHEN 'skipped' THEN 2 ELSE 3 END, name ASC LIMIT ${limit}`
  return rows.map((r) => ({
    id: String(r.id),
    campaignId: String(r.campaign_id),
    clientId: r.client_id ? String(r.client_id) : null,
    name: String(r.name),
    email: r.email ? String(r.email) : null,
    phone: r.phone ? String(r.phone) : null,
    channel: r.channel as 'email' | 'whatsapp',
    status: r.status as CampaignRecipient['status'],
    error: r.error ? String(r.error) : null,
    sentAt: r.sent_at ? new Date(r.sent_at as string).toISOString() : null,
  }))
}

export interface AudienceMember {
  clientId: string | null
  userId: string | null
  name: string
  email: string | null
  phone: string | null
}

/**
 * Who the audience resolves to right now. Used both for the "this will reach
 * N people" preview and for the real send, so the number shown is the number
 * that receives it.
 */
export async function resolveAudience(organizationId: string, audience: CampaignAudience): Promise<AudienceMember[]> {
  await ensureSchema()
  const sql = getSql()
  const rows = await sql`SELECT c.id, c.name, c.email, c.phone, c.stage, c.type, c.user_id, u.email AS user_email, u.phone AS user_phone
    FROM clients c LEFT JOIN users u ON u.id = c.user_id
    WHERE c.organization_id = ${organizationId}`
  const ids = audience.clientIds?.length ? new Set(audience.clientIds) : null
  const stages = audience.stages?.length ? new Set(audience.stages) : null
  const types = audience.types?.length ? new Set(audience.types) : null

  let expiring: Set<string> | null = null
  if (audience.expiringWithinDays && audience.expiringWithinDays > 0) {
    const days = Math.min(365, Math.max(1, Math.round(audience.expiringWithinDays)))
    const exp = await sql`SELECT DISTINCT client_id FROM policies WHERE organization_id = ${organizationId}
      AND status <> 'cancelled' AND expiry_date <= (current_date + (${days} || ' days')::interval) AND expiry_date >= current_date`
    expiring = new Set(exp.map((r) => String(r.client_id)))
  }

  const out: AudienceMember[] = []
  for (const r of rows) {
    const id = String(r.id)
    if (ids) {
      if (!ids.has(id)) continue
    } else {
      if (stages && !stages.has(String(r.stage))) continue
      if (types && !types.has(String(r.type))) continue
      if (expiring && !expiring.has(id)) continue
      if (audience.includeLeads === false && !r.user_id) continue
    }
    out.push({
      clientId: id,
      userId: r.user_id ? String(r.user_id) : null,
      name: String(r.name),
      email: (r.email ? String(r.email) : r.user_email ? String(r.user_email) : null)?.toLowerCase() ?? null,
      phone: r.phone ? String(r.phone) : r.user_phone ? String(r.user_phone) : null,
    })
  }

  // The number book: people the agency can message who are not clients yet.
  // Numbers already reached through a client record are left out, so a person
  // who is in both places is messaged once.
  if (audience.includeNumbers && !ids) {
    const { reachableNumbers } = await import('@/services/numbers')
    const already = new Set(out.map((m) => m.phone).filter(Boolean) as string[])
    for (const n of await reachableNumbers(organizationId, audience.numberLists?.length ? audience.numberLists : null)) {
      if (already.has(n.phone)) continue
      already.add(n.phone)
      out.push({ clientId: null, userId: null, name: n.name ?? 'there', email: null, phone: n.phone })
    }
  }

  return out
}

export interface LaunchResult {
  recipients: number
  skipped: number
  status: CampaignStatus
}

/**
 * Turns the audience into recipient rows and starts the worker. Called again
 * on an already-processing campaign it does nothing, so a double click or a
 * resubmitted form cannot send twice.
 */
export async function launchCampaign(organizationId: string, id: string, actor: { id: string; name: string }): Promise<LaunchResult | null> {
  const sql = getSql()
  const campaign = await getCampaign(organizationId, id)
  if (!campaign) return null
  if (campaign.status === 'processing' || campaign.status === 'sent') return { recipients: campaign.totalRecipients, skipped: campaign.skippedCount, status: campaign.status }

  const members = await resolveAudience(organizationId, campaign.audience)
  const suppressed = await suppressionSet(organizationId)
  const wantsEmail = campaign.channel === 'email' || campaign.channel === 'both'
  const wantsWhatsApp = campaign.channel === 'whatsapp' || campaign.channel === 'both'
  const optedOut = await marketingOptOutUsers(organizationId)

  let queued = 0
  let skipped = 0
  const seen = new Set<string>()
  for (const m of members) {
    if (wantsEmail && m.email) {
      const key = `email:${m.email}`
      if (seen.has(key)) continue
      seen.add(key)
      const blocked = suppressed.has(`email:${m.email}`) || (m.userId ? optedOut.has(m.userId) : false)
      await addRecipient(id, organizationId, m, 'email', blocked ? 'skipped' : 'pending', blocked ? 'opted out' : null)
      blocked ? skipped++ : queued++
    }
    if (wantsWhatsApp && m.phone) {
      const key = `whatsapp:${m.phone}`
      if (seen.has(key)) continue
      seen.add(key)
      const blocked = suppressed.has(`whatsapp:${m.phone}`)
      await addRecipient(id, organizationId, m, 'whatsapp', blocked ? 'skipped' : 'pending', blocked ? 'opted out' : null)
      blocked ? skipped++ : queued++
    }
  }

  const status: CampaignStatus = queued > 0 ? 'processing' : 'sent'
  await sql`UPDATE campaigns SET status = ${status}, started_at = now(), total_recipients = ${queued + skipped}, skipped_count = ${skipped},
      finished_at = ${queued > 0 ? null : new Date().toISOString()}, updated_at = now()
    WHERE id = ${id} AND organization_id = ${organizationId}`
  await audit({ organizationId, actorUserId: actor.id, action: 'campaign.launched', target: id, detail: { name: campaign.name, recipients: queued, skipped } })
  if (queued > 0) await enqueue({ type: 'campaign-batch', organizationId, payload: { campaignId: id }, idempotencyKey: `campaign:${id}:0`, maxAttempts: 3 })
  return { recipients: queued, skipped, status }
}

async function addRecipient(campaignId: string, organizationId: string, m: AudienceMember, channel: 'email' | 'whatsapp', status: string, error: string | null): Promise<void> {
  const sql = getSql()
  await sql`INSERT INTO campaign_recipients (id, campaign_id, organization_id, client_id, user_id, name, email, phone, channel, status, error)
    VALUES (${newId('rcp')}, ${campaignId}, ${organizationId}, ${m.clientId}, ${m.userId}, ${m.name}, ${channel === 'email' ? m.email : null}, ${channel === 'whatsapp' ? m.phone : null}, ${channel}, ${status}, ${error})
    ON CONFLICT DO NOTHING`
}

export async function cancelCampaign(organizationId: string, id: string, actor: { id: string; name: string }): Promise<void> {
  const sql = getSql()
  await sql`UPDATE campaigns SET status = 'cancelled', cancelled_at = now(), finished_at = now(), updated_at = now()
    WHERE id = ${id} AND organization_id = ${organizationId} AND status IN ('draft','scheduled','processing')`
  await sql`UPDATE campaign_recipients SET status = 'skipped', error = 'campaign cancelled' WHERE campaign_id = ${id} AND status = 'pending'`
  await audit({ organizationId, actorUserId: actor.id, action: 'campaign.cancelled', target: id })
}

/**
 * Sends one batch. Returns true when there is more to do, so the job handler
 * can queue itself again.
 */
export async function sendBatch(campaignId: string): Promise<boolean> {
  const sql = getSql()
  const rows = await sql`SELECT * FROM campaigns WHERE id = ${campaignId} LIMIT 1`
  if (!rows[0]) return false
  const campaign = toCampaign(rows[0])
  if (campaign.status !== 'processing') return false
  const org = await getOrganization(campaign.organizationId)

  const claimed = await sql`UPDATE campaign_recipients SET status = 'sending'
    WHERE id IN (SELECT id FROM campaign_recipients WHERE campaign_id = ${campaignId} AND status = 'pending' ORDER BY created_at LIMIT ${BATCH} FOR UPDATE SKIP LOCKED)
    RETURNING *`
  if (!claimed.length) {
    await finishCampaign(campaignId)
    return false
  }

  for (const r of claimed) {
    const name = String(r.name)
    const vars = {
      first_name: name.split(' ')[0],
      last_name: name.split(' ').slice(1).join(' '),
      full_name: name,
      agency_name: org?.name ?? 'your agency',
      agent_name: campaign.createdByName ?? org?.contactName ?? '',
    }
    const body = substitute(campaign.body, vars)
    let ok = false
    let error: string | null = null
    try {
      if (r.channel === 'email') {
        const result = await deliverCampaignEmail({
          to: String(r.email),
          organizationId: campaign.organizationId,
          userId: r.user_id ? String(r.user_id) : null,
          clientId: r.client_id ? String(r.client_id) : null,
          subject: substitute(campaign.subject || campaign.name, vars),
          heading: substitute(campaign.subject || campaign.name, vars),
          firstName: vars.first_name,
          body,
          ctaLabel: campaign.ctaLabel,
          ctaUrl: campaign.ctaUrl,
          campaignId,
        })
        ok = result
        if (!ok) error = 'email provider refused the message'
      } else {
        ok = await sendWhatsApp(String(r.phone), body, campaign.organizationId)
        if (!ok) error = 'WhatsApp gateway did not accept the message'
        await new Promise((res) => setTimeout(res, WHATSAPP_GAP_MS))
      }
    } catch (e) {
      error = e instanceof Error ? e.message.slice(0, 300) : 'send failed'
    }
    await sql`UPDATE campaign_recipients SET status = ${ok ? 'sent' : 'failed'}, error = ${error}, sent_at = ${ok ? new Date().toISOString() : null} WHERE id = ${String(r.id)}`
  }

  await refreshCounts(campaignId)
  const remaining = await sql`SELECT count(*) AS n FROM campaign_recipients WHERE campaign_id = ${campaignId} AND status IN ('pending','sending')`
  const more = Number(remaining[0]?.n ?? 0) > 0
  if (!more) await finishCampaign(campaignId)
  return more
}

async function refreshCounts(campaignId: string): Promise<void> {
  const sql = getSql()
  await sql`UPDATE campaigns SET
      sent_count = (SELECT count(*) FROM campaign_recipients WHERE campaign_id = ${campaignId} AND status = 'sent'),
      failed_count = (SELECT count(*) FROM campaign_recipients WHERE campaign_id = ${campaignId} AND status = 'failed'),
      skipped_count = (SELECT count(*) FROM campaign_recipients WHERE campaign_id = ${campaignId} AND status = 'skipped'),
      updated_at = now()
    WHERE id = ${campaignId}`
}

async function finishCampaign(campaignId: string): Promise<void> {
  const sql = getSql()
  await refreshCounts(campaignId)
  await sql`UPDATE campaigns SET status = CASE
      WHEN failed_count = 0 THEN 'sent'
      WHEN sent_count = 0 THEN 'failed'
      ELSE 'partial' END,
    finished_at = now(), updated_at = now() WHERE id = ${campaignId} AND status = 'processing'`
}

/** Scheduled campaigns whose time has come. Called by the daily automation and the queue kick. */
export async function launchDueCampaigns(): Promise<number> {
  await ensureSchema()
  const sql = getSql()
  const due = await sql`SELECT id, organization_id FROM campaigns WHERE status = 'scheduled' AND scheduled_at IS NOT NULL AND scheduled_at <= now() LIMIT 10`
  let started = 0
  for (const row of due) {
    await launchCampaign(String(row.organization_id), String(row.id), { id: 'system', name: 'Scheduler' })
    started++
  }
  return started
}

/* ---------- Opt-out and suppression ---------- */

async function suppressionSet(organizationId: string): Promise<Set<string>> {
  const sql = getSql()
  const rows = await sql`SELECT channel, address FROM suppressions WHERE organization_id IS NULL OR organization_id = ${organizationId}`
  return new Set(rows.map((r) => `${String(r.channel)}:${String(r.address).toLowerCase()}`))
}

async function marketingOptOutUsers(organizationId: string): Promise<Set<string>> {
  const sql = getSql()
  const rows = await sql`SELECT u.id FROM users u JOIN memberships m ON m.user_id = u.id
    WHERE m.organization_id = ${organizationId} AND (u.email_prefs ->> 'marketing') = 'false'`
  return new Set(rows.map((r) => String(r.id)))
}

export async function suppress(organizationId: string | null, channel: 'email' | 'whatsapp', address: string, reason: string): Promise<void> {
  await ensureSchema()
  const sql = getSql()
  await sql`INSERT INTO suppressions (id, organization_id, channel, address, reason) VALUES (${newId('sup')}, ${organizationId}, ${channel}, ${address.toLowerCase()}, ${reason})
    ON CONFLICT DO NOTHING`
}

export async function unsuppress(organizationId: string | null, channel: 'email' | 'whatsapp', address: string): Promise<void> {
  const sql = getSql()
  await sql`DELETE FROM suppressions WHERE channel = ${channel} AND address = ${address.toLowerCase()} AND (organization_id IS NULL OR organization_id = ${organizationId})`
}

export async function listSuppressions(organizationId: string): Promise<{ channel: string; address: string; reason: string | null; createdAt: string }[]> {
  await ensureSchema()
  const sql = getSql()
  const rows = await sql`SELECT channel, address, reason, created_at FROM suppressions WHERE organization_id = ${organizationId} OR organization_id IS NULL ORDER BY created_at DESC LIMIT 200`
  return rows.map((r) => ({ channel: String(r.channel), address: String(r.address), reason: r.reason ? String(r.reason) : null, createdAt: new Date(r.created_at as string).toISOString() }))
}

export function substitute(text: string, vars: Record<string, string>): string {
  return text.replace(/\{\{\s*([a-z_]+)\s*\}\}/gi, (_, k: string) => vars[k] ?? '')
}

function toCampaign(r: Record<string, unknown>): Campaign {
  return {
    id: String(r.id),
    organizationId: String(r.organization_id),
    name: String(r.name),
    channel: r.channel as CampaignChannel,
    status: r.status as CampaignStatus,
    audience: (r.audience as CampaignAudience) ?? {},
    subject: r.subject ? String(r.subject) : null,
    body: String(r.body ?? ''),
    ctaLabel: r.cta_label ? String(r.cta_label) : null,
    ctaUrl: r.cta_url ? String(r.cta_url) : null,
    scheduledAt: r.scheduled_at ? new Date(r.scheduled_at as string).toISOString() : null,
    startedAt: r.started_at ? new Date(r.started_at as string).toISOString() : null,
    finishedAt: r.finished_at ? new Date(r.finished_at as string).toISOString() : null,
    cancelledAt: r.cancelled_at ? new Date(r.cancelled_at as string).toISOString() : null,
    createdBy: r.created_by ? String(r.created_by) : null,
    createdByName: r.created_by_name ? String(r.created_by_name) : null,
    totalRecipients: Number(r.total_recipients ?? 0),
    sentCount: Number(r.sent_count ?? 0),
    failedCount: Number(r.failed_count ?? 0),
    skippedCount: Number(r.skipped_count ?? 0),
    createdAt: new Date(r.created_at as string).toISOString(),
    updatedAt: new Date(r.updated_at as string).toISOString(),
  }
}

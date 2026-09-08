import { deliverEmail, emailConfigured } from '@/lib/email'
import { brandingFor, type Branding } from '@/lib/email/branding'
import { renderEmail } from '@/lib/email/layout'
import { OPTIONAL_CATEGORIES, TEMPLATES, substitute, type EmailCategory, type Vars } from '@/lib/email/templates'
import { getSql } from '@/lib/db/client'
import { ensureSchema } from '@/lib/db/migrate'
import { newId } from '@/lib/ids'
import { enqueue } from '@/services/jobs'
import { getOrganization } from '@/services/users'

/**
 * The platform email service. Resolves the agency's branding and template
 * overrides, renders, logs, and delivers in the background with retries.
 * Person → agency → branding → template → email. Never throws to callers.
 */

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://goldoak.vercel.app'

export interface SendTemplateInput {
  key: keyof typeof TEMPLATES | string
  to: string
  organizationId: string | null
  userId?: string | null
  clientId?: string | null
  vars: Vars
  category?: EmailCategory
  /** Deliver now (password reset, OTP) instead of via the queue. */
  immediate?: boolean
  relatedType?: string
  relatedId?: string
}

export type SendOutcome = 'queued' | 'sent' | 'failed' | 'skipped' | 'unconfigured'

interface Override {
  subject: string | null
  heading: string | null
  body: string | null
}

async function overrideFor(organizationId: string | null, key: string): Promise<{ org: Override | null; global: Override | null }> {
  const sql = getSql()
  const rows = await sql`SELECT organization_id, subject, heading, body FROM email_templates WHERE key = ${key} AND (organization_id = ${organizationId} OR organization_id IS NULL)`
  const pick = (orgId: string | null) => {
    const r = rows.find((x) => (x.organization_id ?? null) === orgId)
    return r ? { subject: r.subject ? String(r.subject) : null, heading: r.heading ? String(r.heading) : null, body: r.body ? String(r.body) : null } : null
  }
  return { org: organizationId ? pick(organizationId) : null, global: pick(null) }
}

export interface RenderedEmail {
  subject: string
  html: string
  text: string
  brand: Branding
  category: EmailCategory
}

/** Renders a template for an agency without sending (used by previews and the sender). */
export async function renderTemplate(key: string, organizationId: string | null, vars: Vars): Promise<RenderedEmail | null> {
  const def = TEMPLATES[key]
  if (!def) return null
  const org = organizationId ? await getOrganization(organizationId) : null
  const brand = brandingFor(org)
  const merged: Vars = { agency_name: brand.name, support_email: brand.supportEmail, support_phone: brand.supportPhone, login_url: `${SITE}/signin`, dashboard_url: `${SITE}/portal`, ...vars }
  const { org: o, global: g } = await overrideFor(organizationId, key)
  const custom = (field: 'subject' | 'heading' | 'body'): string | null => {
    if (!def.customisable.includes(field)) return null
    const v = o?.[field] ?? g?.[field] ?? null
    return v ? substitute(v, merged) : null
  }
  const content = def.content({ ...merged, heading: custom('heading') ?? undefined, body: custom('body') ?? undefined }, brand)
  const subject = custom('subject') ?? def.subject(merged, brand)
  const { html, text } = renderEmail(brand, content)
  return { subject, html, text, brand, category: def.category }
}

async function allowedByPreference(userId: string | null | undefined, category: EmailCategory): Promise<boolean> {
  if (!userId || !OPTIONAL_CATEGORIES.includes(category)) return true
  const sql = getSql()
  const rows = await sql`SELECT email_prefs FROM users WHERE id = ${userId} LIMIT 1`
  const prefs = (rows[0]?.email_prefs as Record<string, boolean>) ?? {}
  return prefs[category] !== false
}

/** Renders, logs and sends (queued by default). */
export async function sendTemplateEmail(input: SendTemplateInput): Promise<SendOutcome> {
  try {
    await ensureSchema()
    const sql = getSql()
    const rendered = await renderTemplate(String(input.key), input.organizationId, input.vars)
    if (!rendered) return 'failed'
    const category = input.category ?? rendered.category
    const id = newId('eml')
    const to = input.to.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return 'failed'
    if (!(await allowedByPreference(input.userId, category))) {
      await sql`INSERT INTO email_log (id, organization_id, user_id, client_id, template, to_email, subject, status, error, related_type, related_id)
        VALUES (${id}, ${input.organizationId}, ${input.userId ?? null}, ${input.clientId ?? null}, ${String(input.key)}, ${to}, ${rendered.subject}, 'skipped', 'opted out', ${input.relatedType ?? null}, ${input.relatedId ?? null})`
      return 'skipped'
    }
    if (!emailConfigured()) {
      await sql`INSERT INTO email_log (id, organization_id, user_id, client_id, template, to_email, subject, status, error, related_type, related_id)
        VALUES (${id}, ${input.organizationId}, ${input.userId ?? null}, ${input.clientId ?? null}, ${String(input.key)}, ${to}, ${rendered.subject}, 'skipped', 'SMTP not configured', ${input.relatedType ?? null}, ${input.relatedId ?? null})`
      return 'unconfigured'
    }
    await sql`INSERT INTO email_log (id, organization_id, user_id, client_id, template, to_email, subject, status, related_type, related_id)
      VALUES (${id}, ${input.organizationId}, ${input.userId ?? null}, ${input.clientId ?? null}, ${String(input.key)}, ${to}, ${rendered.subject}, 'queued', ${input.relatedType ?? null}, ${input.relatedId ?? null})`
    // The rendered body is kept with the job so a retry sends exactly what was logged.
    const payload = { logId: id, html: rendered.html, text: rendered.text, subject: rendered.subject, to, fromName: rendered.brand.name, replyTo: rendered.brand.supportEmail || undefined }
    if (input.immediate) {
      const ok = await deliverLogged(id, payload)
      return ok ? 'sent' : 'failed'
    }
    await enqueue({ type: 'email-send', organizationId: input.organizationId, payload, idempotencyKey: `email:${id}`, maxAttempts: 5 })
    return 'queued'
  } catch (error) {
    console.error('sendTemplateEmail failed', error instanceof Error ? error.message : error)
    return 'failed'
  }
}

interface QueuedPayload {
  logId: string
  html: string
  text: string
  subject: string
  to: string
  fromName?: string
  replyTo?: string
}

async function deliverLogged(logId: string, payload: QueuedPayload): Promise<boolean> {
  const sql = getSql()
  const result = await deliverEmail({ to: payload.to, subject: payload.subject, text: payload.text, html: payload.html, fromName: payload.fromName, replyTo: payload.replyTo })
  if (result.ok) {
    await sql`UPDATE email_log SET status = 'sent', provider_id = ${result.messageId ?? null}, sent_at = now(), attempts = attempts + 1, error = NULL WHERE id = ${logId}`
    return true
  }
  await sql`UPDATE email_log SET status = 'failed', attempts = attempts + 1, error = ${result.error ?? 'unknown'} WHERE id = ${logId}`
  return false
}

/** Job handler: sends a queued email; throwing makes the job retry with backoff, and the log turns `dead` after the last attempt. */
export async function deliverQueuedEmail(logId: string, payload?: QueuedPayload): Promise<void> {
  const sql = getSql()
  const rows = await sql`SELECT status, attempts FROM email_log WHERE id = ${logId} LIMIT 1`
  if (!rows[0] || rows[0].status === 'sent') return
  if (!payload) throw new Error('email payload missing')
  const ok = await deliverLogged(logId, payload)
  if (!ok) {
    if (Number(rows[0].attempts) + 1 >= 5) await sql`UPDATE email_log SET status = 'dead' WHERE id = ${logId}`
    throw new Error('email delivery failed')
  }
}

/* ---------- Activity and templates for the dashboards ---------- */

export interface EmailLogRow {
  id: string
  organizationId: string | null
  organizationName: string | null
  userId: string | null
  template: string
  to: string
  subject: string
  status: string
  error: string | null
  attempts: number
  createdAt: string
  sentAt: string | null
}

export async function listEmailLog(organizationId: string | null, limit = 100): Promise<EmailLogRow[]> {
  await ensureSchema()
  const sql = getSql()
  const rows = organizationId
    ? await sql`SELECT e.*, o.name AS organization_name FROM email_log e LEFT JOIN organizations o ON o.id = e.organization_id WHERE e.organization_id = ${organizationId} ORDER BY e.created_at DESC LIMIT ${limit}`
    : await sql`SELECT e.*, o.name AS organization_name FROM email_log e LEFT JOIN organizations o ON o.id = e.organization_id ORDER BY e.created_at DESC LIMIT ${limit}`
  return rows.map((r) => ({
    id: String(r.id),
    organizationId: r.organization_id ? String(r.organization_id) : null,
    organizationName: r.organization_name ? String(r.organization_name) : null,
    userId: r.user_id ? String(r.user_id) : null,
    template: String(r.template),
    to: String(r.to_email),
    subject: String(r.subject),
    status: String(r.status),
    error: r.error ? String(r.error) : null,
    attempts: Number(r.attempts),
    createdAt: new Date(String(r.created_at)).toISOString(),
    sentAt: r.sent_at ? new Date(String(r.sent_at)).toISOString() : null,
  }))
}

export interface EmailStats {
  sent24h: number
  failed24h: number
  queued: number
  dead: number
}

export async function emailStats(organizationId: string | null): Promise<EmailStats> {
  await ensureSchema()
  const sql = getSql()
  const rows = organizationId
    ? await sql`SELECT
        (SELECT count(*) FROM email_log WHERE organization_id = ${organizationId} AND status = 'sent' AND created_at > now() - interval '1 day') AS sent,
        (SELECT count(*) FROM email_log WHERE organization_id = ${organizationId} AND status IN ('failed','dead') AND created_at > now() - interval '1 day') AS failed,
        (SELECT count(*) FROM email_log WHERE organization_id = ${organizationId} AND status = 'queued') AS queued,
        (SELECT count(*) FROM email_log WHERE organization_id = ${organizationId} AND status = 'dead') AS dead`
    : await sql`SELECT
        (SELECT count(*) FROM email_log WHERE status = 'sent' AND created_at > now() - interval '1 day') AS sent,
        (SELECT count(*) FROM email_log WHERE status IN ('failed','dead') AND created_at > now() - interval '1 day') AS failed,
        (SELECT count(*) FROM email_log WHERE status = 'queued') AS queued,
        (SELECT count(*) FROM email_log WHERE status = 'dead') AS dead`
  const r = rows[0] ?? {}
  return { sent24h: Number(r.sent ?? 0), failed24h: Number(r.failed ?? 0), queued: Number(r.queued ?? 0), dead: Number(r.dead ?? 0) }
}

export interface TemplateOverrideRow {
  key: string
  label: string
  category: EmailCategory
  customisable: string[]
  variables: string[]
  subject: string | null
  heading: string | null
  body: string | null
  /** Where the current text comes from. */
  source: 'default' | 'global' | 'agency'
}

export async function listTemplateOverrides(organizationId: string | null): Promise<TemplateOverrideRow[]> {
  await ensureSchema()
  const sql = getSql()
  const rows = await sql`SELECT * FROM email_templates WHERE organization_id = ${organizationId} OR organization_id IS NULL`
  return Object.values(TEMPLATES)
    .filter((t) => (organizationId ? t.customisable.length > 0 : true))
    .map((t) => {
      const own = organizationId ? rows.find((r) => r.organization_id === organizationId && r.key === t.key) : null
      const global = rows.find((r) => r.organization_id == null && r.key === t.key)
      const src = own ?? global
      return { key: t.key, label: t.label, category: t.category, customisable: t.customisable, variables: t.variables, subject: src?.subject ? String(src.subject) : null, heading: src?.heading ? String(src.heading) : null, body: src?.body ? String(src.body) : null, source: own ? 'agency' : global ? 'global' : 'default' }
    })
}

export async function saveTemplateOverride(organizationId: string | null, key: string, fields: { subject?: string | null; heading?: string | null; body?: string | null }, actorUserId: string): Promise<void> {
  const def = TEMPLATES[key]
  if (!def) throw new Error('Unknown template')
  if (organizationId && def.customisable.length === 0) throw new Error('This template cannot be customised by an agency')
  const sql = getSql()
  const clean = (f: 'subject' | 'heading' | 'body') => (def.customisable.includes(f) || !organizationId ? (fields[f]?.trim() ? fields[f]!.trim().slice(0, 2000) : null) : null)
  const subject = clean('subject')
  const heading = clean('heading')
  const body = clean('body')
  if (!subject && !heading && !body) {
    await sql`DELETE FROM email_templates WHERE coalesce(organization_id, '') = ${organizationId ?? ''} AND key = ${key}`
    return
  }
  await sql`INSERT INTO email_templates (id, organization_id, key, subject, heading, body, updated_by)
    VALUES (${newId('tpl')}, ${organizationId}, ${key}, ${subject}, ${heading}, ${body}, ${actorUserId})
    ON CONFLICT (coalesce(organization_id, ''), key) DO UPDATE SET subject = EXCLUDED.subject, heading = EXCLUDED.heading, body = EXCLUDED.body, updated_by = EXCLUDED.updated_by, updated_at = now()`
}

export async function updateEmailPreferences(userId: string, prefs: Record<string, boolean>): Promise<void> {
  const sql = getSql()
  const allowed: Record<string, boolean> = {}
  for (const c of OPTIONAL_CATEGORIES) if (c in prefs) allowed[c] = Boolean(prefs[c])
  await sql`UPDATE users SET email_prefs = ${sql.json(allowed as never)}, updated_at = now() WHERE id = ${userId}`
}

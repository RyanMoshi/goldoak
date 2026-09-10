import { getSql } from '@/lib/db/client'
import { ensureSchema } from '@/lib/db/migrate'
import { newId } from '@/lib/ids'
import { resolveWahaBase, wahaApiKey, wahaReady } from '@/lib/whatsapp/providers/waha'
import { audit } from '@/services/audit'

/**
 * One WhatsApp number per agency, as a named session on the WAHA gateway.
 * Inbound events carry the session name, which resolves the tenant before
 * anything else looks at the message. The shared Super Agent number stays as
 * the fallback, reached with a join code.
 *
 * WAHA runs every session in one container, so adding an agency costs a
 * session rather than a server. Pairing is a QR the agency scans on its own
 * dashboard; the credentials live only in the gateway's session volume.
 */

export interface Channel {
  id: string
  organizationId: string
  provider: 'waha' | 'openwa' | 'meta'
  sessionId: string | null
  phone: string | null
  label: string | null
  status: string
  lastError: string | null
  createdAt: string
  updatedAt: string
}

function row(r: Record<string, unknown>): Channel {
  return {
    id: String(r.id),
    organizationId: String(r.organization_id),
    provider: r.provider === 'meta' ? 'meta' : r.provider === 'openwa' ? 'openwa' : 'waha',
    sessionId: r.session_id ? String(r.session_id) : null,
    phone: r.phone ? String(r.phone) : null,
    label: r.label ? String(r.label) : null,
    status: String(r.status ?? 'pending'),
    lastError: r.last_error ? String(r.last_error) : null,
    createdAt: new Date(String(r.created_at)).toISOString(),
    updatedAt: new Date(String(r.updated_at)).toISOString(),
  }
}

const headers = () => ({ 'Content-Type': 'application/json', 'X-Api-Key': wahaApiKey() })

/** Reachable at all: pinned in the environment, or published by the gateway. */
export async function gatewayConfigured(): Promise<boolean> {
  return wahaReady()
}

export async function channelForOrganization(organizationId: string): Promise<Channel | null> {
  await ensureSchema()
  const sql = getSql()
  const rows = await sql`SELECT * FROM whatsapp_channels WHERE organization_id = ${organizationId} ORDER BY created_at DESC LIMIT 1`
  return rows[0] ? row(rows[0]) : null
}

export async function organizationForSession(sessionId: string): Promise<string | null> {
  await ensureSchema()
  const sql = getSql()
  const rows = await sql`SELECT organization_id FROM whatsapp_channels WHERE session_id = ${sessionId} LIMIT 1`
  return rows[0] ? String(rows[0].organization_id) : null
}

export async function listChannels(): Promise<(Channel & { organizationName: string })[]> {
  await ensureSchema()
  const sql = getSql()
  const rows = await sql`SELECT c.*, o.name AS organization_name FROM whatsapp_channels c JOIN organizations o ON o.id = c.organization_id ORDER BY o.name`
  return rows.map((r) => ({ ...row(r), organizationName: String(r.organization_name) }))
}

async function gateway(path: string, init: RequestInit & { timeoutMs?: number } = {}): Promise<Response> {
  const base = await resolveWahaBase()
  if (!base) throw new Error('The WhatsApp gateway has no address yet.')
  const controller = new AbortController()
  const t = setTimeout(() => controller.abort(), init.timeoutMs ?? 30_000)
  try {
    return await fetch(`${base}${path}`, { ...init, headers: { ...headers(), ...(init.headers ?? {}) }, signal: controller.signal })
  } finally {
    clearTimeout(t)
  }
}

/** WAHA's own words for where a session is, mapped to the ones the dashboard shows. */
function normalizeStatus(raw: string | undefined): string {
  switch ((raw ?? '').toUpperCase()) {
    case 'WORKING':
      return 'ready'
    case 'SCAN_QR_CODE':
      return 'qr_ready'
    case 'STARTING':
      return 'starting'
    case 'STOPPED':
      return 'stopped'
    case 'FAILED':
      return 'failed'
    default:
      return raw ? raw.toLowerCase() : 'unknown'
  }
}

/** The session name for an agency. Stable, so reconnecting reuses the same pairing. */
function sessionName(organizationId: string): string {
  return `org-${organizationId.replace(/^org_/, '').replace(/[^a-zA-Z0-9_-]/g, '')}`
}

/**
 * Creates (or reuses) the agency's gateway session, with the webhook declared
 * in the session's own configuration so inbound messages carry its name.
 * Pairing happens by QR on the agency's dashboard.
 */
export async function connectChannel(organizationId: string, actorUserId: string, label: string | null): Promise<Channel> {
  if (!(await gatewayConfigured())) throw new Error('The WhatsApp gateway is not configured on the server.')
  await ensureSchema()
  const sql = getSql()

  const existing = await channelForOrganization(organizationId)
  if (existing?.sessionId) {
    await gateway(`/api/sessions/${encodeURIComponent(existing.sessionId)}/start`, { method: 'POST' }).catch(() => null)
    return existing
  }

  const name = sessionName(organizationId)
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://goldoak.vercel.app'
  const hmacKey = process.env.WAHA_HMAC_KEY ?? process.env.OPENWA_WEBHOOK_SECRET
  const config = {
    webhooks: [
      {
        url: `${site}/api/whatsapp/waha`,
        events: ['message'],
        ...(hmacKey ? { hmac: { key: hmacKey } } : {}),
        retries: { policy: 'exponential', attempts: 3, delaySeconds: 2 },
      },
    ],
  }

  const created = await gateway('/api/sessions', { method: 'POST', body: JSON.stringify({ name, start: true, config }) })
  // A session that already exists on the gateway is not an error: adopt it.
  if (!created.ok && created.status !== 409 && created.status !== 422) {
    throw new Error(`Gateway refused to create the session (${created.status}): ${(await created.text()).slice(0, 200)}`)
  }
  if (!created.ok) {
    await gateway(`/api/sessions/${encodeURIComponent(name)}`, { method: 'PUT', body: JSON.stringify({ config }) }).catch(() => null)
    await gateway(`/api/sessions/${encodeURIComponent(name)}/start`, { method: 'POST' }).catch(() => null)
  }

  const id = newId('wch')
  await sql`INSERT INTO whatsapp_channels (id, organization_id, provider, session_id, label, status, created_by)
    VALUES (${id}, ${organizationId}, 'waha', ${name}, ${label}, 'starting', ${actorUserId})`
  await audit({ organizationId, actorUserId, action: 'whatsapp.channel-created', target: id, detail: { sessionId: name } })
  return (await channelForOrganization(organizationId))!
}

export interface ChannelStatus {
  status: string
  phone: string | null
  pushName: string | null
  qr: string | null
  lastError: string | null
}

/** Live status from the gateway; syncs the phone number and status into our record. */
export async function channelStatus(channel: Channel): Promise<ChannelStatus> {
  if (!channel.sessionId || !(await gatewayConfigured())) return { status: channel.status, phone: channel.phone, pushName: null, qr: null, lastError: channel.lastError }
  const sql = getSql()
  try {
    const res = await gateway(`/api/sessions/${encodeURIComponent(channel.sessionId)}`, { timeoutMs: 15_000 })
    if (!res.ok) throw new Error(`gateway ${res.status}`)
    const s = (await res.json()) as {
      status?: string
      me?: { id?: string | null; pushName?: string | null } | null
      engine?: { state?: string } | null
    }
    const status = normalizeStatus(s.status)

    // The QR is only worth fetching while the gateway is actually waiting for one.
    let qr: string | null = null
    if (status === 'qr_ready') {
      const q = await gateway(`/api/${encodeURIComponent(channel.sessionId)}/auth/qr`, { timeoutMs: 15_000, headers: { Accept: 'application/json' } })
      if (q.ok) {
        const body = (await q.json()) as { mimetype?: string; data?: string }
        if (body.data) qr = body.data.startsWith('data:') ? body.data : `data:${body.mimetype ?? 'image/png'};base64,${body.data}`
      }
    }

    const phone = s.me?.id ? String(s.me.id).replace(/@.*$/, '').replace(/\D/g, '') : channel.phone
    await sql`UPDATE whatsapp_channels SET status = ${status}, phone = ${phone}, last_error = ${null}, updated_at = now() WHERE id = ${channel.id}`
    if (phone) await sql`UPDATE organizations SET whatsapp = ${phone} WHERE id = ${channel.organizationId}`
    return { status, phone, pushName: s.me?.pushName ?? null, qr, lastError: null }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    await sql`UPDATE whatsapp_channels SET status = 'gateway-unreachable', last_error = ${message.slice(0, 200)}, updated_at = now() WHERE id = ${channel.id}`
    return { status: 'gateway-unreachable', phone: channel.phone, pushName: null, qr: null, lastError: message }
  }
}

/** Restarts one agency's session without touching anybody else's. */
export async function restartChannel(channel: Channel): Promise<void> {
  if (!channel.sessionId) return
  const res = await gateway(`/api/sessions/${encodeURIComponent(channel.sessionId)}/restart`, { method: 'POST' }).catch(() => null)
  if (res?.ok) return
  // Older gateways have no restart; stop and start is the same thing.
  await gateway(`/api/sessions/${encodeURIComponent(channel.sessionId)}/stop`, { method: 'POST' }).catch(() => null)
  await gateway(`/api/sessions/${encodeURIComponent(channel.sessionId)}/start`, { method: 'POST' }).catch(() => null)
}

/** Logs the number out of WhatsApp, deletes the session, and forgets the record. */
export async function disconnectChannel(channel: Channel, actorUserId: string): Promise<void> {
  const sql = getSql()
  if (channel.sessionId) {
    await gateway(`/api/sessions/${encodeURIComponent(channel.sessionId)}/logout`, { method: 'POST' }).catch(() => null)
    await gateway(`/api/sessions/${encodeURIComponent(channel.sessionId)}`, { method: 'DELETE' }).catch(() => null)
  }
  await sql`DELETE FROM whatsapp_channels WHERE id = ${channel.id}`
  await sql`UPDATE organizations SET whatsapp = ${process.env.WHATSAPP_BOT_NUMBER?.replace(/\D/g, '') ?? ''} WHERE id = ${channel.organizationId}`
  await audit({ organizationId: channel.organizationId, actorUserId, action: 'whatsapp.channel-removed', target: channel.id })
}

import { getSql } from '@/lib/db/client'
import { ensureSchema } from '@/lib/db/migrate'
import { newId } from '@/lib/ids'
import { audit } from '@/services/audit'

/**
 * One WhatsApp number per agency, as a session on the OpenWA gateway.
 * Inbound events carry the session id, which resolves the tenant before
 * anything else looks at the message. The shared Super Agent number
 * (OPENWA_SESSION_ID) stays as the fallback with join codes.
 */

export interface Channel {
  id: string
  organizationId: string
  provider: 'openwa' | 'meta'
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
    provider: r.provider === 'meta' ? 'meta' : 'openwa',
    sessionId: r.session_id ? String(r.session_id) : null,
    phone: r.phone ? String(r.phone) : null,
    label: r.label ? String(r.label) : null,
    status: String(r.status ?? 'pending'),
    lastError: r.last_error ? String(r.last_error) : null,
    createdAt: new Date(String(r.created_at)).toISOString(),
    updatedAt: new Date(String(r.updated_at)).toISOString(),
  }
}

const base = () => (process.env.OPENWA_BASE_URL ?? '').replace(/\/$/, '')
const headers = () => ({ 'Content-Type': 'application/json', 'X-API-Key': process.env.OPENWA_API_KEY ?? '' })

export function gatewayConfigured(): boolean {
  return Boolean(process.env.OPENWA_BASE_URL && process.env.OPENWA_API_KEY)
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
  const controller = new AbortController()
  const t = setTimeout(() => controller.abort(), init.timeoutMs ?? 30_000)
  try {
    return await fetch(`${base()}${path}`, { ...init, headers: { ...headers(), ...(init.headers ?? {}) }, signal: controller.signal })
  } finally {
    clearTimeout(t)
  }
}

/** Creates (or reuses) the agency's gateway session and registers the webhook. Pairing happens by QR on the dashboard. */
export async function connectChannel(organizationId: string, actorUserId: string, label: string | null): Promise<Channel> {
  if (!gatewayConfigured()) throw new Error('The WhatsApp gateway is not configured on the server.')
  await ensureSchema()
  const sql = getSql()
  const existing = await channelForOrganization(organizationId)
  if (existing?.sessionId) {
    await gateway(`/api/sessions/${encodeURIComponent(existing.sessionId)}/start`, { method: 'POST' }).catch(() => null)
    return existing
  }
  const name = `org-${organizationId.replace(/^org_/, '')}`
  const created = await gateway('/api/sessions', { method: 'POST', body: JSON.stringify({ name }) })
  if (!created.ok) throw new Error(`Gateway refused to create the session (${created.status}): ${(await created.text()).slice(0, 200)}`)
  const session = (await created.json()) as { id?: string }
  if (!session.id) throw new Error('Gateway returned no session id')
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://goldoak.vercel.app'
  const hook = await gateway(`/api/sessions/${encodeURIComponent(session.id)}/webhooks`, { method: 'POST', body: JSON.stringify({ url: `${site}/api/whatsapp/openwa`, events: ['message.received'], secret: process.env.OPENWA_WEBHOOK_SECRET ?? undefined }) })
  const hookJson = hook.ok ? ((await hook.json()) as { id?: string }) : {}
  await gateway(`/api/sessions/${encodeURIComponent(session.id)}/start`, { method: 'POST' }).catch(() => null)
  const id = newId('wch')
  await sql`INSERT INTO whatsapp_channels (id, organization_id, provider, session_id, label, status, webhook_id, created_by)
    VALUES (${id}, ${organizationId}, 'openwa', ${session.id}, ${label}, 'pending', ${hookJson.id ?? null}, ${actorUserId})`
  await audit({ organizationId, actorUserId, action: 'whatsapp.channel-created', target: id, detail: { sessionId: session.id } })
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
  if (!channel.sessionId || !gatewayConfigured()) return { status: channel.status, phone: channel.phone, pushName: null, qr: null, lastError: channel.lastError }
  const sql = getSql()
  try {
    const res = await gateway(`/api/sessions/${encodeURIComponent(channel.sessionId)}`, { timeoutMs: 15_000 })
    if (!res.ok) throw new Error(`gateway ${res.status}`)
    const s = (await res.json()) as { status?: string; phone?: string | null; pushName?: string | null; lastError?: string | null }
    const status = s.status ?? 'unknown'
    let qr: string | null = null
    if (status === 'qr_ready') {
      const q = await gateway(`/api/sessions/${encodeURIComponent(channel.sessionId)}/qr?format=image`, { timeoutMs: 15_000 })
      if (q.ok) qr = ((await q.json()) as { qrCode?: string }).qrCode ?? null
    }
    const phone = s.phone ? String(s.phone).replace(/\D/g, '') : channel.phone
    await sql`UPDATE whatsapp_channels SET status = ${status}, phone = ${phone}, last_error = ${s.lastError ?? null}, updated_at = now() WHERE id = ${channel.id}`
    if (phone) await sql`UPDATE organizations SET whatsapp = ${phone} WHERE id = ${channel.organizationId}`
    return { status, phone, pushName: s.pushName ?? null, qr, lastError: s.lastError ?? null }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    await sql`UPDATE whatsapp_channels SET status = 'gateway-unreachable', last_error = ${message.slice(0, 200)}, updated_at = now() WHERE id = ${channel.id}`
    return { status: 'gateway-unreachable', phone: channel.phone, pushName: null, qr: null, lastError: message }
  }
}

export async function restartChannel(channel: Channel): Promise<void> {
  if (!channel.sessionId) return
  await gateway(`/api/sessions/${encodeURIComponent(channel.sessionId)}/stop`, { method: 'POST' }).catch(() => null)
  await gateway(`/api/sessions/${encodeURIComponent(channel.sessionId)}/start`, { method: 'POST' }).catch(() => null)
}

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

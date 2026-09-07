import { getSql } from '@/lib/db/client'
import { ensureSchema } from '@/lib/db/migrate'

/** One search box for the agency workspace. Every query is scoped to the organisation. */

export interface SearchHit {
  kind: 'client' | 'business' | 'claim' | 'quote' | 'conversation' | 'document' | 'enquiry'
  title: string
  detail: string
  href: string
}

export async function searchAll(organizationId: string, query: string, limit = 8): Promise<SearchHit[]> {
  await ensureSchema()
  const sql = getSql()
  const q = query.trim()
  if (q.length < 2) return []
  const like = `%${q.toLowerCase()}%`
  const digits = q.replace(/\D/g, '')
  const hits: SearchHit[] = []

  const clients = await sql`SELECT id, name, phone, email, stage FROM clients WHERE organization_id = ${organizationId} AND (lower(name) LIKE ${like} OR lower(coalesce(email,'')) LIKE ${like} OR (${digits} <> '' AND coalesce(phone,'') LIKE ${'%' + digits + '%'})) ORDER BY updated_at DESC LIMIT ${limit}`
  for (const r of clients) hits.push({ kind: 'client', title: String(r.name), detail: [r.email, r.phone ? `+${r.phone}` : null, `stage ${r.stage}`].filter(Boolean).join(' · '), href: `/agency/clients/${r.id}` })

  const businesses = await sql`SELECT id, name, registration_no, client_id FROM businesses WHERE organization_id = ${organizationId} AND (lower(name) LIKE ${like} OR lower(coalesce(registration_no,'')) LIKE ${like}) ORDER BY name LIMIT ${limit}`
  for (const r of businesses) hits.push({ kind: 'business', title: String(r.name), detail: r.registration_no ? String(r.registration_no) : 'Business', href: r.client_id ? `/agency/clients/${r.client_id}` : '/agency/businesses' })

  const claims = await sql`SELECT k.id, k.reference, k.product, k.stage, c.name AS client_name, c.id AS client_id FROM claims k JOIN clients c ON c.id = k.client_id WHERE k.organization_id = ${organizationId} AND (lower(k.reference) LIKE ${like} OR lower(c.name) LIKE ${like} OR lower(k.product) LIKE ${like}) ORDER BY k.updated_at DESC LIMIT ${limit}`
  for (const r of claims) hits.push({ kind: 'claim', title: `${r.reference} · ${r.product}`, detail: `${r.client_name} · ${r.stage}`, href: `/agency/clients/${r.client_id}` })

  const quotes = await sql`SELECT q.id, q.reference, q.product, q.stage, c.name AS client_name, c.id AS client_id FROM quote_requests q JOIN clients c ON c.id = q.client_id WHERE q.organization_id = ${organizationId} AND (lower(q.reference) LIKE ${like} OR lower(c.name) LIKE ${like} OR lower(q.product) LIKE ${like}) ORDER BY q.updated_at DESC LIMIT ${limit}`
  for (const r of quotes) hits.push({ kind: 'quote', title: `${r.reference} · ${r.product}`, detail: `${r.client_name} · ${r.stage}`, href: `/agency/clients/${r.client_id}` })

  const conversations = await sql`SELECT w.phone, w.display_name, u.name AS user_name FROM whatsapp_contacts w LEFT JOIN users u ON u.id = w.user_id WHERE w.organization_id = ${organizationId} AND ((${digits} <> '' AND w.phone LIKE ${'%' + digits + '%'}) OR lower(coalesce(w.display_name,'')) LIKE ${like} OR lower(coalesce(u.name,'')) LIKE ${like}) ORDER BY w.updated_at DESC LIMIT ${limit}`
  for (const r of conversations) hits.push({ kind: 'conversation', title: String(r.user_name ?? r.display_name ?? `+${r.phone}`), detail: `WhatsApp +${r.phone}`, href: `/agency/conversations/${r.phone}` })

  const docs = await sql`SELECT id, filename, kind, ocr_status FROM uploads WHERE organization_id = ${organizationId} AND (lower(filename) LIKE ${like} OR lower(coalesce(ocr_text,'')) LIKE ${like}) ORDER BY created_at DESC LIMIT ${limit}`
  for (const r of docs) hits.push({ kind: 'document', title: String(r.filename), detail: `${r.kind} · ${r.ocr_status}`, href: '/agency/documents' })

  const enquiries = await sql`SELECT id, reference, subject, status FROM enquiries WHERE organization_id = ${organizationId} AND (lower(reference) LIKE ${like} OR lower(subject) LIKE ${like} OR lower(body) LIKE ${like}) ORDER BY created_at DESC LIMIT ${limit}`
  for (const r of enquiries) hits.push({ kind: 'enquiry', title: `${r.reference} · ${r.subject}`, detail: String(r.status), href: '/agency/enquiries' })

  return hits.slice(0, 40)
}

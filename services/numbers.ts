import { getSql } from '@/lib/db/client'
import { ensureSchema } from '@/lib/db/migrate'
import { countryOf, toE164 } from '@/lib/phone'
import { newId } from '@/lib/ids'

/**
 * The agency's number book.
 *
 * Campaign audiences are built from client records, so until now a number
 * could only be reached once somebody had become a client. Agencies do not
 * work that way: lists arrive in thousands, long before anyone signs anything.
 * These rows are those numbers, and everything here is written for that scale.
 * Nothing loads the whole book into memory, imports go in one statement rather
 * than one per line, and the unique index makes a repeated paste harmless.
 */

export type NumberStatus = 'active' | 'unsubscribed' | 'invalid' | 'bounced'

export const NUMBER_STATUS_LABEL: Record<NumberStatus, string> = {
  active: 'Active',
  unsubscribed: 'Opted out',
  invalid: 'Invalid',
  bounced: 'Bounced',
}

export interface ContactNumber {
  id: string
  organizationId: string
  phone: string
  country: string | null
  name: string | null
  listName: string
  status: NumberStatus
  ownerUserId: string | null
  ownerName: string | null
  source: string
  notes: string | null
  lastSentAt: string | null
  sendCount: number
  createdAt: string
}

function row(r: Record<string, unknown>): ContactNumber {
  return {
    id: String(r.id),
    organizationId: String(r.organization_id),
    phone: String(r.phone),
    country: r.country ? String(r.country) : null,
    name: r.name ? String(r.name) : null,
    listName: String(r.list_name ?? 'general'),
    status: (String(r.status) as NumberStatus) ?? 'active',
    ownerUserId: r.owner_user_id ? String(r.owner_user_id) : null,
    ownerName: r.owner_name ? String(r.owner_name) : null,
    source: String(r.source ?? 'manual'),
    notes: r.notes ? String(r.notes) : null,
    lastSentAt: r.last_sent_at ? new Date(String(r.last_sent_at)).toISOString() : null,
    sendCount: Number(r.send_count ?? 0),
    createdAt: new Date(String(r.created_at)).toISOString(),
  }
}

export interface NumberQuery {
  search?: string
  list?: string
  status?: NumberStatus | 'all'
  owner?: string
  sort?: 'newest' | 'oldest' | 'name' | 'phone' | 'activity'
  page?: number
  pageSize?: number
}

export interface NumberPage {
  rows: ContactNumber[]
  total: number
  page: number
  pageSize: number
  pages: number
}

const PAGE_SIZE = 50
const MAX_PAGE_SIZE = 200

/**
 * One page of the book, filtered and counted in the database. The count comes
 * back in the same round trip as the rows, so paging through fifty thousand
 * numbers costs the same as paging through fifty.
 */
export async function listNumbers(organizationId: string, query: NumberQuery = {}): Promise<NumberPage> {
  await ensureSchema()
  const sql = getSql()

  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Math.round(query.pageSize ?? PAGE_SIZE)))
  const page = Math.max(1, Math.round(query.page ?? 1))
  const offset = (page - 1) * pageSize

  const search = query.search?.trim() ?? ''
  const like = search ? `%${search.replace(/[%_]/g, (m) => `\\${m}`)}%` : null
  const digits = search.replace(/\D/g, '')
  const phoneLike = digits ? `%${digits}%` : null
  const list = query.list && query.list !== 'all' ? query.list : null
  const status = query.status && query.status !== 'all' ? query.status : null
  const owner = query.owner && query.owner !== 'all' ? query.owner : null

  const order =
    query.sort === 'oldest' ? sql`n.created_at ASC`
    : query.sort === 'name' ? sql`n.name ASC NULLS LAST, n.phone ASC`
    : query.sort === 'phone' ? sql`n.phone ASC`
    : query.sort === 'activity' ? sql`n.last_sent_at DESC NULLS LAST`
    : sql`n.created_at DESC`

  const rows = await sql`
    SELECT n.*, u.name AS owner_name, count(*) OVER () AS total_count
    FROM contact_numbers n
    LEFT JOIN users u ON u.id = n.owner_user_id
    WHERE n.organization_id = ${organizationId}
      AND (${like}::text IS NULL OR n.name ILIKE ${like} OR n.phone ILIKE ${phoneLike})
      AND (${list}::text IS NULL OR n.list_name = ${list})
      AND (${status}::text IS NULL OR n.status = ${status})
      AND (${owner}::text IS NULL OR n.owner_user_id = ${owner})
    ORDER BY ${order}
    LIMIT ${pageSize} OFFSET ${offset}`

  const total = rows[0] ? Number(rows[0].total_count) : 0
  return { rows: rows.map(row), total, page, pageSize, pages: Math.max(1, Math.ceil(total / pageSize)) }
}

/** The lists an agency has, with how many numbers are in each. */
export async function listNames(organizationId: string): Promise<{ name: string; count: number }[]> {
  await ensureSchema()
  const sql = getSql()
  const rows = await sql`SELECT list_name, count(*)::int AS count FROM contact_numbers
    WHERE organization_id = ${organizationId} GROUP BY list_name ORDER BY count DESC, list_name ASC`
  return rows.map((r) => ({ name: String(r.list_name), count: Number(r.count) }))
}

export async function numberStats(organizationId: string): Promise<{ total: number; active: number; optedOut: number; lists: number }> {
  await ensureSchema()
  const sql = getSql()
  const rows = await sql`SELECT
      count(*)::int AS total,
      count(*) FILTER (WHERE status = 'active')::int AS active,
      count(*) FILTER (WHERE status = 'unsubscribed')::int AS opted_out,
      count(DISTINCT list_name)::int AS lists
    FROM contact_numbers WHERE organization_id = ${organizationId}`
  const r = rows[0] ?? {}
  return { total: Number(r.total ?? 0), active: Number(r.active ?? 0), optedOut: Number(r.opted_out ?? 0), lists: Number(r.lists ?? 0) }
}

export interface ParsedLine {
  phone: string
  name: string | null
  /** ISO country the number belongs to, for display and filtering. */
  country: string | null
}

export interface ParseReport {
  valid: ParsedLine[]
  invalid: { line: string; reason: string }[]
  duplicatesInInput: number
}

const MAX_IMPORT = 20_000

/**
 * Reads pasted text into numbers. Accepts one per line, and the common shapes
 * a spreadsheet produces: "name, number", "number, name", tabs, semicolons.
 * Nothing is written here; the caller decides what to do with the report.
 */
export function parseNumbers(text: string, country?: string | null): ParseReport {
  const valid: ParsedLine[] = []
  const invalid: { line: string; reason: string }[] = []
  const seen = new Set<string>()
  let duplicatesInInput = 0

  const lines = text.split(/\r?\n/).slice(0, MAX_IMPORT + 1)
  for (const raw of lines) {
    const line = raw.trim()
    if (!line) continue
    if (valid.length >= MAX_IMPORT) {
      invalid.push({ line, reason: `Only the first ${MAX_IMPORT.toLocaleString('en-KE')} lines are read at once` })
      break
    }

    const parts = line.split(/[,;\t]/).map((p) => p.trim()).filter(Boolean)
    let phone: string | null = null
    let name: string | null = null
    for (const part of parts.length ? parts : [line]) {
      // A number written with + or 00 keeps its own country code; a local one
      // is read against the agency's country.
      const candidate = toE164(part, country)
      if (candidate && !phone) phone = candidate
      else if (!candidate && !name && /[a-z]/i.test(part)) name = part.slice(0, 120)
    }

    if (!phone) {
      invalid.push({ line: line.slice(0, 80), reason: 'Not a valid number in any country' })
      continue
    }
    if (seen.has(phone)) {
      duplicatesInInput++
      continue
    }
    seen.add(phone)
    valid.push({ phone, name, country: countryOf(phone) })
  }

  return { valid, invalid, duplicatesInInput }
}

export interface ImportResult {
  added: number
  updated: number
  skipped: number
  invalid: { line: string; reason: string }[]
}

/**
 * Writes a parsed list in batches. A number the agency already has keeps its
 * status and owner: re-importing a list must never quietly re-subscribe
 * somebody who opted out.
 */
export async function importNumbers(input: {
  organizationId: string
  createdBy: string
  listName: string
  source?: string
  ownerUserId?: string | null
  parsed: ParseReport
}): Promise<ImportResult> {
  await ensureSchema()
  const sql = getSql()
  const list = (input.listName || 'general').trim().slice(0, 60) || 'general'
  const source = input.source ?? 'paste'

  if (!input.parsed.valid.length) {
    return { added: 0, updated: 0, skipped: input.parsed.duplicatesInInput, invalid: input.parsed.invalid }
  }

  const existing = await sql`SELECT phone FROM contact_numbers WHERE organization_id = ${input.organizationId}
    AND phone = ANY(${input.parsed.valid.map((v) => v.phone)})`
  const known = new Set(existing.map((r) => String(r.phone)))

  const CHUNK = 500
  for (let i = 0; i < input.parsed.valid.length; i += CHUNK) {
    const chunk = input.parsed.valid.slice(i, i + CHUNK)
    const values = chunk.map((v) => ({
      id: newId('num'),
      organization_id: input.organizationId,
      phone: v.phone,
      country: v.country,
      name: v.name,
      list_name: list,
      status: 'active',
      owner_user_id: input.ownerUserId ?? null,
      source,
      created_by: input.createdBy,
    }))
    // A name arriving with the import fills a gap but never overwrites one
    // somebody typed, and status is left exactly as it was.
    await sql`INSERT INTO contact_numbers ${sql(values as never, 'id', 'organization_id', 'phone', 'country', 'name', 'list_name', 'status', 'owner_user_id', 'source', 'created_by')}
      ON CONFLICT (organization_id, phone) DO UPDATE
      SET name = COALESCE(contact_numbers.name, EXCLUDED.name),
          list_name = EXCLUDED.list_name,
          updated_at = now()`
  }

  const added = input.parsed.valid.filter((v) => !known.has(v.phone)).length
  return {
    added,
    updated: input.parsed.valid.length - added,
    skipped: input.parsed.duplicatesInInput,
    invalid: input.parsed.invalid,
  }
}

export async function addNumber(input: {
  organizationId: string
  createdBy: string
  phone: string
  /** ISO country for a number written in local form. */
  country?: string | null
  name?: string | null
  listName?: string
  ownerUserId?: string | null
  notes?: string | null
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const phone = toE164(input.phone, input.country)
  if (!phone) return { ok: false, error: 'That is not a valid number. Write it in full international form, such as +254 712 345 678.' }

  await ensureSchema()
  const sql = getSql()
  const existing = await sql`SELECT id FROM contact_numbers WHERE organization_id = ${input.organizationId} AND phone = ${phone} LIMIT 1`
  if (existing[0]) return { ok: false, error: 'That number is already in your list.' }

  const id = newId('num')
  await sql`INSERT INTO contact_numbers (id, organization_id, phone, country, name, list_name, owner_user_id, notes, source, created_by)
    VALUES (${id}, ${input.organizationId}, ${phone}, ${countryOf(phone)}, ${input.name?.trim().slice(0, 120) || null},
      ${(input.listName || 'general').trim().slice(0, 60) || 'general'}, ${input.ownerUserId ?? null},
      ${input.notes?.trim().slice(0, 500) || null}, 'manual', ${input.createdBy})`
  return { ok: true, id }
}

export async function updateNumber(
  organizationId: string,
  id: string,
  patch: { name?: string | null; listName?: string; status?: NumberStatus; ownerUserId?: string | null; notes?: string | null },
): Promise<boolean> {
  await ensureSchema()
  const sql = getSql()
  const rows = await sql`UPDATE contact_numbers SET
      name = COALESCE(${patch.name === undefined ? null : patch.name?.trim().slice(0, 120) || null}, name),
      list_name = COALESCE(${patch.listName?.trim().slice(0, 60) ?? null}, list_name),
      status = COALESCE(${patch.status ?? null}, status),
      owner_user_id = ${patch.ownerUserId === undefined ? sql`owner_user_id` : patch.ownerUserId},
      notes = COALESCE(${patch.notes === undefined ? null : patch.notes?.trim().slice(0, 500) || null}, notes),
      updated_at = now()
    WHERE organization_id = ${organizationId} AND id = ${id}
    RETURNING id`
  return rows.length > 0
}

export async function deleteNumbers(organizationId: string, ids: string[]): Promise<number> {
  if (!ids.length) return 0
  await ensureSchema()
  const sql = getSql()
  const rows = await sql`DELETE FROM contact_numbers WHERE organization_id = ${organizationId} AND id = ANY(${ids}) RETURNING id`
  return rows.length
}

export async function setStatusFor(organizationId: string, ids: string[], status: NumberStatus): Promise<number> {
  if (!ids.length) return 0
  await ensureSchema()
  const sql = getSql()
  const rows = await sql`UPDATE contact_numbers SET status = ${status}, updated_at = now()
    WHERE organization_id = ${organizationId} AND id = ANY(${ids}) RETURNING id`
  return rows.length
}

/** Everyone in the chosen lists who may still be messaged. */
export async function reachableNumbers(organizationId: string, lists: string[] | null): Promise<{ phone: string; name: string | null }[]> {
  await ensureSchema()
  const sql = getSql()
  const rows = lists?.length
    ? await sql`SELECT phone, name FROM contact_numbers WHERE organization_id = ${organizationId} AND status = 'active' AND list_name = ANY(${lists})`
    : await sql`SELECT phone, name FROM contact_numbers WHERE organization_id = ${organizationId} AND status = 'active'`
  return rows.map((r) => ({ phone: String(r.phone), name: r.name ? String(r.name) : null }))
}

/** Records that a campaign went out, so the list shows real activity. */
export async function markSent(organizationId: string, phones: string[]): Promise<void> {
  if (!phones.length) return
  const sql = getSql()
  await sql`UPDATE contact_numbers SET last_sent_at = now(), send_count = send_count + 1, updated_at = now()
    WHERE organization_id = ${organizationId} AND phone = ANY(${phones})`
}

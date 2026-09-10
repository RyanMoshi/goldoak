import { getSql } from '@/lib/db/client'
import { ensureSchema } from '@/lib/db/migrate'

/**
 * Every account on the platform, in one place.
 *
 * Super Admin previously had no way to see a person who was not an agency:
 * customers, agents and team members were each visible only from inside the
 * tenant they belonged to. This is the directory that answers "who is on this
 * platform", regardless of what they are.
 *
 * Everything is filtered, counted and paged in the database. A platform with a
 * hundred thousand accounts costs the same to browse as one with ten.
 */

export type DirectoryRole = 'admin' | 'agency_admin' | 'agency' | 'client'

export interface DirectoryUser {
  id: string
  name: string
  email: string
  phone: string | null
  role: DirectoryRole
  active: boolean
  organizationId: string | null
  organizationName: string | null
  /** Every agency this person belongs to, which can be more than one. */
  agencies: { id: string; name: string; role: string; status: string }[]
  emailVerified: boolean
  createdAt: string
  lastSeenAt: string | null
}

function row(r: Record<string, unknown>): DirectoryUser {
  return {
    id: String(r.id),
    name: String(r.name),
    email: String(r.email),
    phone: r.phone ? String(r.phone) : null,
    role: String(r.role) as DirectoryRole,
    active: r.active !== false,
    organizationId: r.organization_id ? String(r.organization_id) : null,
    organizationName: r.organization_name ? String(r.organization_name) : null,
    agencies: Array.isArray(r.agencies) ? (r.agencies as DirectoryUser['agencies']) : [],
    emailVerified: Boolean(r.email_verified_at),
    createdAt: new Date(String(r.created_at)).toISOString(),
    lastSeenAt: r.last_seen_at ? new Date(String(r.last_seen_at)).toISOString() : null,
  }
}

export interface DirectoryQuery {
  search?: string
  role?: DirectoryRole | 'all' | 'staff'
  status?: 'active' | 'inactive' | 'all'
  organizationId?: string
  sort?: 'newest' | 'oldest' | 'name' | 'seen'
  page?: number
  pageSize?: number
}

export interface DirectoryPage {
  rows: DirectoryUser[]
  total: number
  page: number
  pageSize: number
  pages: number
}

const PAGE_SIZE = 40

export async function listDirectory(query: DirectoryQuery = {}): Promise<DirectoryPage> {
  await ensureSchema()
  const sql = getSql()

  const pageSize = Math.min(200, Math.max(1, Math.round(query.pageSize ?? PAGE_SIZE)))
  const page = Math.max(1, Math.round(query.page ?? 1))
  const offset = (page - 1) * pageSize

  const search = query.search?.trim() ?? ''
  const like = search ? `%${search.replace(/[%_]/g, (m) => `\\${m}`)}%` : null
  const role = query.role && query.role !== 'all' && query.role !== 'staff' ? query.role : null
  const staffOnly = query.role === 'staff'
  const active = query.status === 'active' ? true : query.status === 'inactive' ? false : null
  const org = query.organizationId ?? null

  const order =
    query.sort === 'oldest' ? sql`u.created_at ASC`
    : query.sort === 'name' ? sql`u.name ASC`
    : query.sort === 'seen' ? sql`u.last_seen_at DESC NULLS LAST`
    : sql`u.created_at DESC`

  const rows = await sql`
    SELECT u.id, u.name, u.email, u.phone, u.role, u.active, u.organization_id,
           u.email_verified_at, u.created_at, u.last_seen_at,
           o.name AS organization_name,
           COALESCE((
             SELECT json_agg(json_build_object('id', m.organization_id, 'name', mo.name, 'role', m.role, 'status', m.status))
             FROM memberships m JOIN organizations mo ON mo.id = m.organization_id
             WHERE m.user_id = u.id
           ), '[]'::json) AS agencies,
           count(*) OVER () AS total_count
    FROM users u
    LEFT JOIN organizations o ON o.id = u.organization_id
    WHERE (${like}::text IS NULL OR u.name ILIKE ${like} OR u.email ILIKE ${like} OR u.phone ILIKE ${like})
      AND (${role}::text IS NULL OR u.role = ${role})
      AND (${staffOnly} = false OR u.role IN ('agency_admin', 'agency'))
      AND (${active}::boolean IS NULL OR u.active = ${active})
      AND (${org}::text IS NULL OR u.organization_id = ${org}
           OR EXISTS (SELECT 1 FROM memberships m WHERE m.user_id = u.id AND m.organization_id = ${org}))
    ORDER BY ${order}
    LIMIT ${pageSize} OFFSET ${offset}`

  const total = rows[0] ? Number(rows[0].total_count) : 0
  return { rows: rows.map(row), total, page, pageSize, pages: Math.max(1, Math.ceil(total / pageSize)) }
}

export interface PlatformCounts {
  users: number
  customers: number
  staff: number
  admins: number
  inactive: number
  agencies: number
  activeAgencies: number
  newThisWeek: number
}

/** The numbers on the overview, in one round trip each. */
export async function platformCounts(): Promise<PlatformCounts> {
  await ensureSchema()
  const sql = getSql()
  const [people, orgs] = await Promise.all([
    sql`SELECT
        count(*)::int AS users,
        count(*) FILTER (WHERE role = 'client')::int AS customers,
        count(*) FILTER (WHERE role IN ('agency', 'agency_admin'))::int AS staff,
        count(*) FILTER (WHERE role = 'admin')::int AS admins,
        count(*) FILTER (WHERE active = false)::int AS inactive,
        count(*) FILTER (WHERE created_at > now() - interval '7 days')::int AS new_this_week
      FROM users`,
    sql`SELECT count(*)::int AS agencies, count(*) FILTER (WHERE active AND status = 'active')::int AS active_agencies FROM organizations`,
  ])
  const p = people[0] ?? {}
  const o = orgs[0] ?? {}
  return {
    users: Number(p.users ?? 0),
    customers: Number(p.customers ?? 0),
    staff: Number(p.staff ?? 0),
    admins: Number(p.admins ?? 0),
    inactive: Number(p.inactive ?? 0),
    newThisWeek: Number(p.new_this_week ?? 0),
    agencies: Number(o.agencies ?? 0),
    activeAgencies: Number(o.active_agencies ?? 0),
  }
}

export interface SearchHit {
  kind: 'user' | 'agency' | 'client' | 'campaign' | 'billing'
  id: string
  title: string
  subtitle: string
  href: string
}

/**
 * One box that finds anything. Each source is capped, so a broad word cannot
 * turn a search into a table scan of the whole platform.
 */
export async function searchPlatform(term: string, limit = 6): Promise<SearchHit[]> {
  const search = term.trim()
  if (search.length < 2) return []
  await ensureSchema()
  const sql = getSql()
  const like = `%${search.replace(/[%_]/g, (m) => `\\${m}`)}%`

  const [users, orgs, clients, campaigns, billing] = await Promise.all([
    sql`SELECT id, name, email, role FROM users WHERE name ILIKE ${like} OR email ILIKE ${like} OR phone ILIKE ${like} ORDER BY created_at DESC LIMIT ${limit}`,
    sql`SELECT id, name, code, status FROM organizations WHERE name ILIKE ${like} OR code ILIKE ${like} ORDER BY name LIMIT ${limit}`,
    sql`SELECT c.id, c.name, c.email, o.name AS org FROM clients c JOIN organizations o ON o.id = c.organization_id
        WHERE c.name ILIKE ${like} OR c.email ILIKE ${like} OR c.phone ILIKE ${like} ORDER BY c.created_at DESC LIMIT ${limit}`,
    sql`SELECT c.id, c.name, c.status, o.name AS org FROM campaigns c JOIN organizations o ON o.id = c.organization_id
        WHERE c.name ILIKE ${like} ORDER BY c.created_at DESC LIMIT ${limit}`,
    sql`SELECT b.id, b.number, b.kind, b.customer_name, o.name AS org FROM billing_documents b JOIN organizations o ON o.id = b.organization_id
        WHERE b.number ILIKE ${like} OR b.customer_name ILIKE ${like} ORDER BY b.created_at DESC LIMIT ${limit}`,
  ])

  return [
    ...users.map((r) => ({
      kind: 'user' as const,
      id: String(r.id),
      title: String(r.name),
      subtitle: `${String(r.role).replace('_', ' ')} · ${String(r.email)}`,
      href: `/super-admin/users?q=${encodeURIComponent(String(r.email))}`,
    })),
    ...orgs.map((r) => ({
      kind: 'agency' as const,
      id: String(r.id),
      title: String(r.name),
      subtitle: `Agency · ${String(r.status ?? 'active')}`,
      href: `/super-admin/users?org=${encodeURIComponent(String(r.id))}`,
    })),
    ...clients.map((r) => ({
      kind: 'client' as const,
      id: String(r.id),
      title: String(r.name),
      subtitle: `Client of ${String(r.org)}`,
      href: `/super-admin/users?q=${encodeURIComponent(String(r.email ?? r.name))}`,
    })),
    ...campaigns.map((r) => ({
      kind: 'campaign' as const,
      id: String(r.id),
      title: String(r.name),
      subtitle: `Campaign · ${String(r.status)} · ${String(r.org)}`,
      href: `/super-admin/users?org=${encodeURIComponent(String(r.id))}`,
    })),
    ...billing.map((r) => ({
      kind: 'billing' as const,
      id: String(r.id),
      title: String(r.number),
      subtitle: `${String(r.kind)} · ${String(r.customer_name)} · ${String(r.org)}`,
      href: `/super-admin/users?q=${encodeURIComponent(String(r.customer_name))}`,
    })),
  ]
}

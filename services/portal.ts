import { getSql } from '@/lib/db/client'
import { ensureSchema } from '@/lib/db/migrate'
import { toClaim, toClient, toOrganization, toPolicy, toPublicUser, toQuoteRequest, toSubmission } from '@/lib/db/mappers'
import { DEFAULT_ORGANIZATION_ID } from '@/services/users'
import type { PortalData } from '@/types/platform'

/** Everything a client sees: their journey stage, policies, open quotes and claims. */
export async function getPortalData(userId: string): Promise<PortalData | null> {
  await ensureSchema()
  const sql = getSql()

  const userRows = await sql`SELECT * FROM users WHERE id = ${userId} AND role = 'client' LIMIT 1`
  if (!userRows[0]) return null
  const user = toPublicUser(userRows[0])

  const orgRows = await sql`SELECT * FROM organizations WHERE id = ${user.organizationId ?? DEFAULT_ORGANIZATION_ID} LIMIT 1`
  if (!orgRows[0]) return null
  const organization = toOrganization(orgRows[0])

  const clientRows = await sql`SELECT * FROM clients WHERE user_id = ${userId} LIMIT 1`
  const client = clientRows[0] ? toClient(clientRows[0]) : null
  if (!client) {
    return { user, organization, client: null, policies: [], quotes: [], claims: [] }
  }

  const [policyRows, quoteRows, submissionRows, claimRows] = await Promise.all([
    sql`SELECT * FROM policies WHERE client_id = ${client.id} AND status <> 'cancelled' ORDER BY expiry_date ASC`,
    sql`SELECT * FROM quote_requests WHERE client_id = ${client.id} AND stage NOT IN ('placed','declined') ORDER BY created_at DESC`,
    sql`SELECT s.* FROM quote_submissions s JOIN quote_requests q ON q.id = s.quote_request_id WHERE q.client_id = ${client.id} ORDER BY s.sent_at ASC`,
    sql`SELECT * FROM claims WHERE client_id = ${client.id} ORDER BY notified_at DESC`,
  ])

  const subs = new Map<string, ReturnType<typeof toSubmission>[]>()
  for (const row of submissionRows) {
    const key = String(row.quote_request_id)
    subs.set(key, [...(subs.get(key) ?? []), toSubmission(row)])
  }

  return {
    user,
    organization,
    client,
    policies: policyRows.map(toPolicy),
    quotes: quoteRows.map((row) => toQuoteRequest(row, subs.get(String(row.id)) ?? [])),
    claims: claimRows.map(toClaim),
  }
}

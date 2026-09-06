import { getSql } from '@/lib/db/client'
import { ensureSchema } from '@/lib/db/migrate'
import { toActivity, toClaim, toClient, toClientListRow, toPolicy, toQuoteRequest, toSubmission, toTask } from '@/lib/db/mappers'
import type { ActivityItem, Claim, Client, ClientListRow, Policy, QuoteRequest, SLATask } from '@/types/platform'

export async function listClients(organizationId: string): Promise<ClientListRow[]> {
  await ensureSchema()
  const sql = getSql()
  const rows = await sql`
    SELECT c.*,
      (SELECT count(*) FROM policies p WHERE p.client_id = c.id AND p.status IN ('live','renewal-due')) AS policy_count,
      (SELECT count(*) FROM quote_requests q WHERE q.client_id = c.id AND q.stage IN ('requested','compared','proposed')) AS open_quote_count,
      (SELECT count(*) FROM claims k WHERE k.client_id = c.id AND k.stage NOT IN ('settled','closed')) AS open_claim_count,
      (SELECT min(expiry_date) FROM policies p WHERE p.client_id = c.id AND p.status IN ('live','renewal-due')) AS next_expiry,
      (SELECT coalesce(sum(premium),0) FROM policies p WHERE p.client_id = c.id AND p.status IN ('live','renewal-due')) AS annual_premium
    FROM clients c
    WHERE c.organization_id = ${organizationId}
    ORDER BY c.updated_at DESC, c.name ASC`
  return rows.map(toClientListRow)
}

export interface ClientDetail {
  client: Client
  policies: Policy[]
  quotes: QuoteRequest[]
  claims: Claim[]
  tasks: SLATask[]
  activity: ActivityItem[]
}

export async function getClientDetail(organizationId: string, clientId: string): Promise<ClientDetail | null> {
  await ensureSchema()
  const sql = getSql()
  const clientRows = await sql`SELECT * FROM clients WHERE id = ${clientId} AND organization_id = ${organizationId} LIMIT 1`
  if (!clientRows[0]) return null

  const [policyRows, quoteRows, submissionRows, claimRows, taskRows, activityRows] = await Promise.all([
    sql`SELECT * FROM policies WHERE client_id = ${clientId} ORDER BY expiry_date ASC`,
    sql`SELECT * FROM quote_requests WHERE client_id = ${clientId} ORDER BY created_at DESC`,
    sql`SELECT s.* FROM quote_submissions s JOIN quote_requests q ON q.id = s.quote_request_id WHERE q.client_id = ${clientId} ORDER BY s.sent_at ASC`,
    sql`SELECT * FROM claims WHERE client_id = ${clientId} ORDER BY notified_at DESC`,
    sql`SELECT * FROM tasks WHERE client_id = ${clientId} AND completed_at IS NULL ORDER BY priority DESC`,
    sql`SELECT * FROM activity WHERE client_id = ${clientId} ORDER BY at DESC LIMIT 10`,
  ])

  const submissionsByRequest = new Map<string, ReturnType<typeof toSubmission>[]>()
  for (const row of submissionRows) {
    const key = String(row.quote_request_id)
    const list = submissionsByRequest.get(key) ?? []
    list.push(toSubmission(row))
    submissionsByRequest.set(key, list)
  }

  return {
    client: toClient(clientRows[0]),
    policies: policyRows.map(toPolicy),
    quotes: quoteRows.map((row) => toQuoteRequest(row, submissionsByRequest.get(String(row.id)) ?? [])),
    claims: claimRows.map(toClaim),
    tasks: taskRows.map(toTask),
    activity: activityRows.map(toActivity),
  }
}

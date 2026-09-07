import { getSql } from '@/lib/db/client'
import { toAuditEntry } from '@/lib/db/mappers'
import { newId } from '@/lib/ids'
import type { AuditEntry } from '@/types/platform'

interface AuditInput {
  organizationId: string | null
  actorUserId: string | null
  action: string
  target?: string | null
  detail?: Record<string, unknown>
}

/** Records who did what. Never throws: an audit failure must not break the action it describes. */
export async function audit(input: AuditInput): Promise<void> {
  try {
    const sql = getSql()
    await sql`INSERT INTO audit_log (id, organization_id, actor_user_id, action, target, detail)
      VALUES (${newId('aud')}, ${input.organizationId}, ${input.actorUserId}, ${input.action}, ${input.target ?? null}, ${input.detail ? JSON.stringify(input.detail) : null}::jsonb)`
  } catch (error) {
    console.error('audit failed', error instanceof Error ? error.message : error)
  }
}

export async function listAudit(organizationId: string | null, limit = 50): Promise<AuditEntry[]> {
  const sql = getSql()
  const rows = organizationId
    ? await sql`SELECT * FROM audit_log WHERE organization_id = ${organizationId} ORDER BY at DESC LIMIT ${limit}`
    : await sql`SELECT * FROM audit_log ORDER BY at DESC LIMIT ${limit}`
  return rows.map(toAuditEntry)
}

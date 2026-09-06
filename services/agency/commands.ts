import { getSql } from '@/lib/db/client'
import { ensureSchema } from '@/lib/db/migrate'
import { formatKES, formatShortDate } from '@/lib/format'
import type { CommandResult } from '@/types/platform'
import { JOURNEY_STAGES } from '@/types/platform'

/**
 * Natural-language commands for the agency, answered from the organisation's
 * own data. Deterministic intent matching; no model call.
 */

const SOURCE = 'Answered from your organisation’s records just now.'
const n = (v: unknown) => Number(v ?? 0)

type Intent = 'renewals' | 'outstanding-quotes' | 'claims' | 'find-client' | 'coverage-gap' | 'today' | 'help'

function detect(command: string): { intent: Intent; arg?: string } {
  const c = command.trim()
  const lower = c.toLowerCase()
  const gap = c.match(/\b(?:without|no|missing|lack(?:ing)?)\s+([A-Za-z&\- ]{3,40}?)\s*(?:cover|insurance|policy)?\s*$/i)
  if (gap) return { intent: 'coverage-gap', arg: gap[1].trim() }
  if (/\brenew/.test(lower)) return { intent: 'renewals' }
  if (/\bquotes?\b/.test(lower) && /outstanding|pending|awaiting|waiting|overdue|still/.test(lower)) return { intent: 'outstanding-quotes' }
  if (/\bclaims?\b/.test(lower)) return { intent: 'claims' }
  if (/\btoday\b|\bpriorit|what.*attention/.test(lower)) return { intent: 'today' }
  const named = c.match(/\b(?:for|find|show|open|client|lookup|look up)\s+([A-Z][\w'&.-]*(?:\s+[A-Z&][\w'&.-]*){0,3})/) ?? c.match(/^([A-Z][\w'&.-]*(?:\s+[A-Z&][\w'&.-]*){0,3})$/)
  if (named) return { intent: 'find-client', arg: named[1].trim() }
  if (/\bquotes?\b/.test(lower)) return { intent: 'outstanding-quotes' }
  return { intent: 'help' }
}

export async function runAgencyCommand(organizationId: string, command: string): Promise<CommandResult> {
  await ensureSchema()
  const sql = getSql()
  const { intent, arg } = detect(command)

  switch (intent) {
    case 'renewals': {
      const rows = await sql`SELECT p.product, p.insurer, p.expiry_date, p.premium, c.name, c.id AS client_id FROM policies p JOIN clients c ON c.id = p.client_id
        WHERE p.organization_id = ${organizationId} AND p.status IN ('live','renewal-due') AND p.expiry_date BETWEEN current_date AND current_date + 30 ORDER BY p.expiry_date LIMIT 8`
      return {
        title: rows.length ? `${rows.length} polic${rows.length === 1 ? 'y' : 'ies'} renewing within 30 days` : 'Nothing renews in the next 30 days',
        lines: rows.map((r) => ({ text: `${String(r.name)} · ${String(r.product)} (${String(r.insurer)})`, detail: `${formatShortDate(String(r.expiry_date))} · ${formatKES(n(r.premium))}` })),
        actions: rows.length ? [{ label: 'Open client', href: `/agency/clients/${String(rows[0].client_id)}` }, { label: 'Renewal diary', href: '/agency/renewals' }] : [],
        source: SOURCE,
      }
    }
    case 'outstanding-quotes': {
      const rows = await sql`SELECT s.insurer, s.sent_at, q.reference, q.product, c.name, c.id AS client_id FROM quote_submissions s JOIN quote_requests q ON q.id = s.quote_request_id JOIN clients c ON c.id = q.client_id
        WHERE s.organization_id = ${organizationId} AND s.status IN ('awaiting','clarification') ORDER BY s.sent_at ASC LIMIT 8`
      const pending = await sql`SELECT q.reference, q.product, c.name, c.id AS client_id FROM quote_requests q JOIN clients c ON c.id = q.client_id
        WHERE q.organization_id = ${organizationId} AND q.stage = 'requested' AND NOT EXISTS (SELECT 1 FROM quote_submissions s WHERE s.quote_request_id = q.id) ORDER BY q.created_at ASC LIMIT 5`
      const lines = rows.map((r) => {
        const days = Math.floor((Date.now() - new Date(String(r.sent_at)).getTime()) / 86_400_000)
        return { text: `${String(r.insurer)} · ${String(r.name)} · ${String(r.product)}`, detail: `${days} day${days === 1 ? '' : 's'}${days >= 3 ? ' · past SLA' : ''}` }
      })
      for (const p of pending) lines.push({ text: `${String(p.name)} · ${String(p.product)} (${String(p.reference)})`, detail: 'not yet sent to insurers' })
      return {
        title: lines.length ? `${rows.length} awaiting insurers, ${pending.length} not yet sent` : 'No quotes outstanding',
        lines,
        actions: [{ label: 'Open quotes', href: '/agency/quotes' }],
        source: SOURCE,
      }
    }
    case 'claims': {
      const rows = await sql`SELECT k.reference, k.product, k.insurer, k.stage, k.next_update_due, c.name, c.id AS client_id FROM claims k JOIN clients c ON c.id = k.client_id
        WHERE k.organization_id = ${organizationId} AND k.stage NOT IN ('settled','closed') ORDER BY k.next_update_due NULLS LAST LIMIT 8`
      return {
        title: rows.length ? `${rows.length} open claim${rows.length === 1 ? '' : 's'}` : 'No open claims',
        lines: rows.map((r) => ({ text: `${String(r.name)} · ${String(r.product)} (${String(r.insurer)})`, detail: `${String(r.reference)} · ${String(r.stage)}${r.next_update_due ? ` · update ${formatShortDate(String(r.next_update_due))}` : ''}` })),
        actions: rows.length ? [{ label: 'Open client', href: `/agency/clients/${String(rows[0].client_id)}` }, { label: 'Claims', href: '/agency/claims' }] : [],
        source: SOURCE,
      }
    }
    case 'find-client': {
      const rows = await sql`SELECT c.*, (SELECT count(*) FROM policies p WHERE p.client_id = c.id AND p.status IN ('live','renewal-due')) AS policies,
          (SELECT count(*) FROM quote_requests q WHERE q.client_id = c.id AND q.stage IN ('requested','compared','proposed')) AS quotes,
          (SELECT count(*) FROM claims k WHERE k.client_id = c.id AND k.stage NOT IN ('settled','closed')) AS claims
        FROM clients c WHERE c.organization_id = ${organizationId} AND c.name ILIKE ${'%' + (arg ?? '') + '%'} ORDER BY c.updated_at DESC LIMIT 5`
      if (!rows.length) return { title: `No client matching “${arg}”`, lines: [{ text: 'Try part of the name, or add them as a new lead.' }], actions: [{ label: 'New lead', href: '/agency/clients/new' }], source: SOURCE }
      return {
        title: rows.length === 1 ? String(rows[0].name) : `${rows.length} clients matching “${arg}”`,
        lines: rows.map((r) => {
          const stage = JOURNEY_STAGES.find((s) => s.id === String(r.stage))
          return { text: `${String(r.name)} · stage ${stage?.label ?? String(r.stage)}`, detail: `${n(r.policies)} policies · ${n(r.quotes)} quotes · ${n(r.claims)} claims${r.phone ? ` · +${String(r.phone)}` : ''}` }
        }),
        actions: [{ label: `Open ${String(rows[0].name)}`, href: `/agency/clients/${String(rows[0].id)}` }, { label: 'All clients', href: '/agency/clients' }],
        source: SOURCE,
      }
    }
    case 'coverage-gap': {
      const product = arg ?? ''
      const rows = await sql`SELECT c.id, c.name, c.type FROM clients c WHERE c.organization_id = ${organizationId} AND c.type IN ('sme','corporate')
        AND NOT EXISTS (SELECT 1 FROM policies p WHERE p.client_id = c.id AND p.status IN ('live','renewal-due') AND p.product ILIKE ${'%' + product + '%'}) ORDER BY c.name LIMIT 10`
      return {
        title: rows.length ? `${rows.length} business client${rows.length === 1 ? '' : 's'} without ${product} cover` : `Every business client has ${product} cover`,
        lines: rows.map((r) => ({ text: String(r.name), detail: String(r.type).toUpperCase() })),
        actions: rows.length ? [{ label: `Open ${String(rows[0].name)}`, href: `/agency/clients/${String(rows[0].id)}` }] : [],
        source: SOURCE,
      }
    }
    case 'today': {
      const rows = await sql`SELECT client_name, product, summary, timing FROM tasks WHERE organization_id = ${organizationId} AND completed_at IS NULL ORDER BY priority DESC LIMIT 6`
      return {
        title: rows.length ? `Top ${rows.length} on your queue` : 'Nothing needs attention',
        lines: rows.map((r) => ({ text: `${String(r.client_name)} · ${String(r.product)}`, detail: String(r.timing) })),
        actions: [{ label: 'Today', href: '/agency/today' }],
        source: SOURCE,
      }
    }
    default:
      return {
        title: 'I can answer from your records',
        lines: [
          { text: '“Show clients renewing this month”' },
          { text: '“Which quotes are still outstanding?”' },
          { text: '“Show claims needing attention”' },
          { text: '“Find Mwangi”' },
          { text: '“Clients without WIBA cover”' },
        ],
        actions: [],
        source: SOURCE,
      }
  }
}

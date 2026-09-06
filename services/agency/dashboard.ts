import { getSql } from '@/lib/db/client'
import { ensureSchema } from '@/lib/db/migrate'
import { toActivity, toTask } from '@/lib/db/mappers'
import type {
  DashboardData,
  InsurerActivity,
  InsurerActivityStatus,
  PipelineStage,
  PriorityMetric,
} from '@/types/platform'

const n = (v: unknown) => Number(v ?? 0)

/** Everything the Today page needs, scoped to one organisation. */
export async function getDashboardData(organizationId: string): Promise<DashboardData> {
  await ensureSchema()
  const sql = getSql()

  const [taskRows, activityRows, counts, pipelineRows, submissionRows] = await Promise.all([
    sql`SELECT * FROM tasks WHERE organization_id = ${organizationId} AND completed_at IS NULL ORDER BY priority DESC, created_at ASC LIMIT 25`,
    sql`SELECT * FROM activity WHERE organization_id = ${organizationId} ORDER BY at DESC LIMIT 6`,
    sql`SELECT
          (SELECT count(*) FROM clients WHERE organization_id = ${organizationId} AND stage = 'understand') AS new_leads,
          (SELECT count(*) FROM tasks WHERE organization_id = ${organizationId} AND completed_at IS NULL AND type = 'lead-contact' AND due_today) AS leads_today,
          (SELECT count(*) FROM quote_submissions WHERE organization_id = ${organizationId} AND status = 'awaiting') AS quotes_awaited,
          (SELECT count(*) FROM quote_submissions WHERE organization_id = ${organizationId} AND status = 'awaiting' AND sent_at < now() - interval '3 days') AS quotes_overdue,
          (SELECT count(*) FROM quote_requests WHERE organization_id = ${organizationId} AND stage = 'proposed') AS proposals_out,
          (SELECT coalesce(sum(premium_estimate),0) FROM quote_requests WHERE organization_id = ${organizationId} AND stage = 'proposed') AS proposals_value,
          (SELECT count(*) FROM policies WHERE organization_id = ${organizationId} AND status IN ('live','renewal-due') AND expiry_date <= current_date + 30) AS renewals_30,
          (SELECT count(*) FROM policies WHERE organization_id = ${organizationId} AND status IN ('live','renewal-due') AND expiry_date <= current_date + 7) AS renewals_7,
          (SELECT coalesce(sum(premium),0) FROM policies WHERE organization_id = ${organizationId} AND status IN ('live','renewal-due') AND expiry_date <= current_date + 30) AS renewals_value,
          (SELECT count(*) FROM claims WHERE organization_id = ${organizationId} AND stage NOT IN ('settled','closed')) AS open_claims,
          (SELECT count(*) FROM claims WHERE organization_id = ${organizationId} AND stage NOT IN ('settled','closed') AND next_update_due <= current_date) AS claims_due`,
    sql`SELECT
          (SELECT count(*) FROM clients WHERE organization_id = ${organizationId} AND stage = 'understand') AS leads_count,
          (SELECT coalesce(sum(premium_estimate),0) FROM quote_requests q JOIN clients c ON c.id = q.client_id WHERE q.organization_id = ${organizationId} AND c.stage = 'understand' AND q.stage = 'requested') AS leads_value,
          (SELECT count(*) FROM clients WHERE organization_id = ${organizationId} AND stage = 'solve') AS profiling_count,
          (SELECT count(*) FROM quote_requests WHERE organization_id = ${organizationId} AND stage IN ('requested','compared')) AS quoting_count,
          (SELECT coalesce(sum(premium_estimate),0) FROM quote_requests WHERE organization_id = ${organizationId} AND stage IN ('requested','compared')) AS quoting_value,
          (SELECT count(*) FROM quote_requests WHERE organization_id = ${organizationId} AND stage = 'proposed') AS proposal_count,
          (SELECT coalesce(sum(premium_estimate),0) FROM quote_requests WHERE organization_id = ${organizationId} AND stage = 'proposed') AS proposal_value,
          (SELECT count(*) FROM quote_requests WHERE organization_id = ${organizationId} AND stage IN ('accepted','placed') AND updated_at > now() - interval '60 days') AS won_count,
          (SELECT coalesce(sum(premium_estimate),0) FROM quote_requests WHERE organization_id = ${organizationId} AND stage IN ('accepted','placed') AND updated_at > now() - interval '60 days') AS won_value`,
    sql`SELECT insurer, status, count(*) AS count FROM quote_submissions
        WHERE organization_id = ${organizationId} AND status IN ('awaiting','received','clarification','ready')
        GROUP BY insurer, status`,
  ])

  const c = counts[0] ?? {}
  const p = pipelineRows[0] ?? {}

  const metrics: PriorityMetric[] = [
    {
      id: 'new-leads',
      label: 'New Leads',
      value: n(c.new_leads),
      context: n(c.leads_today) > 0 ? `${n(c.leads_today)} need first contact today` : 'All leads contacted',
      contextTone: n(c.leads_today) > 0 ? 'warning' : 'neutral',
      icon: 'leads',
      taskType: 'lead-contact',
    },
    {
      id: 'quotes-awaited',
      label: 'Quotes Awaited',
      value: n(c.quotes_awaited),
      context: n(c.quotes_overdue) > 0 ? `${n(c.quotes_overdue)} past the 3-day SLA` : 'All within SLA',
      contextTone: n(c.quotes_overdue) > 0 ? 'error' : 'neutral',
      icon: 'quotes',
      taskType: 'quote-follow-up',
    },
    {
      id: 'proposals-out',
      label: 'Proposals Out',
      value: n(c.proposals_out),
      context: n(c.proposals_out) > 0 ? 'Awaiting client decision' : 'None awaiting decision',
      contextTone: 'neutral',
      icon: 'proposals',
      amount: n(c.proposals_value) || undefined,
      taskType: 'proposal',
    },
    {
      id: 'renewals-30d',
      label: 'Renewals ≤ 30d',
      value: n(c.renewals_30),
      context: n(c.renewals_7) > 0 ? `${n(c.renewals_7)} expire within 7 days` : 'None expiring this week',
      contextTone: n(c.renewals_7) > 0 ? 'warning' : 'neutral',
      icon: 'renewals',
      amount: n(c.renewals_value) || undefined,
      taskType: 'renewal',
    },
    {
      id: 'claims-action',
      label: 'Claims Needing Action',
      value: n(c.open_claims),
      context: n(c.claims_due) > 0 ? `${n(c.claims_due)} client update due today` : 'Updates on schedule',
      contextTone: n(c.claims_due) > 0 ? 'warning' : 'neutral',
      icon: 'claims',
      taskType: 'claim-update',
    },
  ]

  const pipeline: PipelineStage[] = [
    { id: 'leads', label: 'Leads', count: n(p.leads_count), value: n(p.leads_value) },
    { id: 'risk-profiling', label: 'Risk profiling', count: n(p.profiling_count), value: 0 },
    { id: 'quoting', label: 'Quoting', count: n(p.quoting_count), value: n(p.quoting_value) },
    { id: 'proposal', label: 'Proposal', count: n(p.proposal_count), value: n(p.proposal_value) },
    { id: 'won', label: 'Won', count: n(p.won_count), value: n(p.won_value) },
  ]

  const insurerActivity = summariseInsurers(
    submissionRows.map((r) => ({ insurer: String(r.insurer), status: String(r.status) as InsurerActivityStatus, count: n(r.count) })),
  )

  return {
    metrics,
    tasks: taskRows.map(toTask),
    pipeline,
    activity: activityRows.map(toActivity),
    insurerActivity,
  }
}

const STATUS_PRIORITY: InsurerActivityStatus[] = ['awaiting', 'clarification', 'received', 'ready']
const STATUS_LABEL: Record<InsurerActivityStatus, (count: number) => string> = {
  awaiting: (c) => `${c} quote${c === 1 ? '' : 's'} awaiting response`,
  clarification: (c) => `${c} clarification${c === 1 ? '' : 's'} requested`,
  received: (c) => `${c} quote${c === 1 ? '' : 's'} received`,
  ready: (c) => `${c} proposal${c === 1 ? '' : 's'} ready`,
}

function summariseInsurers(rows: { insurer: string; status: InsurerActivityStatus; count: number }[]): InsurerActivity[] {
  const byInsurer = new Map<string, { insurer: string; status: InsurerActivityStatus; count: number }[]>()
  for (const row of rows) {
    const list = byInsurer.get(row.insurer) ?? []
    list.push(row)
    byInsurer.set(row.insurer, list)
  }
  const result: InsurerActivity[] = []
  byInsurer.forEach((list, insurer) => {
    const lead = [...list].sort((a, b) => STATUS_PRIORITY.indexOf(a.status) - STATUS_PRIORITY.indexOf(b.status))[0]
    result.push({ insurer, status: lead.status, count: lead.count, summary: STATUS_LABEL[lead.status](lead.count) })
  })
  return result.sort((a, b) => STATUS_PRIORITY.indexOf(a.status) - STATUS_PRIORITY.indexOf(b.status) || b.count - a.count)
}

export async function completeTask(organizationId: string, taskId: string): Promise<void> {
  const sql = getSql()
  await sql`UPDATE tasks SET completed_at = now() WHERE id = ${taskId} AND organization_id = ${organizationId} AND completed_at IS NULL`
}

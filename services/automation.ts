import { getSql } from '@/lib/db/client'
import { ensureSchema } from '@/lib/db/migrate'
import { toPolicy } from '@/lib/db/mappers'
import { daysUntil, formatShortDate } from '@/lib/format'
import { newId } from '@/lib/ids'
import { botNumber } from '@/lib/whatsapp/provider'
import { notify, notifyOrganization } from '@/services/notifications'
import { getOrganization } from '@/services/users'
import type { PublicUser } from '@/types/platform'

/**
 * Everything that should happen without a person remembering to do it.
 * `onClientSignedUp` runs at sign-up; `runDailyAutomation` runs from the cron.
 */

interface SignedUpInput {
  user: PublicUser
  clientId: string
  clientName: string
  protect: string | null
}

export async function onClientSignedUp({ user, clientId, clientName, protect }: SignedUpInput): Promise<void> {
  await ensureSchema()
  const sql = getSql()
  const orgId = user.organizationId ?? 'org_goldoak'
  const org = await getOrganization(orgId)
  const number = botNumber() ?? org?.whatsapp

  await sql`INSERT INTO tasks (id, organization_id, client_id, client_name, type, product, summary, timing, sla, priority, due_today, action_kind, action_label)
    VALUES (${newId('tsk')}, ${orgId}, ${clientId}, ${clientName}, 'lead-contact', 'Risk review',
      ${`${user.name} signed up on the website${clientName !== user.name ? ` for ${clientName}` : ''}.${protect ? ` Wants to protect: ${protect}.` : ''} Book the fact-find within 2 working days.`},
      'Signed up just now', 'on-track', 85, true, 'call', 'Book fact-find')`
  await sql`INSERT INTO activity (id, organization_id, client_id, client_name, kind, title)
    VALUES (${newId('act')}, ${orgId}, ${clientId}, ${clientName}, 'signup', 'New client signed up')`

  await notify({
    organizationId: orgId,
    userId: user.id,
    clientId,
    kind: 'welcome',
    title: `Welcome to ${org?.shortName ?? 'GoldOak'}, ${user.name.split(' ')[0]}`,
    body: [
      'Your account is ready. An adviser will contact you within one working day to start your risk review.',
      number ? `You can do everything from WhatsApp too. Save ${formatIntl(number)} and send: STATUS, POLICIES, QUOTES, CLAIMS, QUOTE (to ask for cover) or CLAIM (to report one).` : '',
    ]
      .filter(Boolean)
      .join('\n\n'),
    reference: `welcome:${user.id}`,
  })

  await notifyOrganization(orgId, {
    clientId,
    kind: 'new-client',
    title: `New client: ${clientName}`,
    body: `${user.name} signed up${user.phone ? ` (${formatIntl(user.phone)})` : ''}.${protect ? ` Wants to protect: ${protect}.` : ''} A fact-find task is on Today.`,
    reference: `new-client:${clientId}`,
  })
}

function formatIntl(digits: string): string {
  return `+${digits}`
}

export interface AutomationSummary {
  renewalReminders: number
  renewalTasks: number
  quoteChasers: number
  claimReminders: number
  policiesMarkedDue: number
}

const RENEWAL_WINDOWS = [30, 14, 7, 1] as const

/** Daily sweep: renewal reminders, quote SLA chasers, claim update reminders. Idempotent per day. */
export async function runDailyAutomation(): Promise<AutomationSummary> {
  await ensureSchema()
  const sql = getSql()
  const summary: AutomationSummary = { renewalReminders: 0, renewalTasks: 0, quoteChasers: 0, claimReminders: 0, policiesMarkedDue: 0 }

  // 1. Policies entering the renewal window.
  const marked = await sql`UPDATE policies SET status = 'renewal-due' WHERE status = 'live' AND expiry_date <= current_date + 30 RETURNING id`
  summary.policiesMarkedDue = marked.length

  const expiring = await sql`SELECT p.*, c.name AS client_name, c.user_id AS client_user_id, c.phone AS client_phone
    FROM policies p JOIN clients c ON c.id = p.client_id
    WHERE p.status IN ('live','renewal-due') AND p.expiry_date BETWEEN current_date AND current_date + 30`
  for (const row of expiring) {
    const policy = toPolicy(row)
    const days = daysUntil(policy.expiryDate)
    const window = RENEWAL_WINDOWS.find((w) => days === w)
    const clientUserId = row.client_user_id ? String(row.client_user_id) : null
    const clientName = String(row.client_name)

    if (window) {
      const n = await notify({
        organizationId: String(row.organization_id),
        userId: clientUserId,
        clientId: policy.clientId,
        kind: 'renewal-reminder',
        title: `${policy.product} renews in ${window} day${window === 1 ? '' : 's'}`,
        body: `${policy.insurer}, policy ${policy.policyNumber}, expires ${formatShortDate(policy.expiryDate)}. Your adviser is reviewing options. Reply ADVISER to talk it through.`,
        reference: `renewal-${window}:${policy.id}`,
        phone: row.client_phone ? String(row.client_phone) : null,
      })
      if (n) summary.renewalReminders++
    }

    // One renewal task per policy per cycle for the agency, opened at 45 days by the review standard.
    if (days <= 45) {
      const ref = `renewal:${policy.id}:${policy.expiryDate.slice(0, 10)}`
      const existing = await sql`SELECT 1 FROM tasks WHERE reference = ${ref} LIMIT 1`
      if (!existing.length) {
        await sql`INSERT INTO tasks (id, organization_id, client_id, client_name, type, insurer, product, summary, timing, sla, priority, due_today, amount, reference, action_kind, action_label)
          VALUES (${newId('tsk')}, ${String(row.organization_id)}, ${policy.clientId}, ${clientName}, 'renewal', ${policy.insurer}, ${policy.product},
            ${`Renewal review report due 45 days before expiry. Ask what changed, remarket if needed.`},
            ${`Renews in ${days} days`}, ${days <= 14 ? 'at-risk' : 'on-track'}, ${days <= 14 ? 88 : 72}, ${days <= 7}, ${policy.premium}, ${ref}, 'send', 'Send review')`
        summary.renewalTasks++
      }
    }
  }

  // 2. Quote submissions past the 3-working-day SLA without an open chaser task.
  const stale = await sql`SELECT s.id, s.insurer, s.sent_at, q.id AS quote_id, q.reference, q.product, q.client_id, q.organization_id, q.premium_estimate, c.name AS client_name
    FROM quote_submissions s JOIN quote_requests q ON q.id = s.quote_request_id JOIN clients c ON c.id = q.client_id
    WHERE s.status = 'awaiting' AND s.sent_at < now() - interval '3 days'`
  for (const row of stale) {
    const ref = `chase:${String(row.id)}`
    const existing = await sql`SELECT 1 FROM tasks WHERE reference = ${ref} AND completed_at IS NULL LIMIT 1`
    if (existing.length) continue
    const age = Math.floor((Date.now() - new Date(String(row.sent_at)).getTime()) / 86_400_000)
    await sql`INSERT INTO tasks (id, organization_id, client_id, client_name, type, insurer, product, summary, timing, sla, priority, due_today, amount, reference, action_kind, action_label)
      VALUES (${newId('tsk')}, ${String(row.organization_id)}, ${String(row.client_id)}, ${String(row.client_name)}, 'quote-follow-up', ${String(row.insurer)}, ${String(row.product)},
        ${`${String(row.insurer)} has not replied to ${String(row.reference)}. Chase the underwriter.`}, ${`${age} days outstanding`}, ${age >= 5 ? 'overdue' : 'at-risk'}, ${age >= 5 ? 94 : 86}, true, ${row.premium_estimate ?? null}, ${ref}, 'follow-up', 'Follow up')`
    summary.quoteChasers++
  }

  // 3. Open claims whose weekly client update is due.
  const claims = await sql`SELECT k.*, c.name AS client_name FROM claims k JOIN clients c ON c.id = k.client_id
    WHERE k.stage NOT IN ('settled','closed') AND k.next_update_due IS NOT NULL AND k.next_update_due <= current_date`
  for (const row of claims) {
    const ref = `claim-update:${String(row.id)}:${new Date().toISOString().slice(0, 10)}`
    const existing = await sql`SELECT 1 FROM tasks WHERE reference = ${ref} LIMIT 1`
    if (existing.length) continue
    await sql`INSERT INTO tasks (id, organization_id, client_id, client_name, type, insurer, product, summary, timing, sla, priority, due_today, amount, reference, action_kind, action_label)
      VALUES (${newId('tsk')}, ${String(row.organization_id)}, ${String(row.client_id)}, ${String(row.client_name)}, 'claim-update', ${String(row.insurer)}, ${String(row.product)},
        ${`Weekly client update due on ${String(row.reference)}. Tell the client where the claim stands, even if nothing changed.`}, 'Update due today', 'at-risk', 90, true, ${row.amount ?? null}, ${ref}, 'update-client', 'Update client')`
    summary.claimReminders++
  }

  return summary
}

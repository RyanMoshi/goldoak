import { getSql } from '@/lib/db/client'
import { ensureSchema } from '@/lib/db/migrate'
import type { Organization } from '@/types/platform'

/**
 * The agency onboarding checklist.
 *
 * A step is "done" when the underlying thing actually exists — a logo really
 * saved, a WhatsApp number really paired, a client really invited — not when
 * someone clicked Next. That means the checklist stays honest if an agency
 * changes its mind later, and a half-finished setup is visible to the agency
 * admin and to the platform operator on the same terms.
 *
 * Steps 1 and 2 (the agency record and its first admin) are complete by the
 * time anyone can sign in, so they are shown as done and not repeated.
 */

export type OnboardingStepId = 'agency' | 'admin' | 'branding' | 'whatsapp' | 'team' | 'clients' | 'assistant' | 'done'

export interface OnboardingStep {
  id: OnboardingStepId
  title: string
  description: string
  href: string
  actionLabel: string
  done: boolean
  optional?: boolean
  /** What the agency gets out of finishing it, in one line. */
  benefit: string
}

export interface OnboardingState {
  steps: OnboardingStep[]
  completed: number
  total: number
  /** True once every non-optional step is done. */
  finished: boolean
  /** The step to nudge next, or null when finished. */
  next: OnboardingStep | null
  dismissed: boolean
}

export async function onboardingState(org: Organization): Promise<OnboardingState> {
  await ensureSchema()
  const sql = getSql()
  const [counts] = await sql`SELECT
      (SELECT count(*) FROM users u JOIN memberships m ON m.user_id = u.id WHERE m.organization_id = ${org.id} AND m.role IN ('agency','agency_admin')) AS staff,
      (SELECT count(*) FROM clients WHERE organization_id = ${org.id}) AS clients,
      (SELECT count(*) FROM whatsapp_channels WHERE organization_id = ${org.id} AND status = 'ready') AS channels`
  const staff = Number(counts?.staff ?? 0)
  const clients = Number(counts?.clients ?? 0)
  const channels = Number(counts?.channels ?? 0)

  const branding = org.branding ?? {}
  const brandingDone = Boolean(branding.primary || branding.logoUrl || branding.supportEmail) && Boolean(org.phone && org.email)
  const ai = org.aiSettings ?? {}
  const assistantDone = Boolean((ai.services ?? '').trim() || (ai.faqs ?? '').trim())
  const flags = org.onboarding ?? {}

  const steps: OnboardingStep[] = [
    {
      id: 'agency',
      title: 'Agency registered',
      description: `${org.name} is on the platform${org.code ? ` with join code ${org.code}` : ''}.`,
      href: '/agency/settings',
      actionLabel: 'Review details',
      benefit: 'Your legal name and contact details appear on every document you send.',
      done: true,
    },
    {
      id: 'admin',
      title: 'Administrator account',
      description: 'Your login is active and your password is your own.',
      href: '/account/password',
      actionLabel: 'Change password',
      benefit: 'Only you can reach your agency’s records.',
      done: true,
    },
    {
      id: 'branding',
      title: 'Branding',
      description: 'Logo, colours and the contact details clients see on emails, PDFs and quotes.',
      href: '/agency/settings',
      actionLabel: brandingDone ? 'Review branding' : 'Add your branding',
      benefit: 'Every email, invoice and quotation goes out looking like your agency, not ours.',
      done: brandingDone,
    },
    {
      id: 'whatsapp',
      title: 'WhatsApp number',
      description: 'Connect the number your clients already message you on.',
      href: '/agency/whatsapp',
      actionLabel: channels > 0 ? 'Manage number' : 'Connect WhatsApp',
      benefit: 'Clients reach your assistant on your own number; conversations stay inside your agency.',
      done: channels > 0,
    },
    {
      id: 'assistant',
      title: 'Assistant knowledge',
      description: 'Tell the assistant what you sell, how you speak and when to fetch a person.',
      href: '/agency/ai',
      actionLabel: assistantDone ? 'Review knowledge' : 'Teach the assistant',
      benefit: 'Answers use your products and your tone instead of generic insurance advice.',
      done: assistantDone,
    },
    {
      id: 'team',
      title: 'Your team',
      description: 'Invite the advisers and support staff who will work in here.',
      href: '/agency/team',
      actionLabel: staff > 1 ? 'Manage team' : 'Invite your team',
      benefit: 'Work is assigned to real people, and every action is attributable.',
      done: staff > 1,
      optional: true,
    },
    {
      id: 'clients',
      title: 'Your clients',
      description: 'Add or invite the clients whose cover you look after.',
      href: '/agency/clients/new',
      actionLabel: clients > 0 ? 'Manage clients' : 'Add your first client',
      benefit: 'Reminders, quotes, invoices and the assistant all work from these records.',
      done: clients > 0,
    },
  ]

  const required = steps.filter((s) => !s.optional)
  const completed = steps.filter((s) => s.done).length
  const finished = required.every((s) => s.done)
  return {
    steps,
    completed,
    total: steps.length,
    finished,
    next: steps.find((s) => !s.done) ?? null,
    dismissed: flags.dismissed === true,
  }
}

/** Hides the checklist from the dashboard; the page itself stays reachable. */
export async function dismissOnboarding(organizationId: string): Promise<void> {
  await ensureSchema()
  const sql = getSql()
  await sql`UPDATE organizations SET onboarding = coalesce(onboarding, '{}'::jsonb) || '{"dismissed": true}'::jsonb WHERE id = ${organizationId}`
}

export async function restoreOnboarding(organizationId: string): Promise<void> {
  const sql = getSql()
  await sql`UPDATE organizations SET onboarding = coalesce(onboarding, '{}'::jsonb) || '{"dismissed": false}'::jsonb WHERE id = ${organizationId}`
}

/** Platform view: how far every agency has got. */
export interface AgencyProgress {
  organizationId: string
  name: string
  status: string
  completed: number
  total: number
  finished: boolean
  missing: string[]
}

export async function allAgencyProgress(orgs: Organization[]): Promise<AgencyProgress[]> {
  const out: AgencyProgress[] = []
  for (const org of orgs) {
    const state = await onboardingState(org)
    out.push({
      organizationId: org.id,
      name: org.name,
      status: org.status,
      completed: state.completed,
      total: state.total,
      finished: state.finished,
      missing: state.steps.filter((s) => !s.done).map((s) => s.title),
    })
  }
  return out
}

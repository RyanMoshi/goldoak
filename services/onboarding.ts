import { generateTempPassword, hashPassword } from '@/lib/auth/password'
import { getSql } from '@/lib/db/client'
import { ensureSchema } from '@/lib/db/migrate'
import { newId } from '@/lib/ids'
import { sendWhatsApp } from '@/lib/whatsapp/provider'
import { audit } from '@/services/audit'
import { sendTemplateEmail } from '@/services/emails'
import { ensureMembership, getMembership, setMembershipRole } from '@/services/memberships'
import { notify } from '@/services/notifications'
import { attachExistingUserAsClient, createClientUser, createStaffUser, findUserByEmail, getOrganization, setTemporaryPassword } from '@/services/users'
import type { Organization, PublicUser } from '@/types/platform'

/**
 * Onboarding people into an agency. One place for "create the account, give it
 * a temporary password, tell the person how to get in", used by the agency
 * dashboard, the super admin and the seed. Passwords are never stored in
 * clear text; they travel once, in the invitation, and must be changed at
 * first sign-in.
 */

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://goldoak.vercel.app'

export interface InviteClientInput {
  organizationId: string
  actor: { id: string; name: string }
  name: string
  type: 'individual' | 'sme' | 'corporate'
  phone: string | null
  email: string | null
  notes: string | null
  message?: string | null
  /** Create the login and send the invitation; false = record only (a lead). */
  invite: boolean
}

export interface InviteClientResult {
  clientId: string
  userId: string | null
  /** 'new' = fresh login with a temporary password; 'existing' = platform identity added to this agency; 'lead' = no login. */
  mode: 'new' | 'existing' | 'lead'
  emailed: boolean
  messaged: boolean
}

export async function inviteClient(input: InviteClientInput): Promise<InviteClientResult> {
  await ensureSchema()
  const sql = getSql()
  const org = await getOrganization(input.organizationId)
  if (!org) throw new Error('Organisation not found')
  const email = input.email?.trim().toLowerCase() || null

  // A lead without a login.
  if (!input.invite || !email) {
    const clientId = newId('cli')
    await sql`INSERT INTO clients (id, organization_id, name, type, phone, email, stage, adviser_name, notes)
      VALUES (${clientId}, ${input.organizationId}, ${input.name}, ${input.type}, ${input.phone}, ${email}, 'understand', ${input.actor.name}, ${input.notes})`
    await sql`INSERT INTO tasks (id, organization_id, client_id, client_name, type, product, summary, timing, sla, priority, due_today, action_kind, action_label)
      VALUES (${newId('tsk')}, ${input.organizationId}, ${clientId}, ${input.name}, 'lead-contact', 'Risk review', ${`New lead added by ${input.actor.name}. Book the fact-find.`}, 'Added just now', 'on-track', 70, true, 'call', 'Book fact-find')`
    await sql`INSERT INTO activity (id, organization_id, client_id, client_name, kind, title) VALUES (${newId('act')}, ${input.organizationId}, ${clientId}, ${input.name}, 'signup', ${`Lead added by ${input.actor.name}`})`
    await audit({ organizationId: input.organizationId, actorUserId: input.actor.id, action: 'client.created', target: clientId, detail: { mode: 'lead' } })
    return { clientId, userId: null, mode: 'lead', emailed: false, messaged: false }
  }

  const existing = await findUserByEmail(email)
  let clientId: string
  let userId: string
  let mode: InviteClientResult['mode']
  let tempPassword: string | null = null

  if (existing) {
    // Same identity, new agency relationship. Their other agencies never see this record.
    if (existing.role === 'admin') throw new Error('That email belongs to the platform administrator.')
    clientId = await attachExistingUserAsClient({ userId: existing.id, organizationId: input.organizationId, name: input.name, clientType: input.type, phone: input.phone ?? existing.phone, email, notes: input.notes, invitedBy: input.actor.id })
    userId = existing.id
    mode = 'existing'
  } else {
    if (input.phone) {
      const phoneTaken = await sql`SELECT id FROM users WHERE phone = ${input.phone} LIMIT 1`
      if (phoneTaken[0]) {
        clientId = await attachExistingUserAsClient({ userId: String(phoneTaken[0].id), organizationId: input.organizationId, name: input.name, clientType: input.type, phone: input.phone, email, notes: input.notes, invitedBy: input.actor.id })
        userId = String(phoneTaken[0].id)
        mode = 'existing'
      } else {
        tempPassword = generateTempPassword()
        const created = await createClientUser({ organizationId: input.organizationId, name: input.name, email, phone: input.phone, passwordHash: await hashPassword(tempPassword), businessName: input.type === 'individual' ? null : input.name, clientType: input.type, notes: input.notes, temporaryPassword: true, invitedBy: input.actor.id })
        clientId = created.clientId
        userId = created.user.id
        mode = 'new'
      }
    } else {
      tempPassword = generateTempPassword()
      const created = await createClientUser({ organizationId: input.organizationId, name: input.name, email, phone: null, passwordHash: await hashPassword(tempPassword), businessName: input.type === 'individual' ? null : input.name, clientType: input.type, notes: input.notes, temporaryPassword: true, invitedBy: input.actor.id })
      clientId = created.clientId
      userId = created.user.id
      mode = 'new'
    }
  }
  await sql`UPDATE clients SET adviser_name = COALESCE(adviser_name, ${input.actor.name}) WHERE id = ${clientId}`
  await sql`INSERT INTO tasks (id, organization_id, client_id, client_name, type, product, summary, timing, sla, priority, due_today, action_kind, action_label)
    VALUES (${newId('tsk')}, ${input.organizationId}, ${clientId}, ${input.name}, 'lead-contact', 'Risk review', ${`${input.name} was invited by ${input.actor.name}. Book the fact-find once they sign in.`}, 'Invited just now', 'on-track', 70, true, 'call', 'Book fact-find')`
  await sql`INSERT INTO activity (id, organization_id, client_id, client_name, kind, title) VALUES (${newId('act')}, ${input.organizationId}, ${clientId}, ${input.name}, 'signup', ${`Invited by ${input.actor.name}`})`

  const first = input.name.split(' ')[0]
  const emailOutcome = await sendTemplateEmail({
    key: 'invitation',
    to: email,
    organizationId: input.organizationId,
    userId,
    clientId,
    vars: { first_name: first, agent_name: input.actor.name, email, temporary_password: tempPassword ?? '', login_url: `${SITE}/signin?as=client`, message: input.message ?? '' },
    category: 'account',
    relatedType: 'client',
    relatedId: clientId,
  })
  let messaged = false
  if (input.phone) {
    const text = tempPassword
      ? `*${org.name}* has set up your Super Agent account.\n\nSign in at ${SITE}/signin\nUsername: ${email}\nTemporary password: ${tempPassword}\n\nYou will choose your own password the first time you sign in. Reply MENU here any time for help.`
      : `*${org.name}* has added you to their agency on Super Agent. Sign in at ${SITE}/signin with your usual password; ${org.shortName} now appears in your list of agencies. Reply MENU here any time.`
    messaged = await sendWhatsApp(input.phone, text, input.organizationId)
    await sql`UPDATE whatsapp_contacts SET organization_id = ${input.organizationId}, user_id = ${userId}, updated_at = now() WHERE phone = ${input.phone}`
  }
  await notify({ organizationId: input.organizationId, userId, clientId, kind: 'welcome', title: `Welcome to ${org.shortName}`, body: `${input.actor.name} set up your account. Everything about your cover lives here and on WhatsApp.`, reference: `invite:${clientId}`, inAppOnly: true })
  await audit({ organizationId: input.organizationId, actorUserId: input.actor.id, action: 'client.invited', target: clientId, detail: { mode, emailed: emailOutcome, messaged } })
  return { clientId, userId, mode, emailed: emailOutcome === 'queued' || emailOutcome === 'sent', messaged }
}

export interface InviteStaffInput {
  organizationId: string
  actor: { id: string; name: string } | null
  name: string
  email: string
  phone: string | null
  title: string | null
  role: 'agency_admin' | 'agency' | 'admin'
}

export interface InviteStaffResult {
  user: PublicUser
  /** Returned once so the inviter can pass it on privately if email fails. Null when an existing identity was attached. */
  temporaryPassword: string | null
  emailed: boolean
  /** True when the email already had a Super Agent identity and was added to this agency instead of created. */
  attached: boolean
}

const ROLE_LABEL: Record<InviteStaffInput['role'], string> = { agency_admin: 'agency admin', agency: 'agency staff', admin: 'platform administrator' }

/**
 * Same email, another agency: the identity is reused and a membership is added
 * (or its role updated) for this agency. The person keeps their password and
 * is told by email and WhatsApp. Platform administrators are never attached.
 */
async function attachExistingStaff(existing: PublicUser, input: InviteStaffInput): Promise<InviteStaffResult> {
  if (existing.role === 'admin' || input.role === 'admin') throw new Error('Platform administrators cannot be attached to an agency')
  const org = await getOrganization(input.organizationId)
  if (!org) throw new Error('Agency not found')
  const current = await getMembership(existing.id, input.organizationId)
  if (current) await setMembershipRole(existing.id, input.organizationId, input.role)
  else await ensureMembership({ userId: existing.id, organizationId: input.organizationId, role: input.role, invitedBy: input.actor?.id ?? null })
  const body = `${input.actor?.name ?? 'The platform'} has added you to ${org.name} on Super Agent as ${ROLE_LABEL[input.role]}. Sign in with your existing email and password; if several agencies are on your account you will be asked which one to open. Forgotten your password? Use "Forgot your password?" on the sign-in page.`
  const outcome = await sendTemplateEmail({ key: 'staff-notification', to: existing.email, organizationId: input.organizationId, userId: existing.id, vars: { first_name: existing.name.split(' ')[0], title: `You have been added to ${org.name}`, body, action_url: `${SITE}/signin?as=agency` }, category: 'security', relatedType: 'user', relatedId: existing.id })
  const phone = input.phone ?? existing.phone
  if (phone) await sendWhatsApp(phone, `You have been added to ${org.name} on Super Agent as ${ROLE_LABEL[input.role]}. Sign in with your existing password at ${SITE}/signin?as=agency`, input.organizationId).catch(() => null)
  await audit({ organizationId: input.organizationId, actorUserId: input.actor?.id ?? null, action: 'user.attached', target: existing.id, detail: { role: input.role, previousRole: current?.role ?? null, emailed: outcome } })
  return { user: existing, temporaryPassword: null, emailed: outcome === 'queued' || outcome === 'sent', attached: true }
}

export async function inviteStaff(input: InviteStaffInput): Promise<InviteStaffResult> {
  const existing = await findUserByEmail(input.email.toLowerCase())
  if (existing) return attachExistingStaff(existing, input)
  const temporaryPassword = generateTempPassword()
  const user = await createStaffUser({ role: input.role, organizationId: input.organizationId, name: input.name, email: input.email.toLowerCase(), phone: input.phone, title: input.title, passwordHash: await hashPassword(temporaryPassword), createdBy: input.actor?.id ?? null, temporaryPassword: true })
  const org = input.role === 'admin' ? null : await getOrganization(input.organizationId)
  const roleLabel = input.role === 'agency_admin' ? 'agency admin' : input.role === 'agency' ? 'agency staff' : 'platform administrator'
  const outcome = await sendTemplateEmail({ key: 'temp-password', to: user.email, organizationId: input.role === 'admin' ? null : input.organizationId, userId: user.id, vars: { first_name: user.name.split(' ')[0], email: user.email, temporary_password: temporaryPassword, login_url: `${SITE}/signin?as=agency`, role_label: `${roleLabel}${org ? ` at ${org.name}` : ''}` }, category: 'security', relatedType: 'user', relatedId: user.id })
  if (input.phone) await sendWhatsApp(input.phone, `Your Super Agent login is ready.\nUsername: ${user.email}\nTemporary password: ${temporaryPassword}\nSign in at ${SITE}/signin?as=agency and choose your own password.`, input.role === 'admin' ? null : input.organizationId).catch(() => null)
  await audit({ organizationId: input.role === 'admin' ? null : input.organizationId, actorUserId: input.actor?.id ?? null, action: 'user.invited', target: user.id, detail: { role: input.role, emailed: outcome } })
  return { user, temporaryPassword, emailed: outcome === 'queued' || outcome === 'sent', attached: false }
}

/** Issues a new temporary password (admin-triggered reset) and emails it. */
export async function resetToTemporaryPassword(user: PublicUser, actor: { id: string; name: string }, organizationId: string | null): Promise<{ temporaryPassword: string; emailed: boolean }> {
  const temporaryPassword = generateTempPassword()
  await setTemporaryPassword(user.id, await hashPassword(temporaryPassword))
  const outcome = await sendTemplateEmail({ key: 'temp-password', to: user.email, organizationId, userId: user.id, vars: { first_name: user.name.split(' ')[0], email: user.email, temporary_password: temporaryPassword, login_url: `${SITE}/signin`, role_label: '' }, category: 'security', relatedType: 'user', relatedId: user.id })
  await audit({ organizationId, actorUserId: actor.id, action: 'user.password-reset-by-admin', target: user.id, detail: { emailed: outcome } })
  return { temporaryPassword, emailed: outcome === 'queued' || outcome === 'sent' }
}

/** After approval: tell every agency admin, by email and in-app. */
export async function announceApproval(org: Organization): Promise<void> {
  const sql = getSql()
  const admins = await sql`SELECT u.id, u.email, u.name FROM users u JOIN memberships m ON m.user_id = u.id WHERE m.organization_id = ${org.id} AND m.role = 'agency_admin' AND u.active`
  for (const a of admins) {
    await notify({ organizationId: org.id, userId: String(a.id), kind: 'welcome', title: `${org.name} is approved`, body: 'Your agency is live on Super Agent. Connect your WhatsApp number, set your branding and invite your team.', reference: `org-approved:${org.id}:${String(a.id)}`, inAppOnly: true })
    await sendTemplateEmail({ key: 'agency-approved', to: String(a.email), organizationId: org.id, userId: String(a.id), vars: { first_name: String(a.name).split(' ')[0], agency_name: org.name, login_url: `${SITE}/signin?as=agency` }, category: 'account' })
  }
}

export { ensureMembership }

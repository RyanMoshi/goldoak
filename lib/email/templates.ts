import type { Branding } from '@/lib/email/branding'
import type { Block, EmailContent } from '@/lib/email/layout'

/**
 * The template registry. Every template is a function of variables and the
 * agency brand, so the same email reads as GoldOak's for GoldOak and as
 * Literal Insurance Agency's for Literal. Subjects, headings and intros can be
 * overridden per agency from the dashboard (`email_templates`); the structure,
 * codes and links cannot, which keeps security-critical emails intact.
 */

export type EmailCategory = 'security' | 'account' | 'reminders' | 'updates' | 'marketing' | 'system'

/** Categories a person may switch off. Security, account and system emails always go out. */
export const OPTIONAL_CATEGORIES: EmailCategory[] = ['reminders', 'updates', 'marketing']

export type Vars = Record<string, string | number | null | undefined>

export interface TemplateDefinition {
  key: string
  label: string
  category: EmailCategory
  /** Variables the template understands; shown to admins who customise it. */
  variables: string[]
  subject: (v: Vars, b: Branding) => string
  content: (v: Vars, b: Branding) => EmailContent
  /** What an agency may customise. */
  customisable: ('subject' | 'heading' | 'body')[]
}

const s = (v: Vars, k: string, fallback = ''): string => (v[k] == null || v[k] === '' ? fallback : String(v[k]))

const securityNote = 'For your security we never ask for your password by email or phone. If you did not expect this email, contact us using the details below.'

export const TEMPLATES: Record<string, TemplateDefinition> = {
  welcome: {
    key: 'welcome',
    label: 'Welcome',
    category: 'account',
    variables: ['first_name', 'agency_name', 'login_url', 'agent_name'],
    customisable: ['subject', 'heading', 'body'],
    subject: (v, b) => `Welcome to ${b.name}, ${s(v, 'first_name', 'there')}`,
    content: (v, b) => ({
      preheader: `Your ${b.shortName} account is ready.`,
      heading: `Welcome to ${b.name}`,
      greeting: `Hello ${s(v, 'first_name', 'there')},`,
      blocks: [
        { type: 'paragraph', text: s(v, 'body', `Your account is ready. From today you can follow every quote, policy, renewal and claim in one place, ask our assistant anything about your cover, and reach ${s(v, 'agent_name', 'your adviser')} whenever you need to.`) },
        { type: 'list', items: ['See where things stand at a glance', 'Ask for cover or report a claim in two taps', 'Upload documents and get them read automatically', 'Use WhatsApp for all of it, any time'] },
      ],
      cta: { label: 'Open my account', url: s(v, 'login_url') },
      securityNote,
    }),
  },
  'temp-password': {
    key: 'temp-password',
    label: 'Temporary password',
    category: 'security',
    variables: ['first_name', 'email', 'temporary_password', 'login_url', 'agency_name', 'role_label'],
    customisable: ['heading', 'body'],
    subject: (v, b) => `Your ${b.shortName} login details`,
    content: (v, b) => ({
      preheader: 'Your temporary password. You will choose your own at first sign-in.',
      heading: s(v, 'heading', `Your ${b.shortName} login`),
      greeting: `Hello ${s(v, 'first_name', 'there')},`,
      blocks: [
        { type: 'paragraph', text: s(v, 'body', `An account has been created for you${s(v, 'role_label') ? ` as ${s(v, 'role_label')}` : ''} at ${b.name}. Use the details below to sign in for the first time.`) },
        { type: 'details', rows: [['Username', s(v, 'email')], ['Temporary password', s(v, 'temporary_password')]] },
        { type: 'notice', tone: 'warning', text: '**This password works once.** As soon as you sign in you will be asked to create your own password; the temporary one stops working after that.' },
      ],
      cta: { label: 'Sign in now', url: s(v, 'login_url') },
      securityNote,
    }),
  },
  invitation: {
    key: 'invitation',
    label: 'Client invitation',
    category: 'account',
    variables: ['first_name', 'agency_name', 'agent_name', 'email', 'temporary_password', 'login_url', 'message'],
    customisable: ['subject', 'heading', 'body'],
    subject: (v, b) => `${b.name} has set up your insurance account`,
    content: (v, b) => {
      const blocks: Block[] = [{ type: 'paragraph', text: s(v, 'body', `${s(v, 'agent_name', 'Your adviser')} at ${b.name} has set up a Super Agent account for you. It is where your policies, quotes, claims and documents live, and where you can reach us any time.`) }]
      if (s(v, 'message')) blocks.push({ type: 'notice', text: s(v, 'message') })
      if (s(v, 'temporary_password')) {
        blocks.push({ type: 'details', rows: [['Username', s(v, 'email')], ['Temporary password', s(v, 'temporary_password')]] })
        blocks.push({ type: 'notice', tone: 'warning', text: 'You will choose your own password the first time you sign in.' })
      } else {
        blocks.push({ type: 'paragraph', text: `You already have a Super Agent login (${s(v, 'email')}). Sign in with your usual password; ${b.name} now appears in your list of agencies.` })
      }
      return { preheader: `${b.name} has invited you.`, heading: s(v, 'heading', `You have been invited by ${b.name}`), greeting: `Hello ${s(v, 'first_name', 'there')},`, blocks, cta: { label: 'Activate my account', url: s(v, 'login_url') }, securityNote }
    },
  },
  otp: {
    key: 'otp',
    label: 'Verification code',
    category: 'security',
    variables: ['first_name', 'otp_code', 'expires_in', 'purpose_label'],
    customisable: [],
    subject: (v, b) => `${s(v, 'otp_code')} is your ${b.shortName} verification code`,
    content: (v) => ({
      preheader: `Your code is ${s(v, 'otp_code')}. It expires in ${s(v, 'expires_in', '10 minutes')}.`,
      heading: s(v, 'purpose_label', 'Verify your email'),
      greeting: `Hello ${s(v, 'first_name', 'there')},`,
      blocks: [
        { type: 'paragraph', text: 'Enter this code to continue. It is for you only.' },
        { type: 'code', value: s(v, 'otp_code'), caption: `Expires in ${s(v, 'expires_in', '10 minutes')}` },
        { type: 'notice', tone: 'warning', text: 'Never share this code. Our staff will never ask you for it.' },
      ],
      closing: 'If you did not request this code, you can ignore this email; nothing changes on your account.',
    }),
  },
  'password-reset': {
    key: 'password-reset',
    label: 'Password reset',
    category: 'security',
    variables: ['first_name', 'reset_url', 'expires_in'],
    customisable: [],
    subject: (_v, b) => `Reset your ${b.shortName} password`,
    content: (v) => ({
      preheader: 'A password reset was requested for your account.',
      heading: 'Reset your password',
      greeting: `Hello ${s(v, 'first_name', 'there')},`,
      blocks: [
        { type: 'paragraph', text: `Someone asked to reset the password for this account. If it was you, use the button below within ${s(v, 'expires_in', '1 hour')}.` },
        { type: 'notice', tone: 'warning', text: 'If it was not you, ignore this email. Your password stays as it is and no one can change it without this link.' },
      ],
      cta: { label: 'Choose a new password', url: s(v, 'reset_url') },
      securityNote,
    }),
  },
  'security-login': {
    key: 'security-login',
    label: 'New sign-in alert',
    category: 'security',
    variables: ['first_name', 'login_time', 'ip', 'device'],
    customisable: [],
    subject: (_v, b) => `New sign-in to your ${b.shortName} account`,
    content: (v) => ({
      preheader: 'A new sign-in to your account.',
      heading: 'New sign-in',
      greeting: `Hello ${s(v, 'first_name', 'there')},`,
      blocks: [
        { type: 'paragraph', text: 'Your account was just signed in to. If this was you, there is nothing to do.' },
        { type: 'details', rows: [['When', s(v, 'login_time')], ['Network', s(v, 'ip', 'unknown')], ['Device', s(v, 'device', 'unknown').slice(0, 80)]] },
        { type: 'notice', tone: 'warning', text: "If this wasn't you, reset your password straight away and tell us." },
      ],
      securityNote,
    }),
  },
  'security-password-changed': {
    key: 'security-password-changed',
    label: 'Password changed',
    category: 'security',
    variables: ['first_name'],
    customisable: [],
    subject: (_v, b) => `Your ${b.shortName} password was changed`,
    content: (v) => ({
      preheader: 'Your password was changed.',
      heading: 'Password changed',
      greeting: `Hello ${s(v, 'first_name', 'there')},`,
      blocks: [
        { type: 'paragraph', text: 'The password on your account was changed just now. Any temporary password no longer works.' },
        { type: 'notice', tone: 'warning', text: "If you did not do this, contact us immediately using the details below so we can secure your account." },
      ],
      securityNote,
    }),
  },
  'security-email-changed': {
    key: 'security-email-changed',
    label: 'Email address changed',
    category: 'security',
    variables: ['first_name', 'new_email'],
    customisable: [],
    subject: (_v, b) => `Your ${b.shortName} email address was changed`,
    content: (v) => ({
      preheader: 'The email on your account was changed.',
      heading: 'Email address changed',
      greeting: `Hello ${s(v, 'first_name', 'there')},`,
      blocks: [{ type: 'paragraph', text: `The email address on your account is now **${s(v, 'new_email')}**. Future emails go there.` }, { type: 'notice', tone: 'warning', text: 'If you did not make this change, contact us immediately.' }],
      securityNote,
    }),
  },
  'agency-registered': {
    key: 'agency-registered',
    label: 'Agency registration received',
    category: 'account',
    variables: ['first_name', 'agency_name', 'join_code', 'login_url'],
    customisable: [],
    subject: (v) => `${s(v, 'agency_name')} is registered on Super Agent`,
    content: (v) => ({
      preheader: 'We received your agency registration.',
      heading: 'Registration received',
      greeting: `Hello ${s(v, 'first_name', 'there')},`,
      blocks: [
        { type: 'paragraph', text: `Thank you for registering **${s(v, 'agency_name')}**. The platform team is reviewing it; approval usually takes one working day. Meanwhile you can sign in, complete your profile and branding, and invite your team.` },
        { type: 'details', rows: [['Agency', s(v, 'agency_name')], ['WhatsApp join code', s(v, 'join_code')]] },
        { type: 'list', items: ['Complete your agency profile and branding', 'Invite your staff', 'Connect your WhatsApp number', 'Start onboarding clients as soon as you are approved'] },
      ],
      cta: { label: 'Open my agency workspace', url: s(v, 'login_url') },
    }),
  },
  'agency-approved': {
    key: 'agency-approved',
    label: 'Agency approved',
    category: 'account',
    variables: ['first_name', 'agency_name', 'login_url'],
    customisable: [],
    subject: (v) => `${s(v, 'agency_name')} is live on Super Agent`,
    content: (v) => ({
      preheader: 'Your agency has been approved.',
      heading: 'You are live',
      greeting: `Hello ${s(v, 'first_name', 'there')},`,
      blocks: [{ type: 'paragraph', text: `**${s(v, 'agency_name')}** has been approved. Clients can now reach you on WhatsApp with your join code, sign up with your link, and your assistant answers in your name.` }],
      cta: { label: 'Go to my dashboard', url: s(v, 'login_url') },
    }),
  },
  'admin-alert': {
    key: 'admin-alert',
    label: 'Platform admin alert',
    category: 'system',
    variables: ['first_name', 'title', 'body', 'action_url'],
    customisable: [],
    subject: (v) => `[Super Agent] ${s(v, 'title')}`,
    content: (v) => ({ preheader: s(v, 'title'), heading: s(v, 'title'), greeting: `Hello ${s(v, 'first_name', 'there')},`, blocks: [{ type: 'paragraph', text: s(v, 'body') }], cta: s(v, 'action_url') ? { label: 'Open the platform', url: s(v, 'action_url') } : undefined }),
  },
  'renewal-reminder': {
    key: 'renewal-reminder',
    label: 'Policy renewal reminder',
    category: 'reminders',
    variables: ['first_name', 'policy_name', 'policy_number', 'insurer', 'renewal_date', 'days_left', 'premium', 'dashboard_url', 'agent_name', 'support_phone'],
    customisable: ['subject', 'heading', 'body'],
    subject: (v) => `${s(v, 'policy_name')} renews in ${s(v, 'days_left')} day${s(v, 'days_left') === '1' ? '' : 's'}`,
    content: (v, b) => ({
      preheader: `Your ${s(v, 'policy_name')} policy renews on ${s(v, 'renewal_date')}.`,
      heading: s(v, 'heading', 'Your renewal is coming up'),
      greeting: `Hello ${s(v, 'first_name', 'there')},`,
      blocks: [
        { type: 'paragraph', text: s(v, 'body', `Your ${s(v, 'policy_name')} cover with ${s(v, 'insurer')} is due for renewal in **${s(v, 'days_left')} day${s(v, 'days_left') === '1' ? '' : 's'}**. ${s(v, 'agent_name', 'Your adviser')} is reviewing the options so nothing lapses.`) },
        { type: 'details', rows: [['Policy', `${s(v, 'policy_name')} · ${s(v, 'policy_number')}`], ['Insurer', s(v, 'insurer')], ['Renewal date', s(v, 'renewal_date')], ['Current premium', s(v, 'premium')]] },
        { type: 'paragraph', text: `Anything changed since last year: new vehicle, more staff, a move? Tell us and we will reflect it in the renewal terms. Call ${b.supportPhone || 'us'} or reply on WhatsApp.` },
      ],
      cta: { label: 'Review my renewal', url: s(v, 'dashboard_url') },
    }),
  },
  'payment-reminder': {
    key: 'payment-reminder',
    label: 'Payment reminder',
    category: 'reminders',
    variables: ['first_name', 'policy_name', 'policy_number', 'amount', 'due_date', 'status', 'dashboard_url', 'support_phone'],
    customisable: ['subject', 'heading', 'body'],
    subject: (v) => (s(v, 'status') === 'overdue' ? `Payment overdue: ${s(v, 'policy_name')}` : `Payment due ${s(v, 'due_date')}: ${s(v, 'policy_name')}`),
    content: (v, b) => ({
      preheader: `${s(v, 'amount')} ${s(v, 'status') === 'overdue' ? 'is overdue' : `is due on ${s(v, 'due_date')}`}.`,
      heading: s(v, 'heading', s(v, 'status') === 'overdue' ? 'A payment is overdue' : 'A payment is coming up'),
      greeting: `Hello ${s(v, 'first_name', 'there')},`,
      blocks: [
        { type: 'paragraph', text: s(v, 'body', `A premium payment for your ${s(v, 'policy_name')} cover ${s(v, 'status') === 'overdue' ? 'was due and has not reached the insurer yet. Cover can lapse if it stays unpaid.' : `is due on ${s(v, 'due_date')}.`}`) },
        { type: 'details', rows: [['Policy', `${s(v, 'policy_name')} · ${s(v, 'policy_number')}`], ['Amount', s(v, 'amount')], ['Due date', s(v, 'due_date')]] },
        { type: 'paragraph', text: `Already paid? Reply with the receipt on WhatsApp or upload it in your account and we will match it. Questions: ${b.supportPhone || b.supportEmail}.` },
      ],
      cta: { label: 'View payment details', url: s(v, 'dashboard_url') },
    }),
  },
  'appointment-reminder': {
    key: 'appointment-reminder',
    label: 'Appointment reminder',
    category: 'reminders',
    variables: ['first_name', 'when', 'where', 'agent_name', 'purpose', 'dashboard_url'],
    customisable: ['subject', 'heading', 'body'],
    subject: (v) => `Reminder: ${s(v, 'purpose', 'your appointment')} on ${s(v, 'when')}`,
    content: (v) => ({
      preheader: `${s(v, 'purpose', 'Appointment')} with ${s(v, 'agent_name')} on ${s(v, 'when')}.`,
      heading: s(v, 'heading', 'A reminder about your appointment'),
      greeting: `Hello ${s(v, 'first_name', 'there')},`,
      blocks: [
        { type: 'paragraph', text: s(v, 'body', `This is a reminder of your ${s(v, 'purpose', 'appointment')} with ${s(v, 'agent_name', 'your adviser')}.`) },
        { type: 'details', rows: [['When', s(v, 'when')], ['Where', s(v, 'where', 'Phone or WhatsApp')], ['With', s(v, 'agent_name', 'Your adviser')]] },
        { type: 'paragraph', text: 'Need to move it? Reply to this email or message us on WhatsApp.' },
      ],
      cta: s(v, 'dashboard_url') ? { label: 'Open my account', url: s(v, 'dashboard_url') } : undefined,
    }),
  },
  'claim-update': {
    key: 'claim-update',
    label: 'Claim update',
    category: 'updates',
    variables: ['first_name', 'claim_reference', 'policy_name', 'insurer', 'stage', 'note', 'dashboard_url'],
    customisable: ['subject', 'heading'],
    subject: (v) => `Claim ${s(v, 'claim_reference')}: ${s(v, 'stage')}`,
    content: (v) => ({
      preheader: `Your claim ${s(v, 'claim_reference')} is now ${s(v, 'stage')}.`,
      heading: s(v, 'heading', 'An update on your claim'),
      greeting: `Hello ${s(v, 'first_name', 'there')},`,
      blocks: [
        { type: 'details', rows: [['Claim', s(v, 'claim_reference')], ['Cover', `${s(v, 'policy_name')} · ${s(v, 'insurer')}`], ['Stage', s(v, 'stage')]] },
        ...(s(v, 'note') ? [{ type: 'notice' as const, text: s(v, 'note') }] : []),
        { type: 'paragraph', text: 'We update you at least weekly until the claim is settled, even when nothing has changed.' },
      ],
      cta: { label: 'See my claim', url: s(v, 'dashboard_url') },
    }),
  },
  'document-received': {
    key: 'document-received',
    label: 'Document received',
    category: 'updates',
    variables: ['first_name', 'document_name', 'document_type', 'summary', 'dashboard_url'],
    customisable: ['subject', 'heading'],
    subject: (v) => `We received your ${s(v, 'document_type', 'document')}`,
    content: (v) => ({
      preheader: `${s(v, 'document_name')} is on your file.`,
      heading: s(v, 'heading', 'Document received'),
      greeting: `Hello ${s(v, 'first_name', 'there')},`,
      blocks: [{ type: 'paragraph', text: `**${s(v, 'document_name')}** has been added to your file.${s(v, 'summary') ? ` Here is what we read from it: ${s(v, 'summary')}` : ''}` }],
      cta: { label: 'Check my documents', url: s(v, 'dashboard_url') },
    }),
  },
  notification: {
    key: 'notification',
    label: 'General notification',
    category: 'updates',
    variables: ['first_name', 'title', 'body', 'action_url', 'action_label'],
    customisable: [],
    subject: (v) => s(v, 'title'),
    content: (v) => ({ preheader: s(v, 'body').slice(0, 120), heading: s(v, 'title'), greeting: `Hello ${s(v, 'first_name', 'there')},`, blocks: [{ type: 'paragraph', text: s(v, 'body') }], cta: s(v, 'action_url') ? { label: s(v, 'action_label', 'Open my account'), url: s(v, 'action_url') } : undefined }),
  },
  'quote-sent': {
    key: 'quote-sent',
    label: 'Quotation sent',
    category: 'updates',
    variables: ['first_name', 'agency_name', 'quote_number', 'total', 'valid_until', 'agent_name', 'message', 'document_url'],
    customisable: ['subject', 'heading', 'body'],
    subject: (v, b) => `Your quotation ${s(v, 'quote_number')} from ${b.name}`,
    content: (v, b) => {
      const blocks: Block[] = [
        { type: 'paragraph', text: s(v, 'body', `${s(v, 'agent_name', 'Your adviser')} has prepared quotation ${s(v, 'quote_number')} for you.`) },
        { type: 'details', rows: [['Quotation', s(v, 'quote_number')], ['Total', s(v, 'total')], ['Valid until', s(v, 'valid_until', 'see the attached document')]] },
      ]
      if (s(v, 'message')) blocks.push({ type: 'notice', text: s(v, 'message') })
      blocks.push({ type: 'paragraph', text: 'The full quotation is attached as a PDF. Premiums are indicative until the insurer confirms cover.' })
      return {
        preheader: `Quotation ${s(v, 'quote_number')} · ${s(v, 'total')}`,
        heading: s(v, 'heading', `Your quotation from ${b.shortName}`),
        greeting: `Hello ${s(v, 'first_name', 'there')},`,
        blocks,
        cta: s(v, 'document_url') ? { label: 'View the quotation', url: s(v, 'document_url') } : undefined,
        closing: `To accept, reply to this email quoting ${s(v, 'quote_number')}.`,
      }
    },
  },
  'invoice-sent': {
    key: 'invoice-sent',
    label: 'Invoice sent',
    category: 'account',
    variables: ['first_name', 'agency_name', 'invoice_number', 'total', 'due_date', 'payment_instructions', 'message', 'document_url'],
    customisable: ['subject', 'heading', 'body'],
    subject: (v, b) => `Invoice ${s(v, 'invoice_number')} from ${b.name}`,
    content: (v, b) => {
      const blocks: Block[] = [
        { type: 'paragraph', text: s(v, 'body', `Please find invoice ${s(v, 'invoice_number')} from ${b.name} attached.`) },
        { type: 'details', rows: [['Invoice', s(v, 'invoice_number')], ['Amount due', s(v, 'total')], ['Payable by', s(v, 'due_date', 'on receipt')]] },
      ]
      if (s(v, 'payment_instructions')) blocks.push({ type: 'notice', text: s(v, 'payment_instructions') })
      if (s(v, 'message')) blocks.push({ type: 'paragraph', text: s(v, 'message') })
      return {
        preheader: `Invoice ${s(v, 'invoice_number')} · ${s(v, 'total')}`,
        heading: s(v, 'heading', `Invoice ${s(v, 'invoice_number')}`),
        greeting: `Hello ${s(v, 'first_name', 'there')},`,
        blocks,
        cta: s(v, 'document_url') ? { label: 'View the invoice', url: s(v, 'document_url') } : undefined,
        closing: 'Thank you for your business.',
      }
    },
  },
  'invoice-reminder': {
    key: 'invoice-reminder',
    label: 'Invoice reminder',
    category: 'reminders',
    variables: ['first_name', 'agency_name', 'invoice_number', 'total', 'due_date', 'days_overdue', 'document_url'],
    customisable: ['subject', 'heading', 'body'],
    subject: (v, b) => `Reminder: invoice ${s(v, 'invoice_number')} is due`,
    content: (v, b) => ({
      preheader: `Invoice ${s(v, 'invoice_number')} is awaiting payment.`,
      heading: s(v, 'heading', `A friendly reminder about invoice ${s(v, 'invoice_number')}`),
      greeting: `Hello ${s(v, 'first_name', 'there')},`,
      blocks: [
        { type: 'paragraph', text: s(v, 'body', `Our records show invoice ${s(v, 'invoice_number')} from ${b.name} is still outstanding.`) },
        { type: 'details', rows: [['Invoice', s(v, 'invoice_number')], ['Amount outstanding', s(v, 'total')], ['Due date', s(v, 'due_date')]] },
        { type: 'paragraph', text: 'If you have already paid, please ignore this note and accept our thanks.' },
      ],
      cta: s(v, 'document_url') ? { label: 'View the invoice', url: s(v, 'document_url') } : undefined,
    }),
  },
  'staff-notification': {
    key: 'staff-notification',
    label: 'Staff notification',
    category: 'updates',
    variables: ['first_name', 'title', 'body', 'action_url'],
    customisable: [],
    subject: (v, b) => `[${b.shortName}] ${s(v, 'title')}`,
    content: (v) => ({ preheader: s(v, 'body').slice(0, 120), heading: s(v, 'title'), greeting: `Hello ${s(v, 'first_name', 'there')},`, blocks: [{ type: 'paragraph', text: s(v, 'body') }], cta: s(v, 'action_url') ? { label: 'Open the workspace', url: s(v, 'action_url') } : undefined }),
  },
}

/** Replaces {{variables}} in text an admin wrote, escaping nothing here (the layout escapes). */
export function substitute(text: string, vars: Vars): string {
  return text.replace(/\{\{\s*([a-z_]+)\s*\}\}/gi, (_, k: string) => (vars[k] == null ? '' : String(vars[k])))
}

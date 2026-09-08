import nodemailer from 'nodemailer'

/**
 * SMTP transport, the same account the site forms already use (SMTP_HOST,
 * SMTP_PORT, SMTP_USER, SMTP_PASS, optional SMTP_FROM). Every platform email
 * goes through `services/emails.ts`, which renders a branded template, logs
 * the attempt and retries; this module only talks to the mail server.
 */

export function emailConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)
}

export interface RawEmail {
  to: string
  subject: string
  text: string
  html?: string
  /** Display name for the From header; the address stays the configured SMTP account. */
  fromName?: string
  replyTo?: string
  /** Files to attach, e.g. an invoice PDF. Kept small; large files go behind a link. */
  attachments?: { filename: string; content: Buffer; contentType?: string }[]
}

export interface DeliveryResult {
  ok: boolean
  messageId?: string
  error?: string
}

let transporter: nodemailer.Transporter | null = null

function transport(): nodemailer.Transporter {
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT ?? 587)
    transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST, port, secure: port === 465, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }, connectionTimeout: 15_000, socketTimeout: 30_000 })
  }
  return transporter
}

function fromAddress(): string {
  const configured = process.env.SMTP_FROM
  const m = configured?.match(/<([^>]+)>/)
  return m?.[1] ?? configured ?? process.env.SMTP_USER ?? ''
}

/** Sends one email. Never throws; the caller decides what a failure means. */
export async function deliverEmail(input: RawEmail): Promise<DeliveryResult> {
  if (!emailConfigured()) return { ok: false, error: 'SMTP is not configured' }
  try {
    const info = await transport().sendMail({
      from: `"${(input.fromName ?? 'Super Agent').replace(/"/g, '')}" <${fromAddress()}>`,
      to: input.to,
      replyTo: input.replyTo,
      subject: input.subject,
      text: input.text,
      html: input.html ?? `<pre style="font-family:system-ui,sans-serif;white-space:pre-wrap">${escapeHtml(input.text)}</pre>`,
      attachments: input.attachments?.map((a) => ({ filename: a.filename, content: a.content, contentType: a.contentType ?? 'application/pdf' })),
    })
    return { ok: true, messageId: info.messageId }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('email failed', message)
    return { ok: false, error: message.slice(0, 300) }
  }
}

/** Backwards-compatible helper for plain notifications. Prefer `sendTemplateEmail`. */
export async function sendEmail(input: { to: string; subject: string; text: string; html?: string }): Promise<boolean> {
  return (await deliverEmail(input)).ok
}

export function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

import nodemailer from 'nodemailer'

/** Transactional email through the SMTP account already configured for the site forms. Never throws. */

export function emailConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)
}

interface SendInput {
  to: string
  subject: string
  text: string
  html?: string
}

export async function sendEmail(input: SendInput): Promise<boolean> {
  if (!emailConfigured()) return false
  try {
    const port = Number(process.env.SMTP_PORT ?? 587)
    const transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST, port, secure: port === 465, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } })
    await transporter.sendMail({ from: process.env.SMTP_FROM ?? `"Super Agent" <${process.env.SMTP_USER}>`, to: input.to, subject: input.subject, text: input.text, html: input.html ?? `<pre style="font-family:system-ui,sans-serif;white-space:pre-wrap">${escapeHtml(input.text)}</pre>` })
    return true
  } catch (error) {
    console.error('email failed', error instanceof Error ? error.message : error)
    return false
  }
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

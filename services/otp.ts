import { createHash, randomInt } from 'node:crypto'
import { getSql } from '@/lib/db/client'
import { ensureSchema } from '@/lib/db/migrate'
import { newId } from '@/lib/ids'
import { audit } from '@/services/audit'
import { sendTemplateEmail } from '@/services/emails'

/**
 * Email one-time codes. Six digits, hashed at rest, ten-minute life, single
 * use, five wrong guesses burn the code, at most three codes per address in
 * ten minutes, and issuing a new code invalidates the older ones.
 */

export type OtpPurpose = 'verify-email' | 'login' | 'password-reset' | 'sensitive-action' | 'change-email'

export const OTP_TTL_MINUTES = 10
const MAX_ISSUES_PER_WINDOW = 3
const MAX_ATTEMPTS = 5

const LABELS: Record<OtpPurpose, string> = { 'verify-email': 'Verify your email', login: 'Confirm your sign-in', 'password-reset': 'Reset your password', 'sensitive-action': 'Confirm this action', 'change-email': 'Confirm your new email' }

function hash(email: string, purpose: string, code: string): string {
  return createHash('sha256').update(`${email.toLowerCase()}|${purpose}|${code}|${process.env.AUTH_SECRET ?? ''}`).digest('hex')
}

export type IssueResult = { ok: true; expiresAt: string } | { ok: false; reason: 'rate-limited' | 'email-unconfigured' | 'failed' }

export async function issueOtp(input: { email: string; purpose: OtpPurpose; userId?: string | null; organizationId?: string | null; firstName?: string }): Promise<IssueResult> {
  await ensureSchema()
  const sql = getSql()
  const email = input.email.trim().toLowerCase()
  const recent = await sql`SELECT count(*) AS n FROM otps WHERE email = ${email} AND purpose = ${input.purpose} AND created_at > now() - interval '10 minutes'`
  if (Number(recent[0]?.n ?? 0) >= MAX_ISSUES_PER_WINDOW) {
    await audit({ organizationId: input.organizationId ?? null, actorUserId: input.userId ?? null, action: 'otp.rate-limited', target: email })
    return { ok: false, reason: 'rate-limited' }
  }
  await sql`UPDATE otps SET used_at = now() WHERE email = ${email} AND purpose = ${input.purpose} AND used_at IS NULL`
  const code = String(randomInt(0, 1_000_000)).padStart(6, '0')
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60_000)
  await sql`INSERT INTO otps (id, user_id, email, purpose, code_hash, expires_at) VALUES (${newId('otp')}, ${input.userId ?? null}, ${email}, ${input.purpose}, ${hash(email, input.purpose, code)}, ${expiresAt})`
  const outcome = await sendTemplateEmail({ key: 'otp', to: email, organizationId: input.organizationId ?? null, userId: input.userId ?? null, vars: { first_name: input.firstName ?? 'there', otp_code: code, expires_in: `${OTP_TTL_MINUTES} minutes`, purpose_label: LABELS[input.purpose] }, category: 'security', immediate: true })
  await audit({ organizationId: input.organizationId ?? null, actorUserId: input.userId ?? null, action: 'otp.issued', target: email, detail: { purpose: input.purpose, outcome } })
  if (outcome === 'unconfigured') return { ok: false, reason: 'email-unconfigured' }
  if (outcome !== 'sent') return { ok: false, reason: 'failed' }
  return { ok: true, expiresAt: expiresAt.toISOString() }
}

export type VerifyResult = 'ok' | 'wrong' | 'expired' | 'too-many'

export async function verifyOtp(email: string, purpose: OtpPurpose, code: string): Promise<VerifyResult> {
  await ensureSchema()
  const sql = getSql()
  const e = email.trim().toLowerCase()
  const rows = await sql`SELECT id, code_hash, attempts, expires_at FROM otps WHERE email = ${e} AND purpose = ${purpose} AND used_at IS NULL ORDER BY created_at DESC LIMIT 1`
  const row = rows[0]
  if (!row) return 'expired'
  if (new Date(String(row.expires_at)).getTime() < Date.now()) return 'expired'
  if (Number(row.attempts) >= MAX_ATTEMPTS) return 'too-many'
  if (String(row.code_hash) !== hash(e, purpose, code.trim())) {
    await sql`UPDATE otps SET attempts = attempts + 1 WHERE id = ${String(row.id)}`
    await audit({ organizationId: null, actorUserId: null, action: 'otp.wrong', target: e, detail: { purpose } })
    return Number(row.attempts) + 1 >= MAX_ATTEMPTS ? 'too-many' : 'wrong'
  }
  await sql`UPDATE otps SET used_at = now() WHERE id = ${String(row.id)}`
  await audit({ organizationId: null, actorUserId: null, action: 'otp.verified', target: e, detail: { purpose } })
  return 'ok'
}

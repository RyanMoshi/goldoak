// Seeds the GoldOak database with the organisation, an agency account and
// demo clients with policies, quotes, claims, tasks and activity.
// Run: npm run db:seed   (reads POSTGRES_URL / DATABASE_URL from .env.local)

import { readFileSync } from 'node:fs'
import { randomBytes, scryptSync } from 'node:crypto'
import postgres from 'postgres'

function connectionString() {
  const direct = [process.env.DATABASE_URL, process.env.POSTGRES_URL, process.env.POSTGRES_PRISMA_URL, process.env.POSTGRES_URL_NON_POOLING].find((v) => v && v.trim())
  if (direct) return direct.trim()
  const { POSTGRES_HOST: host, POSTGRES_USER: user, POSTGRES_PASSWORD: password, POSTGRES_DATABASE: database } = process.env
  if (host && user && password) return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:5432/${database || 'postgres'}`
  return undefined
}
const url = connectionString()
if (!url) {
  console.error('No database URL. Set DATABASE_URL in Vercel (pooled Supabase URL), then run `vercel env pull .env.local --environment=production`.')
  process.exit(1)
}
const sql = postgres(url, { prepare: false, max: 1, ssl: /localhost|127.0.0.1/.test(url) ? false : 'require' })

const DEMO_PASSWORD = process.env.SEED_PASSWORD ?? 'GoldOak2026!'

function hash(password) {
  const salt = randomBytes(16)
  const key = scryptSync(password.normalize('NFKC'), salt, 64, { N: 16384 })
  return `scrypt$16384$${salt.toString('base64')}$${key.toString('base64')}`
}

function daysFromNow(days) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}
function hoursAgo(hours) {
  return new Date(Date.now() - hours * 3600_000).toISOString()
}

async function applySchema() {
  const file = readFileSync(new URL('../lib/db/schema.sql', import.meta.url), 'utf8')
  const statements = file.split(/;\s*\n/).map((s) => s.trim()).filter((s) => s && !s.startsWith('--'))
  for (const statement of statements) await sql.unsafe(statement)
}

const ORG = 'org_goldoak'

async function seed() {
  await applySchema()

  await sql`INSERT INTO organizations (id, name, short_name, phone, email, whatsapp)
    VALUES (${ORG}, 'GoldOak Insurance Agency', 'GoldOak', '+254 729 911 311', 'info@goldoak.co.ke', '254729911311')
    ON CONFLICT (id) DO NOTHING`

  const pw = hash(DEMO_PASSWORD)

  const users = [
    ['usr_agency_alex', 'agency', ORG, 'Alex Kamau', 'agency@goldoak.co.ke', '254729911311', 'Senior Insurance Agent'],
    ['usr_client_mwangi', 'client', ORG, 'Peter Mwangi', 'mwangi@example.com', '254722000111', null],
    ['usr_client_wanjiru', 'client', ORG, 'Grace Wanjiru', 'wanjiru@example.com', '254733000222', null],
    ['usr_client_apex', 'client', ORG, 'Dr. Faith Ndung’u', 'apex@example.com', '254711000333', null],
  ]
  for (const [id, role, org, name, email, phone, title] of users) {
    await sql`INSERT INTO users (id, role, organization_id, name, email, phone, password_hash, title)
      VALUES (${id}, ${role}, ${org}, ${name}, ${email}, ${phone}, ${pw}, ${title})
      ON CONFLICT (id) DO NOTHING`
  }

  const clients = [
    ['cli_mwangi', 'usr_client_mwangi', 'Mwangi Hardware', 'sme', '254722000111', 'mwangi@example.com', 'compare'],
    ['cli_wanjiru', 'usr_client_wanjiru', 'Wanjiru Motors', 'sme', '254733000222', 'wanjiru@example.com', 'compare'],
    ['cli_apex', 'usr_client_apex', 'Apex Pharmacy', 'sme', '254711000333', 'apex@example.com', 'support'],
    ['cli_karanja', null, 'Karanja Logistics', 'sme', '254700000444', null, 'implement'],
    ['cli_heights', null, 'Nairobi Heights Apartments', 'corporate', '254700000555', null, 'compare'],
    ['cli_kamau', null, 'Kamau & Sons', 'sme', '254700000666', null, 'understand'],
  ]
  for (const [id, userId, name, type, phone, email, stage] of clients) {
    await sql`INSERT INTO clients (id, organization_id, user_id, name, type, phone, email, stage, adviser_name)
      VALUES (${id}, ${ORG}, ${userId}, ${name}, ${type}, ${phone}, ${email}, ${stage}, 'Alex Kamau')
      ON CONFLICT (id) DO NOTHING`
  }

  const policies = [
    ['pol_001', 'cli_mwangi', 'APA', 'Fire & Allied Perils', 'APA/FIR/2025/48213', 5_500_000, 48_600, daysFromNow(-298), daysFromNow(67), 'live', 'Stock held outside the premises is not covered.'],
    ['pol_002', 'cli_mwangi', 'CIC', 'WIBA', 'CIC/WIB/2025/11902', null, 36_000, daysFromNow(-340), daysFromNow(25), 'renewal-due', 'Casual workers must be declared each quarter.'],
    ['pol_003', 'cli_wanjiru', 'Jubilee', 'Motor Fleet', 'JUB/MTR/2025/77310', 12_400_000, 2_150_000, daysFromNow(-200), daysFromNow(165), 'live', 'Drivers under 25 are excluded unless declared.'],
    ['pol_004', 'cli_apex', 'Jubilee', 'Group Medical', 'JUB/MED/2025/30188', null, 1_240_000, daysFromNow(-347), daysFromNow(18), 'renewal-due', 'Pre-existing conditions have a 12-month waiting period.'],
    ['pol_005', 'cli_apex', 'Old Mutual', 'Professional Indemnity', 'OM/PI/2026/00841', 10_000_000, 96_000, daysFromNow(-40), daysFromNow(325), 'live', 'Claims must be notified within 30 days.'],
    ['pol_006', 'cli_karanja', 'Britam', 'Goods in Transit', 'BRT/GIT/2026/01522', 8_000_000, 184_500, daysFromNow(-20), daysFromNow(345), 'live', 'Unattended vehicle losses are excluded.'],
  ]
  for (const p of policies) {
    await sql`INSERT INTO policies (id, organization_id, client_id, insurer, product, policy_number, sum_insured, premium, start_date, expiry_date, status, key_exclusions)
      VALUES (${p[0]}, ${ORG}, ${p[1]}, ${p[2]}, ${p[3]}, ${p[4]}, ${p[5]}, ${p[6]}, ${p[7]}, ${p[8]}, ${p[9]}, ${p[10]})
      ON CONFLICT (id) DO NOTHING`
  }

  const quotes = [
    ['qr_001', 'cli_mwangi', 'QR-2026-0412', 'Fire & Allied Perils', 'requested', 480_000],
    ['qr_002', 'cli_wanjiru', 'QR-2026-0398', 'Motor Fleet', 'compared', 2_150_000],
    ['qr_003', 'cli_heights', 'QR-2026-0419', 'Public Liability', 'requested', 210_000],
    ['qr_004', 'cli_apex', 'QR-2026-0377', 'Professional Indemnity', 'proposed', 96_000],
    ['qr_005', 'cli_karanja', 'QR-2026-0401', 'Motor Fleet', 'accepted', 1_600_000],
    ['qr_006', 'cli_kamau', 'QR-2026-0421', 'WIBA', 'requested', 42_000],
  ]
  for (const q of quotes) {
    await sql`INSERT INTO quote_requests (id, organization_id, client_id, reference, product, stage, premium_estimate)
      VALUES (${q[0]}, ${ORG}, ${q[1]}, ${q[2]}, ${q[3]}, ${q[4]}, ${q[5]})
      ON CONFLICT (id) DO NOTHING`
  }

  const submissions = [
    ['qs_001', 'qr_001', 'Britam', 'awaiting', null, hoursAgo(96)],
    ['qs_002', 'qr_001', 'Jubilee', 'received', 52_400, hoursAgo(96)],
    ['qs_003', 'qr_001', 'APA', 'received', 48_600, hoursAgo(96)],
    ['qs_004', 'qr_002', 'Britam', 'awaiting', null, hoursAgo(72)],
    ['qs_005', 'qr_002', 'Jubilee', 'received', 2_150_000, hoursAgo(72)],
    ['qs_006', 'qr_002', 'CIC', 'received', 2_240_000, hoursAgo(72)],
    ['qs_007', 'qr_003', 'CIC', 'clarification', null, hoursAgo(48)],
    ['qs_008', 'qr_004', 'Old Mutual', 'ready', 96_000, hoursAgo(120)],
    ['qs_009', 'qr_006', 'Britam', 'awaiting', null, hoursAgo(24)],
  ]
  for (const s of submissions) {
    await sql`INSERT INTO quote_submissions (id, organization_id, quote_request_id, insurer, status, premium, sent_at)
      VALUES (${s[0]}, ${ORG}, ${s[1]}, ${s[2]}, ${s[3]}, ${s[4]}, ${s[5]})
      ON CONFLICT (id) DO NOTHING`
  }

  const claims = [
    ['clm_001', 'cli_mwangi', 'pol_001', 'CLM-2026-00124', 'APA', 'Fire & Allied Perils', 'assessed', 340_000, daysFromNow(0)],
    ['clm_002', 'cli_karanja', 'pol_006', 'CLM-2026-00131', 'Britam', 'Goods in Transit', 'documenting', 620_000, daysFromNow(3)],
  ]
  for (const c of claims) {
    await sql`INSERT INTO claims (id, organization_id, client_id, policy_id, reference, insurer, product, stage, amount, next_update_due)
      VALUES (${c[0]}, ${ORG}, ${c[1]}, ${c[2]}, ${c[3]}, ${c[4]}, ${c[5]}, ${c[6]}, ${c[7]}, ${c[8]})
      ON CONFLICT (id) DO NOTHING`
  }

  const tasks = [
    ['tsk_001', 'cli_mwangi', 'Mwangi Hardware', 'quote-follow-up', 'Britam', 'Fire & Allied Perils', 'Fire & Allied Perils quote on industrial stock still with the underwriting desk.', '4 days outstanding', 'at-risk', 96, true, 480_000, 'QR-2026-0412', 'follow-up', 'Follow up'],
    ['tsk_002', 'cli_wanjiru', 'Wanjiru Motors', 'ai-review', null, 'Motor Fleet', 'Recommendation reasoning drafted from the Jubilee and CIC quotes. Ready for your approval.', 'Ready for approval', 'needs-review', 90, true, 2_150_000, 'CMP-2026-0088', 'review', 'Review'],
    ['tsk_003', 'cli_mwangi', 'Mwangi Hardware', 'claim-update', 'APA', 'Fire & Allied Perils', 'Assessor report received. Weekly client update is due today.', 'Update due today', 'on-track', 88, true, 340_000, 'CLM-2026-00124', 'update-client', 'Update client'],
    ['tsk_004', 'cli_karanja', 'Karanja Logistics', 'documents-missing', null, 'Motor Fleet', 'Two documents outstanding before binding: KRA PIN certificate and logbook for KDA 412K.', 'Requested 3 days ago', 'at-risk', 80, false, 1_600_000, null, 'request-documents', 'Request documents'],
    ['tsk_005', 'cli_apex', 'Apex Pharmacy', 'renewal', 'Jubilee', 'Group Medical', 'Group medical for 42 lives. Renewal review report should go out before the 30-day mark.', 'Renews in 18 days', 'on-track', 72, false, 1_240_000, null, 'send', 'Send review'],
    ['tsk_006', 'cli_heights', 'Nairobi Heights Apartments', 'quote-follow-up', 'CIC', 'Public Liability', 'CIC asked for the occupancy schedule before quoting. Client has not replied.', '2 days outstanding', 'on-track', 64, false, 210_000, 'QR-2026-0419', 'follow-up', 'Follow up'],
    ['tsk_007', 'cli_kamau', 'Kamau & Sons', 'lead-contact', null, 'WIBA', 'WhatsApp enquiry about WIBA for 12 staff. No fact-find booked yet.', 'Received yesterday', 'overdue', 84, true, null, null, 'call', 'Book fact-find'],
    ['tsk_008', 'cli_apex', 'Apex Pharmacy', 'proposal', 'Old Mutual', 'Professional Indemnity', 'Proposal viewed twice, not yet accepted. Client asked about the excess.', 'Sent 5 days ago', 'on-track', 58, false, 96_000, null, 'call', 'Call client'],
  ]
  for (const t of tasks) {
    await sql`INSERT INTO tasks (id, organization_id, client_id, client_name, type, insurer, product, summary, timing, sla, priority, due_today, amount, reference, action_kind, action_label)
      VALUES (${t[0]}, ${ORG}, ${t[1]}, ${t[2]}, ${t[3]}, ${t[4]}, ${t[5]}, ${t[6]}, ${t[7]}, ${t[8]}, ${t[9]}, ${t[10]}, ${t[11]}, ${t[12]}, ${t[13]}, ${t[14]})
      ON CONFLICT (id) DO NOTHING`
  }

  const activity = [
    ['act_001', 'cli_mwangi', 'Mwangi Hardware', 'quote-received', 'Quote received from Jubilee', hoursAgo(0.15)],
    ['act_002', 'cli_wanjiru', 'Wanjiru Motors', 'risk-profile', 'Risk profile completed', hoursAgo(0.55)],
    ['act_003', 'cli_apex', 'Apex Pharmacy', 'proposal-sent', 'Proposal sent', hoursAgo(1)],
    ['act_004', 'cli_karanja', 'Karanja Logistics', 'documents-uploaded', 'Claim documents uploaded', hoursAgo(2)],
    ['act_005', 'cli_heights', 'Nairobi Heights Apartments', 'renewal', 'Renewal case opened, 90 days out', hoursAgo(26)],
  ]
  for (const a of activity) {
    await sql`INSERT INTO activity (id, organization_id, client_id, client_name, kind, title, at)
      VALUES (${a[0]}, ${ORG}, ${a[1]}, ${a[2]}, ${a[3]}, ${a[4]}, ${a[5]})
      ON CONFLICT (id) DO NOTHING`
  }

  console.log('Seeded GoldOak database.')
  console.log(`Agency sign-in:  agency@goldoak.co.ke / ${DEMO_PASSWORD}`)
  console.log(`Client sign-in:  mwangi@example.com / ${DEMO_PASSWORD}  (also wanjiru@example.com, apex@example.com)`)
}

seed()
  .then(() => sql.end())
  .catch(async (error) => {
    console.error(error)
    await sql.end().catch(() => {})
    process.exit(1)
  })

import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/server'
import { isStaffRole } from '@/lib/auth/session'
import { TEMPLATES } from '@/lib/email/templates'
import { renderTemplate } from '@/services/emails'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Renders a template with sample data in the signed-in agency's branding (staff only). ?key=welcome */
export async function GET(request: Request) {
  const session = await getSession()
  if (!session || !isStaffRole(session.role)) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 })
  const url = new URL(request.url)
  const key = url.searchParams.get('key') ?? 'welcome'
  const scope = url.searchParams.get('scope') === 'global' && session.role === 'admin' ? null : session.oid
  if (!TEMPLATES[key]) return NextResponse.json({ error: 'Unknown template.' }, { status: 404 })
  const sample = {
    first_name: 'Amina',
    last_name: 'Hassan',
    full_name: 'Amina Hassan',
    email: 'amina@example.com',
    temporary_password: 'Mango4827',
    otp_code: '482913',
    expires_in: '10 minutes',
    purpose_label: 'Verify your email',
    reset_url: 'https://example.com/reset-password?token=sample',
    login_url: 'https://example.com/signin',
    dashboard_url: 'https://example.com/portal',
    agent_name: session.name,
    policy_name: 'Motor Comprehensive',
    policy_number: 'MC/2026/00412',
    insurer: 'Jubilee Allianz',
    renewal_date: '12 Oct 2026',
    days_left: '14',
    premium: 'KES 48,500',
    amount: 'KES 12,000',
    due_date: '30 Sep 2026',
    status: 'due',
    when: 'Tuesday 16 Sep, 10:00',
    where: 'Phone call',
    purpose: 'renewal review',
    claim_reference: 'CLM-2026-00021',
    stage: 'With insurer',
    note: 'The assessor visits on Thursday.',
    document_name: 'logbook.pdf',
    document_type: 'logbook',
    summary: 'Registration KDA 123A, Toyota Hilux 2019.',
    title: 'A sample notification',
    body: 'This is what a general notification looks like in your branding.',
    action_url: 'https://example.com/portal',
    action_label: 'Open my account',
    agency_name: 'Your agency',
    join_code: 'CODE',
    login_time: new Date().toUTCString(),
    ip: '41.90.0.1',
    device: 'Chrome on Android',
    new_email: 'amina.new@example.com',
  }
  const rendered = await renderTemplate(key, scope, sample)
  if (!rendered) return NextResponse.json({ error: 'Could not render.' }, { status: 500 })
  return new Response(rendered.html, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Subject': encodeURIComponent(rendered.subject) } })
}

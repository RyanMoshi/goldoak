import { NextResponse } from 'next/server'
import { hasDatabase } from '@/lib/db/client'
import { consult } from '@/services/consult'
import { getOrganization, getOrganizationByCode, DEFAULT_ORGANIZATION_ID } from '@/services/users'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Public consultation endpoint for the website ("Talk to the AI" before
 * signing up). Rate-limited per IP; answers are not personalised.
 * Body: { question: string, agency?: string (join code) }
 */

const WINDOW_MS = 10 * 60 * 1000
const LIMIT = 12
const hits = new Map<string, number[]>()

function limited(ip: string): boolean {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  if (recent.length >= LIMIT) {
    hits.set(ip, recent)
    return true
  }
  recent.push(now)
  hits.set(ip, recent)
  if (hits.size > 5000) hits.clear()
  return false
}

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown'
  if (limited(ip)) return NextResponse.json({ error: 'Too many questions in a short time. Please try again in a few minutes, or message us on WhatsApp.' }, { status: 429 })

  let body: { question?: unknown; agency?: unknown } = {}
  try {
    body = (await request.json()) as typeof body
  } catch {
    return NextResponse.json({ error: 'Send a JSON body with a question.' }, { status: 400 })
  }
  const question = typeof body.question === 'string' ? body.question.trim().slice(0, 1000) : ''
  if (question.length < 3) return NextResponse.json({ error: 'Ask a fuller question.' }, { status: 400 })

  let organization = null
  if (hasDatabase()) {
    try {
      const code = typeof body.agency === 'string' ? body.agency.trim() : ''
      organization = (code ? await getOrganizationByCode(code) : null) ?? (await getOrganization(DEFAULT_ORGANIZATION_ID))
    } catch {
      organization = null
    }
  }
  try {
    const result = await consult({ question, organization, user: null, client: null, phone: null, channel: 'web' })
    return NextResponse.json({ answer: result.answer, source: result.source, handoff: result.escalate }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('public consult failed', error instanceof Error ? error.message : error)
    return NextResponse.json({ error: 'The assistant is unavailable right now. Please try WhatsApp.' }, { status: 500 })
  }
}

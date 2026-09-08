import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/server'
import { runInBackground } from '@/lib/background'
import { hasDatabase } from '@/lib/db/client'
import { enqueue } from '@/services/jobs'
import { answerWebMessage, awaitingAnswer, listWebMessages, postWebMessage } from '@/services/webchat'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 120

/**
 * Web chat transport for the portal. Everything is stored server-side, so the
 * page can be refreshed, closed or reopened days later and read the thread back.
 *   GET  /api/chat            → { messages, pending }
 *   POST /api/chat {text}     → stores the question, answers in the background → { id }
 */
export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'client') return NextResponse.json({ error: 'Sign in first.' }, { status: 401 })
  if (!hasDatabase()) return NextResponse.json({ messages: [], pending: false })
  const messages = await listWebMessages(session.uid, session.oid)
  return NextResponse.json({ messages, pending: awaitingAnswer(messages) }, { headers: { 'Cache-Control': 'no-store' } })
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session || session.role !== 'client') return NextResponse.json({ error: 'Sign in first.' }, { status: 401 })
  if (!hasDatabase()) return NextResponse.json({ error: 'Database not configured.' }, { status: 503 })
  let text = ''
  try {
    const body = (await request.json()) as { text?: unknown }
    text = typeof body.text === 'string' ? body.text.trim() : ''
  } catch {
    return NextResponse.json({ error: 'Send JSON with a text field.' }, { status: 400 })
  }
  if (text.length < 2) return NextResponse.json({ error: 'Write a fuller message.' }, { status: 400 })
  if (text.length > 2000) return NextResponse.json({ error: 'Keep it under 2000 characters.' }, { status: 400 })

  const id = await postWebMessage(session.uid, session.oid, text)
  const uid = session.uid
  const oid = session.oid
  const scheduled = runInBackground(async () => {
    try {
      await answerWebMessage(uid, oid, id)
    } catch (error) {
      console.error('web chat answer failed', error instanceof Error ? error.message : error)
      await enqueue({ type: 'web-answer', organizationId: oid, payload: { userId: uid, organizationId: oid, questionId: id }, idempotencyKey: `web-answer:${id}` }).catch(() => null)
    }
  })
  if (!scheduled) await enqueue({ type: 'web-answer', organizationId: oid, payload: { userId: uid, organizationId: oid, questionId: id }, idempotencyKey: `web-answer:${id}` })
  return NextResponse.json({ id }, { headers: { 'Cache-Control': 'no-store' } })
}

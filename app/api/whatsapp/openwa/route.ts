import { NextResponse } from 'next/server'
import { getSql, hasDatabase } from '@/lib/db/client'
import { ensureSchema } from '@/lib/db/migrate'
import { handleInbound, processInbound } from '@/lib/whatsapp/bot'
import { acknowledgeChat, sendWhatsApp, whatsappConfigured } from '@/lib/whatsapp/provider'
import { parseOpenWAEvent, verifyOpenWASignature } from '@/lib/whatsapp/providers/openwa'
import { runInBackground } from '@/lib/background'
import { enqueue } from '@/services/jobs'
import { organizationForSession } from '@/lib/whatsapp/channels'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300

/**
 * OpenWA webhook. Verifies the signature, de-duplicates, acknowledges within
 * milliseconds (the gateway times out at 10 s and retries), then handles the
 * message in the background: routing, AI, workflow, sending the reply. If the
 * background task cannot be scheduled the message is queued as a job instead,
 * so nothing is lost.
 *
 *   POST {OPENWA_BASE_URL}/api/sessions/{id}/webhooks
 *   { "url": "https://goldoak.vercel.app/api/whatsapp/openwa", "events": ["message.received"], "secret": "..." }
 *
 * Test mode: with `x-admin-token` the route handles synchronously and echoes
 * the replies instead of sending them (`x-debug: 1` adds error details).
 */
export async function POST(request: Request) {
  const raw = await request.text()
  if (!verifyOpenWASignature(raw, request.headers.get('x-openwa-signature'))) {
    return new Response('Invalid signature', { status: 401 })
  }

  let payload: unknown
  try {
    payload = JSON.parse(raw)
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const { key, sessionId, message } = parseOpenWAEvent(payload)
  if (!message) return NextResponse.json({ ok: true, ignored: true })
  if (!hasDatabase()) return NextResponse.json({ ok: true, ignored: 'no database' })

  await ensureSchema()
  const idempotencyKey = request.headers.get('x-openwa-idempotency-key') ?? key ?? message.messageId
  if (idempotencyKey) {
    const sql = getSql()
    const inserted = await sql`INSERT INTO processed_webhooks (key) VALUES (${`openwa:${idempotencyKey}`}) ON CONFLICT DO NOTHING RETURNING key`
    if (!inserted.length) return NextResponse.json({ ok: true, duplicate: true })
  }

  // Which agency's number received this? The shared number resolves later by account/code; an agency's own number resolves here.
  const channelOrganizationId = sessionId && sessionId !== process.env.OPENWA_SESSION_ID ? await organizationForSession(sessionId) : null

  const adminToken = process.env.ADMIN_TOKEN
  const dryRun = Boolean(adminToken && adminToken.length >= 16 && request.headers.get('x-admin-token') === adminToken)
  ;(globalThis as { __superAgentDebug?: boolean }).__superAgentDebug = dryRun && request.headers.get('x-debug') === '1'

  if (dryRun) {
    try {
      const result = await handleInbound(message, channelOrganizationId)
      return NextResponse.json({ ok: true, dryRun: true, answered: result.answered, organizationId: result.organizationId, userId: result.userId, replies: result.replies })
    } catch (error) {
      console.error('openwa dry-run failed', error instanceof Error ? error.message : error)
      return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'failed' }, { status: 500 })
    }
  }

  if (!whatsappConfigured()) {
    // No gateway: handle inline and echo, so the conversation can be tested end to end.
    const result = await handleInbound(message, channelOrganizationId)
    return NextResponse.json({ ok: true, sent: false, answered: result.answered, reply: result.replies.join('\n\n') })
  }

  const scheduled = runInBackground(async () => {
    try {
      await acknowledgeChat(message.phone, channelOrganizationId)
      await processInbound({ message, channelOrganizationId })
    } catch (error) {
      console.error('inbound processing failed', error instanceof Error ? error.message : error)
      await enqueue({ type: 'process-inbound', payload: { message, channelOrganizationId }, idempotencyKey: `inbound:${idempotencyKey}` }).catch(() => null)
      await sendWhatsApp(message.phone, 'Something went wrong on our side. Nothing was lost; I will get back to you in a moment.', channelOrganizationId).catch(() => null)
    }
  })
  if (!scheduled) {
    await enqueue({ type: 'process-inbound', payload: { message, channelOrganizationId }, idempotencyKey: `inbound:${idempotencyKey}` })
  }
  return NextResponse.json({ ok: true, queued: true })
}

export async function GET() {
  return NextResponse.json({ ok: true, provider: 'openwa', expects: 'POST message.received events' })
}

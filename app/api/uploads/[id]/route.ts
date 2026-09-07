import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/server'
import { isStaffRole } from '@/lib/auth/session'
import { getSql, hasDatabase } from '@/lib/db/client'
import { getObject } from '@/lib/storage/supabase'
import { audit } from '@/services/audit'
import { clientForUser } from '@/services/journey'
import { getUpload } from '@/services/uploads'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/uploads/<id>          → the upload record (status, extracted fields)
 * GET /api/uploads/<id>?file=1   → the file itself (private; never a public URL)
 * Staff: any upload in their organisation. Clients: only their own.
 */
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 })
  if (!hasDatabase()) return NextResponse.json({ error: 'Database not configured.' }, { status: 503 })

  const upload = await getUpload(session.oid, params.id)
  if (!upload) return NextResponse.json({ error: 'Not found.' }, { status: 404 })
  if (!isStaffRole(session.role)) {
    const client = await clientForUser(session.uid)
    const mine = (client && upload.clientId === client.id) || upload.userId === session.uid
    if (!mine) return NextResponse.json({ error: 'Not found.' }, { status: 404 })
  }

  const wantsFile = new URL(request.url).searchParams.get('file') === '1'
  if (!wantsFile) return NextResponse.json({ ok: true, upload })

  const file = await getObject(upload.storagePath)
  if (!file) return NextResponse.json({ error: 'File is no longer available.' }, { status: 404 })
  await audit({ organizationId: session.oid, actorUserId: session.uid, action: 'upload.downloaded', target: upload.id })
  return new Response(Buffer.from(file.bytes), {
    headers: {
      'Content-Type': upload.mimetype,
      'Content-Disposition': `inline; filename="${upload.filename.replace(/"/g, '')}"`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}

/** Clients confirm or correct what was read from their document. Body: { confirmed: boolean, corrections?: {..} } */
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 })
  const upload = await getUpload(session.oid, params.id)
  if (!upload) return NextResponse.json({ error: 'Not found.' }, { status: 404 })
  if (!isStaffRole(session.role)) {
    const client = await clientForUser(session.uid)
    if (!((client && upload.clientId === client.id) || upload.userId === session.uid)) return NextResponse.json({ error: 'Not found.' }, { status: 404 })
  }
  let body: { confirmed?: boolean; corrections?: Record<string, string> } = {}
  try {
    body = (await request.json()) as typeof body
  } catch {
    body = {}
  }
  const sql = getSql()
  const extracted = (upload.extracted?.fields as Record<string, unknown>) ?? {}
  const data = body.confirmed ? { ...extracted, ...(body.corrections ?? {}) } : { rejected: true, ...(body.corrections ?? {}) }
  await sql`UPDATE uploads SET confirmed_at = now(), confirmed_data = ${sql.json(data as never)}, updated_at = now() WHERE id = ${upload.id}`
  await audit({ organizationId: session.oid, actorUserId: session.uid, action: body.confirmed ? 'upload.confirmed' : 'upload.corrected', target: upload.id })
  return NextResponse.json({ ok: true })
}

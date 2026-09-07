import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/server'
import { isStaffRole } from '@/lib/auth/session'
import { runInBackground } from '@/lib/background'
import { hasDatabase } from '@/lib/db/client'
import { storageConfigured } from '@/lib/storage/supabase'
import { audit } from '@/services/audit'
import { runJobs } from '@/services/jobs'
import { registerJobHandlers } from '@/services/jobs/handlers'
import { clientForUser } from '@/services/journey'
import { getUser } from '@/services/users'
import { storeUpload, uploadAllowed, type Extracted } from '@/services/uploads'
import type { UploadKind } from '@/types/platform'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300

const KINDS: UploadKind[] = ['id', 'policy', 'claim', 'vehicle', 'receipt', 'photo', 'form', 'other']

/**
 * POST multipart/form-data { file, kind?, clientId? (staff only), caption? }
 * Clients upload to their own file; staff upload on behalf of a client in their organisation.
 * The file is stored privately, OCR runs in the background, and the response carries the upload id.
 */
export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 })
  if (!hasDatabase()) return NextResponse.json({ error: 'Database not configured.' }, { status: 503 })
  if (!storageConfigured()) return NextResponse.json({ error: 'Document storage is not configured yet.' }, { status: 503 })

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Send the file as multipart form data.' }, { status: 400 })
  }
  const file = form.get('file')
  if (!(file instanceof File)) return NextResponse.json({ error: 'Choose a file.' }, { status: 400 })
  const check = uploadAllowed(file.type, file.size)
  if (!check.ok) return NextResponse.json({ error: check.reason }, { status: 400 })
  const kindRaw = String(form.get('kind') ?? 'other')
  const kind = (KINDS.includes(kindRaw as UploadKind) ? kindRaw : 'other') as UploadKind
  const caption = String(form.get('caption') ?? '').trim().slice(0, 300) || null

  const staff = isStaffRole(session.role)
  let clientId: string | null = null
  let phone: string | null = null
  if (staff) {
    const requested = String(form.get('clientId') ?? '').trim() || null
    if (requested) {
      const { getSql } = await import('@/lib/db/client')
      const rows = await getSql()`SELECT id, phone FROM clients WHERE id = ${requested} AND organization_id = ${session.oid} LIMIT 1`
      if (!rows[0]) return NextResponse.json({ error: 'That client is not in your agency.' }, { status: 404 })
      clientId = String(rows[0].id)
      phone = rows[0].phone ? String(rows[0].phone) : null
    }
  } else {
    const client = await clientForUser(session.uid)
    const user = await getUser(session.uid)
    clientId = client?.id ?? null
    phone = user?.phone ?? null
  }

  try {
    const bytes = new Uint8Array(await file.arrayBuffer())
    const upload = await storeUpload({ organizationId: session.oid, clientId, userId: session.uid, phone, source: staff ? 'agency' : 'web', bytes, mimetype: file.type, filename: file.name, kind, caption })
    await audit({ organizationId: session.oid, actorUserId: session.uid, action: 'upload.created', target: upload.id, detail: { kind, source: upload.source } })
    registerJobHandlers()
    if (!runInBackground(async () => void (await runJobs(3, 240_000)))) await runJobs(3, 240_000)
    return NextResponse.json({ ok: true, id: upload.id, filename: upload.filename, status: upload.ocrStatus })
  } catch (error) {
    console.error('upload failed', error instanceof Error ? error.message : error)
    return NextResponse.json({ error: "We couldn't store that file right now. Please try again." }, { status: 500 })
  }
}

export type { Extracted }

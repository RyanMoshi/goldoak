import { chat, describeImage, ocrImage, parseJson } from '@/lib/ai/provider'
import { getSql } from '@/lib/db/client'
import { ensureSchema } from '@/lib/db/migrate'
import { toUpload, toUploadRow } from '@/lib/db/mappers'
import { newId } from '@/lib/ids'
import { getObject, putObject, storageConfigured } from '@/lib/storage/supabase'
import { enqueue } from '@/services/jobs'
import { notifyOrganization } from '@/services/notifications'
import type { Upload, UploadKind, UploadRow } from '@/types/platform'

/**
 * Files people send us. Stored privately, read by OCR in the background,
 * summarised back to the person for confirmation, and visible to the agency.
 */

export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'])

export function uploadAllowed(mimetype: string, size: number): { ok: true } | { ok: false; reason: string } {
  if (!ALLOWED.has(mimetype)) return { ok: false, reason: 'Send a photo (JPG, PNG) or a PDF.' }
  if (size > MAX_UPLOAD_BYTES) return { ok: false, reason: 'That file is larger than 15 MB. Please send a smaller copy.' }
  return { ok: true }
}

export const KIND_LABELS: Record<UploadKind, string> = {
  id: 'ID document',
  policy: 'Policy document',
  claim: 'Claim form',
  vehicle: 'Vehicle document',
  receipt: 'Receipt or invoice',
  photo: 'Photo of damage or property',
  form: 'Application form',
  other: 'Other document',
}

interface StoreInput {
  organizationId: string
  clientId: string | null
  userId: string | null
  phone: string | null
  source: Upload['source']
  bytes: Uint8Array
  mimetype: string
  filename: string | null
  kind?: UploadKind
  caption?: string | null
}

const EXT: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'application/pdf': 'pdf' }

/** Stores the file and queues OCR. Returns the upload row. */
export async function storeUpload(input: StoreInput): Promise<Upload> {
  await ensureSchema()
  const sql = getSql()
  const id = newId('upl')
  const ext = EXT[input.mimetype] ?? 'bin'
  const filename = (input.filename?.trim() || `${id}.${ext}`).replace(/[^\w.\-() ]/g, '_').slice(0, 120)
  const path = `${input.organizationId}/uploads/${id}.${ext}`
  await putObject(path, input.bytes, input.mimetype)
  const rows = await sql`INSERT INTO uploads (id, organization_id, client_id, user_id, phone, source, storage_path, filename, mimetype, size_bytes, kind, caption, ocr_status)
    VALUES (${id}, ${input.organizationId}, ${input.clientId}, ${input.userId}, ${input.phone}, ${input.source}, ${path}, ${filename}, ${input.mimetype}, ${input.bytes.byteLength}, ${input.kind ?? 'other'}, ${input.caption ?? null}, 'queued')
    RETURNING *`
  await enqueue({ type: 'ocr-upload', organizationId: input.organizationId, payload: { uploadId: id }, idempotencyKey: `ocr:${id}` })
  return toUpload(rows[0])
}

export interface Extracted {
  documentType?: string
  summary?: string
  fields?: Record<string, string>
  confidence?: 'high' | 'medium' | 'low'
}

const EXTRACT_PROMPT = `You read documents for an insurance agency in Kenya. From the text (and image if given), identify the document and pull out the useful fields.
Return JSON: {"documentType": one of ["national-id","passport","driving-licence","logbook","policy-schedule","policy-certificate","claim-form","receipt","invoice","police-abstract","assessor-report","photo-damage","other"], "summary": one sentence, "fields": {field: value, ...}, "confidence": "high"|"medium"|"low"}.
Useful fields when present: full_name, id_number, date_of_birth, phone, email, vehicle_registration, chassis_number, make_model, policy_number, insurer, product, sum_insured, premium, start_date, expiry_date, claim_reference, incident_date, amount, currency, address, issuer, document_date. Only include fields you can actually read; never invent values.`

/** Runs OCR and structured extraction for one upload (job handler). */
export async function processUpload(uploadId: string): Promise<void> {
  const sql = getSql()
  const rows = await sql`SELECT * FROM uploads WHERE id = ${uploadId} LIMIT 1`
  if (!rows[0]) return
  const upload = toUpload(rows[0])
  if (upload.ocrStatus === 'done') return
  await sql`UPDATE uploads SET ocr_status = 'processing', updated_at = now() WHERE id = ${uploadId}`

  const file = await getObject(upload.storagePath)
  if (!file) throw new Error('Stored file not found')

  let text: string | null = null
  let extracted: Extracted | null = null
  if (upload.mimetype === 'application/pdf') {
    text = await pdfText(file.bytes)
    if (text && text.trim().length > 20) {
      extracted = parseJson<Extracted>(await chat({ system: EXTRACT_PROMPT, messages: [{ role: 'user', content: text.slice(0, 12_000) }], json: true, maxTokens: 700 }))
    }
  } else {
    const image = { base64: Buffer.from(file.bytes).toString('base64'), mimetype: upload.mimetype }
    text = await ocrImage(image)
    const answer = await describeImage(image, `${EXTRACT_PROMPT}\n\nOCR text (may contain errors):\n${(text ?? '').slice(0, 6000)}`, { json: true, maxTokens: 700 })
    extracted = parseJson<Extracted>(answer)
    if (!extracted && text) extracted = parseJson<Extracted>(await chat({ system: EXTRACT_PROMPT, messages: [{ role: 'user', content: text.slice(0, 12_000) }], json: true, maxTokens: 700 }))
  }

  const status = text || extracted ? 'done' : 'skipped'
  await sql`UPDATE uploads SET ocr_status = ${status}, ocr_text = ${text ? text.slice(0, 20_000) : null}, extracted = ${extracted ? sql.json(extracted as never) : null}, updated_at = now() WHERE id = ${uploadId}`
  if (status === 'skipped') await sql`UPDATE uploads SET ocr_text = NULL WHERE id = ${uploadId}`

  await notifyOrganization(upload.organizationId, {
    clientId: upload.clientId,
    kind: 'task',
    title: `Document received${extracted?.documentType ? `: ${extracted.documentType.replace(/-/g, ' ')}` : ''}`,
    body: `${extracted?.summary ?? upload.filename}. Review it under Documents.`,
    reference: `upload:${uploadId}`,
    inAppOnly: true,
  })
}

async function pdfText(bytes: Uint8Array): Promise<string | null> {
  try {
    const mod: unknown = await import('pdf-parse')
    const parse = (typeof mod === 'function' ? mod : (mod as { default?: unknown }).default) as ((data: Buffer) => Promise<{ text: string }>) | undefined
    if (!parse) return null
    const result = await parse(Buffer.from(bytes))
    return result.text?.trim() || null
  } catch (error) {
    console.error('pdf text failed', error instanceof Error ? error.message : error)
    return null
  }
}

/** Human-readable lines from the extracted fields, for WhatsApp and the dashboard. */
export function extractedLines(extracted: Record<string, unknown> | null): string[] {
  if (!extracted) return []
  const fields = (extracted.fields as Record<string, unknown>) ?? {}
  return Object.entries(fields)
    .filter(([, v]) => v != null && String(v).trim())
    .slice(0, 12)
    .map(([k, v]) => `${k.replace(/_/g, ' ')}: ${String(v)}`)
}

export async function confirmUpload(uploadId: string, organizationId: string, confirmed: boolean, corrections?: Record<string, string>): Promise<void> {
  const sql = getSql()
  const rows = await sql`SELECT extracted FROM uploads WHERE id = ${uploadId} AND organization_id = ${organizationId} LIMIT 1`
  if (!rows[0]) return
  const extracted = (rows[0].extracted as Record<string, unknown>) ?? {}
  const data = confirmed ? { ...((extracted.fields as Record<string, unknown>) ?? {}), ...(corrections ?? {}) } : { rejected: true, ...(corrections ?? {}) }
  await sql`UPDATE uploads SET confirmed_at = now(), confirmed_data = ${sql.json(data as never)}, updated_at = now() WHERE id = ${uploadId}`
}

export async function getUpload(organizationId: string, uploadId: string): Promise<Upload | null> {
  await ensureSchema()
  const sql = getSql()
  const rows = await sql`SELECT * FROM uploads WHERE id = ${uploadId} AND organization_id = ${organizationId} LIMIT 1`
  return rows[0] ? toUpload(rows[0]) : null
}

export async function latestUploadForPhone(organizationId: string, phone: string): Promise<Upload | null> {
  const sql = getSql()
  const rows = await sql`SELECT * FROM uploads WHERE organization_id = ${organizationId} AND phone = ${phone} ORDER BY created_at DESC LIMIT 1`
  return rows[0] ? toUpload(rows[0]) : null
}

export async function listUploads(organizationId: string, limit = 100): Promise<UploadRow[]> {
  await ensureSchema()
  const sql = getSql()
  const rows = await sql`SELECT u.*, c.name AS client_name FROM uploads u LEFT JOIN clients c ON c.id = u.client_id WHERE u.organization_id = ${organizationId} ORDER BY u.created_at DESC LIMIT ${limit}`
  return rows.map(toUploadRow)
}

export async function listUploadsForClient(clientId: string, limit = 50): Promise<Upload[]> {
  await ensureSchema()
  const sql = getSql()
  const rows = await sql`SELECT * FROM uploads WHERE client_id = ${clientId} ORDER BY created_at DESC LIMIT ${limit}`
  return rows.map(toUpload)
}

export async function markUploadReviewed(organizationId: string, uploadId: string, reviewerId: string, kind?: UploadKind): Promise<void> {
  const sql = getSql()
  await sql`UPDATE uploads SET reviewed_by = ${reviewerId}, reviewed_at = now(), kind = COALESCE(${kind ?? null}, kind), updated_at = now() WHERE id = ${uploadId} AND organization_id = ${organizationId}`
}

export function uploadsReady(): boolean {
  return storageConfigured()
}

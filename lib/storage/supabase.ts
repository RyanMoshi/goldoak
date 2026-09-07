/**
 * Private object storage on Supabase Storage, through its REST API with the
 * service-role key. Files are never public: every download goes through an
 * authenticated API route that checks the tenant first.
 */

const BUCKET = process.env.STORAGE_BUCKET ?? 'documents'

function base(): string | null {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  return url ? url.replace(/\/$/, '') : null
}

function key(): string | null {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || null
}

export function storageConfigured(): boolean {
  return Boolean(base() && key())
}

function headers(extra: Record<string, string> = {}): Record<string, string> {
  const k = key() ?? ''
  return { Authorization: `Bearer ${k}`, apikey: k, ...extra }
}

let bucketReady: Promise<void> | null = null

async function ensureBucket(): Promise<void> {
  if (!bucketReady) {
    bucketReady = (async () => {
      const res = await fetch(`${base()}/storage/v1/bucket/${BUCKET}`, { headers: headers() })
      if (res.ok) return
      const create = await fetch(`${base()}/storage/v1/bucket`, {
        method: 'POST',
        headers: headers({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ id: BUCKET, name: BUCKET, public: false, file_size_limit: 26_214_400 }),
      })
      if (!create.ok && create.status !== 409) throw new Error(`Could not create bucket: ${create.status} ${(await create.text()).slice(0, 200)}`)
    })().catch((error) => {
      bucketReady = null
      throw error
    })
  }
  return bucketReady
}

/** Uploads bytes under `path` (e.g. org_x/uploads/upl_y.jpg). Returns the storage path. */
export async function putObject(path: string, bytes: Uint8Array, mimetype: string): Promise<string> {
  if (!storageConfigured()) throw new Error('Storage is not configured')
  await ensureBucket()
  const res = await fetch(`${base()}/storage/v1/object/${BUCKET}/${path}`, {
    method: 'POST',
    headers: headers({ 'Content-Type': mimetype, 'x-upsert': 'true' }),
    body: Buffer.from(bytes),
  })
  if (!res.ok) throw new Error(`Upload failed: ${res.status} ${(await res.text()).slice(0, 200)}`)
  return path
}

export async function getObject(path: string): Promise<{ bytes: Uint8Array; mimetype: string } | null> {
  if (!storageConfigured()) return null
  const res = await fetch(`${base()}/storage/v1/object/${BUCKET}/${path}`, { headers: headers() })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`Download failed: ${res.status}`)
  return { bytes: new Uint8Array(await res.arrayBuffer()), mimetype: res.headers.get('content-type') ?? 'application/octet-stream' }
}

export async function deleteObject(path: string): Promise<void> {
  if (!storageConfigured()) return
  await fetch(`${base()}/storage/v1/object/${BUCKET}`, { method: 'DELETE', headers: headers({ 'Content-Type': 'application/json' }), body: JSON.stringify({ prefixes: [path] }) })
}

/** A short-lived signed URL, for handing a file to the WhatsApp gateway to send. */
export async function signedUrl(path: string, expiresInSeconds = 600): Promise<string | null> {
  if (!storageConfigured()) return null
  const res = await fetch(`${base()}/storage/v1/object/sign/${BUCKET}/${path}`, {
    method: 'POST',
    headers: headers({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ expiresIn: expiresInSeconds }),
  })
  if (!res.ok) return null
  const json = (await res.json()) as { signedURL?: string }
  return json.signedURL ? `${base()}/storage/v1${json.signedURL}` : null
}

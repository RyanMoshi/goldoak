'use server'

import { requireAgencyAdmin } from '@/lib/auth/server'
import { newId } from '@/lib/ids'
import { putObject, storageConfigured } from '@/lib/storage/supabase'
import type { CampaignMedia } from '@/types/campaigns'

/**
 * Uploading the picture or document a campaign carries.
 *
 * It happens when the file is chosen rather than when the campaign is saved,
 * so a fifteen-megabyte attachment is not re-sent on every edit. The file is
 * stored under the agency's own prefix, and the type is decided from the bytes
 * we accept rather than from the name the browser supplied.
 */

const ALLOWED: Record<string, 'image' | 'document'> = {
  'image/jpeg': 'image',
  'image/png': 'image',
  'image/webp': 'image',
  'application/pdf': 'document',
}

const MAX_BYTES = 15 * 1024 * 1024

export interface MediaState {
  error?: string
  media?: CampaignMedia
}

export async function uploadCampaignMediaAction(formData: FormData): Promise<MediaState> {
  const session = await requireAgencyAdmin()
  if (!storageConfigured()) return { error: 'File storage is not switched on for this platform yet.' }

  const file = formData.get('file')
  if (!(file instanceof File) || !file.size) return { error: 'Choose a file first.' }
  if (file.size > MAX_BYTES) return { error: 'That file is over 15 MB. Compress it, or share a link instead.' }

  const kind = ALLOWED[file.type]
  if (!kind) return { error: 'Attach a JPEG, PNG, WebP or PDF.' }

  // Keep the name readable but harmless: no directories, no surprises.
  const safeName = (file.name || 'attachment')
    .replace(/[^\w.\- ]+/g, '')
    .replace(/\s+/g, '-')
    .slice(-80) || 'attachment'
  const path = `${session.oid}/campaigns/${newId('cmd')}-${safeName}`

  try {
    const bytes = new Uint8Array(await file.arrayBuffer())
    await putObject(path, bytes, file.type)
  } catch (error) {
    console.error('campaign media upload failed', error instanceof Error ? error.message : error)
    return { error: 'That upload did not finish. Please try again.' }
  }

  return { media: { path, filename: safeName, mimetype: file.type, kind } }
}

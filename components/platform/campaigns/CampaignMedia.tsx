'use client'

import { FileText, ImageIcon, Loader2, Paperclip, X } from 'lucide-react'
import { useRef, useState, useTransition } from 'react'
import { uploadCampaignMediaAction } from '@/lib/campaigns/media-actions'
import type { CampaignMedia as Media } from '@/types/campaigns'

/**
 * A picture or a document to go with the message.
 *
 * It is uploaded once, when it is chosen, rather than travelling with the form
 * on every save. The campaign keeps a path; the send hands out a signed link.
 * On WhatsApp the message becomes the caption, so the recipient gets one item
 * instead of two.
 */

const ACCEPT = 'image/jpeg,image/png,image/webp,application/pdf'
const MAX_BYTES = 15 * 1024 * 1024

export function CampaignMediaField({ initial }: { initial: Media | null }) {
  const [media, setMedia] = useState<Media | null>(initial)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  function choose(file: File) {
    setError(null)
    if (file.size > MAX_BYTES) {
      setError('That file is over 15 MB. Compress it, or share a link instead.')
      return
    }
    const data = new FormData()
    data.set('file', file)
    startTransition(async () => {
      const r = await uploadCampaignMediaAction(data)
      if (r.error) setError(r.error)
      else if (r.media) setMedia(r.media)
    })
  }

  const Icon = media?.kind === 'image' ? ImageIcon : FileText

  return (
    <div>
      {/* What the form submits. Cleared to an empty string when removed, which
          is how the save tells the difference between "unchanged" and "gone". */}
      <input type="hidden" name="mediaPath" value={media?.path ?? ''} />
      <input type="hidden" name="mediaFilename" value={media?.filename ?? ''} />
      <input type="hidden" name="mediaMimetype" value={media?.mimetype ?? ''} />
      <input type="hidden" name="mediaKind" value={media?.kind ?? ''} />

      {media ? (
        <div className="flex items-center justify-between gap-3 rounded-control border border-line bg-surface px-3.5 py-3">
          <span className="flex min-w-0 items-center gap-2.5">
            <Icon className="size-5 shrink-0 text-forest" aria-hidden="true" />
            <span className="min-w-0">
              <span className="block truncate text-[13.5px] font-semibold text-ink">{media.filename}</span>
              <span className="block text-[12px] text-ink-muted">{media.kind === 'image' ? 'Sent as a picture, with your message as the caption' : 'Sent as a document, with your message as the caption'}</span>
            </span>
          </span>
          <button
            type="button"
            onClick={() => setMedia(null)}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-control text-ink-muted transition-colors hover:bg-surface-3 hover:text-ink focus-ring"
            aria-label={`Remove ${media.filename}`}
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={pending}
          className="inline-flex h-10 items-center gap-2 rounded-control border border-line bg-surface px-3.5 text-[13.5px] font-semibold text-ink transition-colors hover:border-ink-muted disabled:opacity-60 focus-ring"
        >
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Paperclip className="size-4" aria-hidden="true" />}
          {pending ? 'Uploading…' : 'Attach a picture or document'}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) choose(f)
          e.target.value = ''
        }}
      />

      {error ? (
        <p role="alert" className="mt-2 rounded-control border border-error/25 bg-error/10 px-3 py-2 text-[13px] text-error">
          {error}
        </p>
      ) : null}
      <p className="mt-2 text-[12.5px] text-ink-faint">JPEG, PNG, WebP or PDF, up to 15 MB. Email recipients get it as a button under the message.</p>
    </div>
  )
}

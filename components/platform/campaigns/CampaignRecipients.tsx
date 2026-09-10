'use client'

import { Loader2, Phone, Plus } from 'lucide-react'
import { useState, useTransition } from 'react'
import { Select, TextArea, TextInput } from '@/components/platform/ui/Form'
import { importNumbersAction } from '@/lib/numbers/actions'

/**
 * Adding people to a campaign without leaving it.
 *
 * The audience filters above reach clients. This is for everyone else: the
 * list an agency was handed this morning. Numbers pasted here go into the
 * agency's book under a list of their own, so the campaign can target them and
 * the next campaign can reuse them.
 */
export function CampaignRecipients({
  campaignName,
  countries,
  defaultCountry,
  onImported,
}: {
  campaignName: string
  countries: { code: string; label: string }[]
  defaultCountry: string
  onImported: (listName: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [listName, setListName] = useState('')
  const [country, setCountry] = useState(defaultCountry)
  const [pending, startTransition] = useTransition()
  const [notice, setNotice] = useState<{ ok: boolean; message: string } | null>(null)

  const lines = text.split(/\r?\n/).filter((l) => l.trim()).length
  const target = (listName.trim() || campaignName.trim() || 'general').slice(0, 60)

  function add() {
    const data = new FormData()
    data.set('numbers', text)
    data.set('listName', target)
    data.set('country', country)
    startTransition(async () => {
      const r = await importNumbersAction(data)
      setNotice({ ok: !r.error, message: r.error ?? r.success ?? '' })
      if (!r.error) {
        setText('')
        onImported(target)
      }
    })
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 items-center gap-2 rounded-control border border-line bg-surface px-3.5 text-[13.5px] font-semibold text-ink transition-colors hover:border-ink-muted focus-ring"
      >
        <Plus className="size-4" aria-hidden="true" /> Paste numbers into this campaign
      </button>
    )
  }

  return (
    <div className="rounded-card border border-line bg-surface-2 p-4">
      <p className="flex items-center gap-2 text-[14px] font-bold text-ink">
        <Phone className="size-4 text-forest" aria-hidden="true" /> Add numbers to this campaign
      </p>
      <p className="mt-1 text-[12.5px] text-ink-muted">
        One per line. A name beside the number is picked up. These are saved to your number book, so you can use them again.
      </p>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <TextInput
          label="Save them as"
          value={listName}
          onChange={(e) => setListName(e.target.value)}
          placeholder={campaignName || 'general'}
          hint="A list name, so a later campaign can reuse this group."
        />
        <Select label="Country for local numbers" value={country} onChange={(e) => setCountry(e.target.value)} hint="Numbers with + or 00 keep their own.">
          {countries.map((c) => (
            <option key={c.code} value={c.code}>
              {c.label}
            </option>
          ))}
        </Select>
      </div>

      <TextArea
        label="Numbers"
        rows={6}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={'+254 712 345 678\n+255 742 473 493, Asha Mwinyi'}
        hint={lines ? `${lines.toLocaleString('en-KE')} line${lines === 1 ? '' : 's'} ready.` : undefined}
        className="mt-3"
      />

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={add}
          disabled={pending || !text.trim()}
          className="inline-flex h-10 items-center gap-2 rounded-control bg-forest px-4 text-[13.5px] font-semibold text-white transition-colors hover:bg-forest-700 disabled:opacity-60 focus-ring"
        >
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
          {pending ? 'Adding…' : 'Add to this campaign'}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="inline-flex h-10 items-center rounded-control px-3 text-[13.5px] font-semibold text-ink-muted hover:text-ink focus-ring">
          Done
        </button>
      </div>

      {notice ? (
        <p
          role={notice.ok ? 'status' : 'alert'}
          className={
            notice.ok
              ? 'mt-3 rounded-control border border-success/25 bg-success/10 px-3 py-2 text-[13px] text-ink'
              : 'mt-3 rounded-control border border-error/25 bg-error/10 px-3 py-2 text-[13px] text-error'
          }
        >
          {notice.message}
        </p>
      ) : null}
    </div>
  )
}

'use client'

import { Loader2, Upload } from 'lucide-react'
import { useRef, useState, useTransition } from 'react'
import { Card, CardHeader } from '@/components/platform/ui/Card'
import { Select, TextArea, TextInput } from '@/components/platform/ui/Form'
import { importNumbersAction, type NumbersState } from '@/lib/numbers/actions'

/**
 * Bringing a list in. An agency's numbers arrive as a column pasted out of a
 * spreadsheet, or a file exported from one, so both are accepted and read the
 * same way: one number per line, optionally with a name beside it.
 */
export function ImportNumbers({ countries, defaultCountry, lists }: { countries: { code: string; label: string }[]; defaultCountry: string; lists: string[] }) {
  const [state, setState] = useState<NumbersState>({})
  const [pending, startTransition] = useTransition()
  const [text, setText] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const lineCount = text.split(/\r?\n/).filter((l) => l.trim()).length

  function readFile(file: File) {
    const reader = new FileReader()
    reader.onload = () => setText(String(reader.result ?? '').slice(0, 2_000_000))
    reader.readAsText(file)
  }

  return (
    <Card className="p-5">
      <CardHeader
        title="Add numbers"
        description="Paste a column from a spreadsheet, or drop in a CSV. One number per line; a name beside it is picked up automatically."
      />
      <form
        className="mt-4 space-y-4"
        action={(formData) =>
          startTransition(async () => {
            const r = await importNumbersAction(formData)
            setState(r)
            if (r.success) setText('')
          })
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            name="listName"
            label="List name"
            defaultValue={lists[0] ?? 'general'}
            list="known-lists"
            hint="Group numbers so a campaign can target one list."
          />
          <datalist id="known-lists">
            {lists.map((l) => (
              <option key={l} value={l} />
            ))}
          </datalist>
          <Select name="country" label="Country for local numbers" defaultValue={defaultCountry} hint="Numbers written with + or 00 keep their own country.">
            {countries.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </Select>
        </div>

        <TextArea
          name="numbers"
          label="Numbers"
          rows={8}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={'+254 712 345 678\n+255 742 473 493, Asha Mwinyi\n0712345678'}
          hint={lineCount ? `${lineCount.toLocaleString('en-KE')} line${lineCount === 1 ? '' : 's'} ready.` : 'Up to 20,000 lines at a time.'}
        />

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex h-10 items-center gap-2 rounded-control border border-line bg-surface px-3.5 text-[13.5px] font-semibold text-ink transition-colors hover:border-ink-muted focus-ring"
          >
            <Upload className="size-4" aria-hidden="true" /> Load a CSV or text file
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.txt,text/csv,text/plain"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) readFile(f)
              e.target.value = ''
            }}
          />
          <button
            type="submit"
            disabled={pending || !text.trim()}
            className="inline-flex h-10 items-center gap-2 rounded-control bg-forest px-4 text-[13.5px] font-semibold text-white transition-colors hover:bg-forest-700 disabled:opacity-60 focus-ring"
          >
            {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
            {pending ? 'Adding…' : 'Add to the book'}
          </button>
        </div>

        {state.error ? (
          <p role="alert" className="rounded-control border border-error/25 bg-error/10 px-3 py-2 text-[13px] text-error">
            {state.error}
          </p>
        ) : null}
        {state.success ? <p className="rounded-control border border-success/25 bg-success/10 px-3 py-2 text-[13px] text-ink">{state.success}</p> : null}

        {state.report?.invalid.length ? (
          <details className="rounded-control border border-line bg-surface-2 px-3 py-2">
            <summary className="cursor-pointer text-[13px] font-semibold text-ink">
              {state.report.invalid.length} line{state.report.invalid.length === 1 ? '' : 's'} could not be read
            </summary>
            <ul className="mt-2 space-y-1">
              {state.report.invalid.map((row, i) => (
                <li key={i} className="flex flex-wrap gap-2 text-[12.5px] text-ink-muted">
                  <code className="rounded bg-surface-3 px-1.5 py-0.5 font-mono text-ink">{row.line}</code>
                  <span>{row.reason}</span>
                </li>
              ))}
            </ul>
          </details>
        ) : null}
      </form>
    </Card>
  )
}

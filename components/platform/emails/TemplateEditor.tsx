'use client'

import { Eye, Loader2, RotateCcw, Save } from 'lucide-react'
import { useState, useTransition } from 'react'
import { Field, inputClass } from '@/components/platform/auth/AuthShell'
import { Badge } from '@/components/platform/ui/Badge'
import { Card, CardHeader } from '@/components/platform/ui/Card'
import { StatusLine } from '@/components/platform/ui/PageHeader'
import { saveTemplateAction } from '@/lib/emails/actions'
import type { TemplateOverrideRow } from '@/services/emails'

/**
 * Customise subject, heading and intro of the templates that allow it.
 * Codes, links and security wording are fixed by the platform.
 */
export function TemplateEditor({ templates, scope }: { templates: TemplateOverrideRow[]; scope: 'global' | 'agency' }) {
  const [selected, setSelected] = useState(templates[0]?.key ?? '')
  const [state, setState] = useState<{ error?: string; success?: string }>({})
  const [pending, startTransition] = useTransition()
  const t = templates.find((x) => x.key === selected)

  function submit(formData: FormData) {
    setState({})
    startTransition(async () => setState(await saveTemplateAction(formData)))
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <Card as="section" flush className="lg:col-span-4">
        <div className="px-5 pb-3 pt-5">
          <CardHeader title="Templates" description={scope === 'global' ? 'Platform defaults for every agency.' : 'Your wording on top of the platform defaults.'} />
        </div>
        <ul className="divide-y divide-divider border-t border-line">
          {templates.map((x) => (
            <li key={x.key}>
              <button type="button" onClick={() => setSelected(x.key)} className={`flex w-full items-center justify-between gap-3 px-5 py-3 text-left text-[13.5px] hover:bg-surface-3 focus-ring ${x.key === selected ? 'bg-surface-3 font-bold text-ink' : 'text-ink'}`}>
                <span className="min-w-0">
                  <span className="block truncate">{x.label}</span>
                  <span className="block text-[11.5px] text-ink-faint">{x.category}</span>
                </span>
                <Badge tone={x.source === 'agency' ? 'gold' : x.source === 'global' ? 'info' : 'neutral'}>{x.source}</Badge>
              </button>
            </li>
          ))}
        </ul>
      </Card>
      {t ? (
        <Card as="section" className="lg:col-span-8">
          <CardHeader title={t.label} description={t.customisable.length ? `You can change: ${t.customisable.join(', ')}. Variables: ${t.variables.map((v) => `{{${v}}}`).join(' ')}` : 'This template is fixed for security.'} aside={<a href={`/api/emails/preview?key=${t.key}${scope === 'global' ? '&scope=global' : ''}`} target="_blank" rel="noopener" className="inline-flex h-9 items-center gap-1.5 rounded-control border border-line px-3 text-[13px] font-semibold text-ink hover:border-ink-muted focus-ring"><Eye className="size-4" aria-hidden="true" /> Preview</a>} />
          <form key={t.key} action={submit} className="mt-5 space-y-4" noValidate>
            <input type="hidden" name="key" value={t.key} />
            <input type="hidden" name="scope" value={scope} />
            {t.customisable.includes('subject') || scope === 'global' ? (
              <Field label="Subject" htmlFor="tpl-subject" hint="Leave blank for the default.">
                <input id="tpl-subject" name="subject" defaultValue={t.subject ?? ''} className={inputClass} />
              </Field>
            ) : null}
            {t.customisable.includes('heading') || scope === 'global' ? (
              <Field label="Heading" htmlFor="tpl-heading">
                <input id="tpl-heading" name="heading" defaultValue={t.heading ?? ''} className={inputClass} />
              </Field>
            ) : null}
            {t.customisable.includes('body') || scope === 'global' ? (
              <Field label="Intro paragraph" htmlFor="tpl-body" hint="Plain text; **bold** allowed. Details, codes and buttons are added by the platform.">
                <textarea id="tpl-body" name="body" defaultValue={t.body ?? ''} maxLength={2000} className={`${inputClass} h-auto min-h-[120px] resize-y py-2.5`} />
              </Field>
            ) : null}
            {t.customisable.length || scope === 'global' ? (
              <div className="flex flex-wrap gap-2">
                <button type="submit" disabled={pending} className="inline-flex h-11 items-center gap-2 rounded-control bg-forest px-5 text-[14px] font-semibold text-white hover:bg-forest-700 disabled:opacity-60 focus-ring">
                  {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Save className="size-4" aria-hidden="true" />}
                  {pending ? 'Saving…' : 'Save wording'}
                </button>
                <button type="submit" name="reset" value="1" disabled={pending} className="inline-flex h-11 items-center gap-2 rounded-control border border-line px-4 text-[13.5px] font-semibold text-ink hover:border-ink-muted disabled:opacity-60 focus-ring">
                  <RotateCcw className="size-4" aria-hidden="true" /> Reset to default
                </button>
              </div>
            ) : null}
          </form>
          <StatusLine success={state.success} error={state.error} onDismiss={() => setState({})} />
        </Card>
      ) : null}
    </div>
  )
}

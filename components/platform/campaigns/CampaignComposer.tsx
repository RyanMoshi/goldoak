'use client'

import { Mail, MessageSquare, Users } from 'lucide-react'
import { useState, useTransition } from 'react'
import { Card, CardHeader } from '@/components/platform/ui/Card'
import { CheckboxField, Field, FormActions, Select, SubmitButton, TextArea, TextInput } from '@/components/platform/ui/Form'
import { StatusLine } from '@/components/platform/ui/PageHeader'
import { cn } from '@/lib/cn'
import { createCampaignAction, previewAudienceAction, updateCampaignAction, type CampaignState } from '@/lib/campaigns/actions'
import { JOURNEY_STAGES } from '@/types/platform'
import type { Campaign, CampaignChannel } from '@/types/campaigns'

/**
 * Composing a campaign: pick the channel, describe the audience, write the
 * message. The audience preview runs the same query the send uses, so the
 * count shown here is the count that receives it — no surprises at launch.
 */

const CHANNELS: { id: CampaignChannel; label: string; hint: string; icon: typeof Mail }[] = [
  { id: 'email', label: 'Email', hint: 'Branded HTML email with an unsubscribe link.', icon: Mail },
  { id: 'whatsapp', label: 'WhatsApp', hint: 'Plain text from your agency number.', icon: MessageSquare },
  { id: 'both', label: 'Both', hint: 'Email where you have an address, WhatsApp where you have a number.', icon: Users },
]

const TYPES = [
  { id: 'individual', label: 'Individuals' },
  { id: 'sme', label: 'SMEs' },
  { id: 'corporate', label: 'Corporates' },
]

export function CampaignComposer({ campaign, numberLists = [] }: { campaign?: Campaign; numberLists?: { name: string; count: number }[] }) {
  const [state, setState] = useState<CampaignState>({})
  const [pending, startTransition] = useTransition()
  const [channel, setChannel] = useState<CampaignChannel>(campaign?.channel ?? 'email')
  const [previewing, startPreview] = useTransition()

  function submit(formData: FormData) {
    startTransition(async () => {
      const result = campaign ? await updateCampaignAction(campaign.id, formData) : await createCampaignAction(formData)
      if (result) setState(result)
    })
  }

  function preview(form: HTMLFormElement) {
    const data = new FormData(form)
    startPreview(async () => setState(await previewAudienceAction(data)))
  }

  return (
    <form action={submit} className="space-y-6" noValidate>
      <Card as="section">
        <CardHeader title="Channel" description="Where this campaign goes out." />
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {CHANNELS.map((c) => {
            const Icon = c.icon
            const active = channel === c.id
            return (
              <label
                key={c.id}
                className={cn(
                  'flex cursor-pointer flex-col gap-1 rounded-card border p-3.5 transition-colors focus-within:ring-1 focus-within:ring-forest',
                  active ? 'border-forest bg-forest-100' : 'border-line bg-surface hover:border-ink-faint',
                )}
              >
                <span className="flex items-center gap-2">
                  <input type="radio" name="channel" value={c.id} checked={active} onChange={() => setChannel(c.id)} className="sr-only" />
                  <Icon className={cn('size-4', active ? 'text-forest' : 'text-ink-muted')} aria-hidden="true" />
                  <span className={cn('text-[14px] font-bold', active ? 'text-forest' : 'text-ink')}>{c.label}</span>
                </span>
                <span className="text-[12.5px] leading-4 text-ink-muted">{c.hint}</span>
              </label>
            )
          })}
        </div>
      </Card>

      <Card as="section">
        <CardHeader title="Audience" description="Leave everything unticked to reach every client of your agency." />
        <div className="mt-5 space-y-4">
          <Field label="Journey stage" hint="Only clients at these stages.">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {JOURNEY_STAGES.map((s) => (
                <CheckboxField key={s.id} name="stages" value={s.id} label={s.label} defaultChecked={campaign?.audience.stages?.includes(s.id)} />
              ))}
            </div>
          </Field>
          <Field label="Client type">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {TYPES.map((t) => (
                <CheckboxField key={t.id} name="types" value={t.id} label={t.label} defaultChecked={campaign?.audience.types?.includes(t.id)} />
              ))}
            </div>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput
              label="Policy expiring within"
              name="expiringWithinDays"
              type="number"
              min={0}
              max={365}
              defaultValue={campaign?.audience.expiringWithinDays ?? ''}
              placeholder="e.g. 45"
              hint="Days. Leave blank to ignore expiry dates."
              optional
            />
            <div className="flex items-end">
              <CheckboxField name="includeLeads" label="Include leads without a login" description="People you have recorded but who have not signed in yet." defaultChecked={campaign?.audience.includeLeads !== false} />
            </div>
          </div>
          {numberLists.length ? (
            <div className="mt-4 rounded-card border border-line bg-surface-2 p-4">
              <CheckboxField
                name="includeNumbers"
                label="Also send to the number book"
                description="Numbers you have imported who are not clients yet. Anyone already reached as a client is not messaged twice."
                defaultChecked={campaign?.audience.includeNumbers === true}
              />
              <fieldset className="mt-3">
                <legend className="label-caps text-ink-muted">Lists</legend>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {numberLists.map((l) => (
                    <CheckboxField
                      key={l.name}
                      name="numberLists"
                      value={l.name}
                      label={`${l.name} (${l.count.toLocaleString('en-KE')})`}
                      defaultChecked={campaign?.audience.numberLists?.includes(l.name)}
                    />
                  ))}
                </div>
                <p className="mt-2 text-[12.5px] text-ink-faint">Leave every list unticked to use all of them.</p>
              </fieldset>
            </div>
          ) : null}
          <button
            type="button"
            disabled={previewing}
            onClick={(e) => preview(e.currentTarget.closest('form') as HTMLFormElement)}
            className="inline-flex h-10 items-center gap-2 rounded-control border border-line bg-surface px-3.5 text-[13.5px] font-semibold text-ink hover:border-ink-muted focus-ring disabled:opacity-60"
          >
            <Users className="size-4" aria-hidden="true" /> {previewing ? 'Counting…' : 'Who will this reach?'}
          </button>
          {state.audienceSize !== undefined ? (
            <p className="rounded-control border border-info/25 bg-info/10 px-3 py-2 text-[13px] text-ink" role="status">
              {state.success}
            </p>
          ) : null}
        </div>
      </Card>

      <Card as="section">
        <CardHeader title="Message" description="Use {{first_name}}, {{full_name}} or {{agency_name}} and they are filled in per person." />
        <div className="mt-5 space-y-4">
          <TextInput label="Campaign name" name="name" required defaultValue={campaign?.name ?? ''} placeholder="March renewals reminder" hint="Internal only; your clients never see this." error={state.field === 'name' ? state.error : undefined} />
          {channel !== 'whatsapp' ? (
            <TextInput label="Email subject" name="subject" required defaultValue={campaign?.subject ?? ''} placeholder="Your motor cover is due for renewal" error={state.field === 'subject' ? state.error : undefined} />
          ) : null}
          <TextArea
            label="Message"
            name="body"
            required
            rows={7}
            defaultValue={campaign?.body ?? ''}
            placeholder={'Hello {{first_name}},\n\nYour motor policy is up for renewal next month. We have already started shopping the market for you.\n\nReply to this message and we will take it from there.'}
            hint="Leave a blank line between paragraphs."
            error={state.field === 'body' ? state.error : undefined}
          />
          {channel !== 'whatsapp' ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput label="Button label" name="ctaLabel" defaultValue={campaign?.ctaLabel ?? ''} placeholder="See my cover" optional error={state.field === 'ctaLabel' ? state.error : undefined} />
              <TextInput label="Button link" name="ctaUrl" type="url" defaultValue={campaign?.ctaUrl ?? ''} placeholder="https://goldoak.vercel.app/portal" optional error={state.field === 'ctaUrl' ? state.error : undefined} />
            </div>
          ) : null}
        </div>
      </Card>

      <Card as="section">
        <CardHeader title="When" description="Leave blank to save as a draft you launch by hand." />
        <div className="mt-5">
          <TextInput
            label="Schedule for"
            name="scheduledAt"
            type="datetime-local"
            defaultValue={campaign?.scheduledAt ? campaign.scheduledAt.slice(0, 16) : ''}
            hint="Scheduled campaigns start on the next worker run after this time."
            optional
            error={state.field === 'scheduledAt' ? state.error : undefined}
          />
        </div>
      </Card>

      <StatusLine success={state.audienceSize === undefined ? state.success : undefined} error={!state.field ? state.error : undefined} onDismiss={() => setState({})} />
      <FormActions>
        <SubmitButton pending={pending} pendingLabel="Saving…">
          {campaign ? 'Save changes' : 'Save campaign'}
        </SubmitButton>
      </FormActions>
      <p className="text-center text-[12.5px] text-ink-faint sm:text-right">Saving does not send anything. You review the audience and launch on the next screen.</p>
    </form>
  )
}

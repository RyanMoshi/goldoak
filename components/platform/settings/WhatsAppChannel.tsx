'use client'

import { Loader2, MessageCircle, Power, RefreshCw, Smartphone } from 'lucide-react'
import { useCallback, useEffect, useState, useTransition } from 'react'
import { Field, inputClass } from '@/components/platform/auth/AuthShell'
import { Badge, type BadgeTone } from '@/components/platform/ui/Badge'
import { Card, CardHeader } from '@/components/platform/ui/Card'
import { StatusLine } from '@/components/platform/ui/PageHeader'
import { connectWhatsAppAction, disconnectWhatsAppAction, restartWhatsAppAction, type ActionState } from '@/lib/agency/actions'

interface Live {
  connected: boolean
  status?: string
  phone?: string | null
  pushName?: string | null
  qr?: string | null
  lastError?: string | null
  channel?: { id: string; label: string | null; createdAt: string }
}

const TONES: Record<string, BadgeTone> = { ready: 'success', qr_ready: 'gold', starting: 'info', connecting: 'info', authenticated: 'info', failed: 'error', disconnected: 'error', 'gateway-unreachable': 'error', pending: 'neutral' }
const LABELS: Record<string, string> = { ready: 'Connected', qr_ready: 'Waiting for QR scan', starting: 'Starting', connecting: 'Connecting', authenticated: 'Authenticated', failed: 'Failed', disconnected: 'Disconnected', 'gateway-unreachable': 'Gateway unreachable', pending: 'Pending' }

/** Connect, pair and manage the agency's own WhatsApp number. */
export function WhatsAppChannel({ canEdit, sharedJoinLink }: { canEdit: boolean; sharedJoinLink: string | null }) {
  const [live, setLive] = useState<Live | null>(null)
  const [state, setState] = useState<ActionState>({})
  const [pending, startTransition] = useTransition()
  const [label, setLabel] = useState('')

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/whatsapp/channel', { cache: 'no-store' })
      if (res.ok) setLive((await res.json()) as Live)
    } catch {
      /* keep the last state */
    }
  }, [])

  useEffect(() => {
    void refresh()
    const t = setInterval(() => void refresh(), 8000)
    return () => clearInterval(t)
  }, [refresh])

  function run(action: () => Promise<ActionState>) {
    setState({})
    startTransition(async () => {
      setState(await action())
      await refresh()
    })
  }

  const status = live?.status ?? 'pending'
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <Card as="section" className="lg:col-span-7">
        <CardHeader title="Your agency's WhatsApp number" description="Messages to this number reach your agency only. Your assistant answers in your name and your team replies from Conversations." />
        {live === null ? (
          <p className="mt-4 flex items-center gap-2 text-[13px] text-ink-muted">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Checking the gateway…
          </p>
        ) : !live.connected ? (
          <div className="mt-5 space-y-4">
            <p className="text-[14px] text-ink-muted">No number connected yet. Clients currently reach you through the shared Super Agent number with your join code. Connect your own number to give them a direct line.</p>
            {canEdit ? (
              <>
                <Field label="Label (optional)" htmlFor="wa-label" hint="For example “Main office line”.">
                  <input id="wa-label" value={label} onChange={(e) => setLabel(e.target.value)} className={inputClass} placeholder="Main office line" />
                </Field>
                <button type="button" disabled={pending} onClick={() => run(() => connectWhatsAppAction(label))} className="inline-flex h-11 items-center justify-center gap-2 rounded-control bg-forest px-5 text-[14px] font-semibold text-white hover:bg-forest-700 disabled:opacity-60 focus-ring">
                  {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Smartphone className="size-4" aria-hidden="true" />}
                  {pending ? 'Creating session…' : 'Connect a WhatsApp number'}
                </button>
              </>
            ) : (
              <p className="text-[13px] text-ink-muted">Only agency admins can connect a number.</p>
            )}
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge tone={TONES[status] ?? 'neutral'} dot>
                {LABELS[status] ?? status}
              </Badge>
              {live.phone ? <span className="font-mono text-[13px] text-ink">+{live.phone}</span> : null}
              {live.pushName ? <span className="text-[13px] text-ink-muted">as “{live.pushName}”</span> : null}
              {live.channel?.label ? <span className="text-[13px] text-ink-muted">· {live.channel.label}</span> : null}
            </div>
            {status === 'qr_ready' && live.qr ? (
              <div className="rounded-card border border-line bg-surface-3 p-4 text-center">
                <p className="text-[14px] font-semibold text-ink">Scan with the phone that holds your agency number</p>
                <p className="mt-1 text-[12.5px] text-ink-muted">WhatsApp → Linked devices → Link a device. The code refreshes automatically.</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={live.qr} alt="WhatsApp pairing QR code" className="mx-auto mt-3 size-56 rounded-card border border-line bg-white p-2" />
              </div>
            ) : null}
            {status === 'ready' ? <p className="text-[13.5px] text-ink-muted">Connected. Set the profile name on the phone to your agency name so people who have not saved you still see who is writing.</p> : null}
            {live.lastError ? <p className="rounded-control border border-error/25 bg-error/10 px-3 py-2 text-[13px] text-error">{live.lastError}</p> : null}
            {canEdit ? (
              <div className="flex flex-wrap gap-2">
                <button type="button" disabled={pending} onClick={() => run(restartWhatsAppAction)} className="inline-flex h-10 items-center gap-2 rounded-control border border-line bg-surface px-3 text-[13px] font-semibold text-ink hover:border-ink-muted disabled:opacity-60 focus-ring">
                  <RefreshCw className="size-4" aria-hidden="true" /> Restart session
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => {
                    if (window.confirm('Disconnect this number? Clients will fall back to the shared Super Agent number with your join code.')) run(disconnectWhatsAppAction)
                  }}
                  className="inline-flex h-10 items-center gap-2 rounded-control border border-line bg-surface px-3 text-[13px] font-semibold text-error hover:border-error disabled:opacity-60 focus-ring"
                >
                  <Power className="size-4" aria-hidden="true" /> Disconnect
                </button>
              </div>
            ) : null}
          </div>
        )}
        <StatusLine success={state.success} error={state.error} onDismiss={() => setState({})} />
      </Card>

      <Card as="section" className="lg:col-span-5">
        <CardHeader title="How it works" level={3} />
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-[13px] text-ink-muted">
          <li>Connect creates a dedicated session for your agency on the WhatsApp gateway.</li>
          <li>Scan the QR code with the phone that holds your business number. That number becomes your agency's line.</li>
          <li>Every message to it is routed to your agency: your assistant, your team, your clients. No join code needed.</li>
          <li>Replies, reminders and documents to your clients go out from this number.</li>
        </ol>
        {sharedJoinLink ? (
          <p className="mt-4 text-[13px] text-ink-muted">
            Without your own number, clients use the shared Super Agent line:{' '}
            <a href={sharedJoinLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-forest underline-offset-2 hover:underline">
              <MessageCircle className="size-3.5" aria-hidden="true" /> your join link
            </a>
            .
          </p>
        ) : null}
      </Card>
    </div>
  )
}

'use client'

import { useState, useTransition } from 'react'
import { Card, CardHeader } from '@/components/platform/ui/Card'
import { FormActions, SubmitButton, TextArea } from '@/components/platform/ui/Form'
import { StatusLine } from '@/components/platform/ui/PageHeader'
import { saveGlobalPolicyAction, type PolicyState } from '@/lib/superagent/actions'
import type { AiPolicy } from '@/services/ai-insights'

/**
 * The one layer every agency's assistant shares. Kept deliberately small: it
 * is prepended to every answer for every tenant, so anything agency-specific
 * belongs in that agency's own settings, not here.
 */
export function GlobalPolicyForm({ policy }: { policy: AiPolicy }) {
  const [state, setState] = useState<PolicyState>({})
  const [pending, startTransition] = useTransition()

  return (
    <form action={(fd) => startTransition(async () => setState(await saveGlobalPolicyAction(fd)))} className="space-y-6">
      <Card as="section">
        <CardHeader title="Platform rules" description="Applied on top of the built-in safety rules, for every agency. These override an agency's own instructions." />
        <div className="mt-5">
          <TextArea
            name="groundRules"
            rows={6}
            defaultValue={policy.groundRules}
            placeholder={'Never quote a premium as final.\nAlways say cover starts only once the insurer confirms.\nIf someone describes a medical emergency, tell them to call emergency services first.'}
            hint="One rule per line. Written as instructions to the assistant."
            optional
          />
        </div>
      </Card>

      <Card as="section">
        <CardHeader title="Shared knowledge" description="Facts true for every agency: regulation, market conventions, common definitions. Never put one agency's products or prices here." />
        <div className="mt-5">
          <TextArea
            name="knowledge"
            rows={8}
            defaultValue={policy.knowledge}
            placeholder={'Motor third-party insurance is compulsory in Kenya under the Insurance (Motor Vehicles Third Party Risks) Act.\nWIBA cover is required for every employer with employees.'}
            hint="Kept short: it is sent with every single answer."
            optional
          />
        </div>
      </Card>

      <Card as="section">
        <CardHeader title="Words to avoid" description="Phrases the assistant must never use, whatever an agency configures." />
        <div className="mt-5">
          <TextArea name="bannedPhrases" rows={3} defaultValue={policy.bannedPhrases} placeholder={'guaranteed payout\nbest insurer in Kenya\ncheapest cover'} hint="One per line." optional />
        </div>
      </Card>

      <StatusLine success={state.success} error={state.error} onDismiss={() => setState({})} />
      <FormActions>
        <SubmitButton pending={pending} pendingLabel="Saving…">
          Save policy
        </SubmitButton>
      </FormActions>
      {policy.updatedAt ? <p className="text-right text-[12px] text-ink-faint">Last changed {new Date(policy.updatedAt).toLocaleString('en-KE', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p> : null}
    </form>
  )
}

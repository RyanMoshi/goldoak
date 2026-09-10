'use server'

import { revalidatePath } from 'next/cache'
import { requireSession } from '@/lib/auth/server'
import { audit } from '@/services/audit'
import { saveGlobalPolicy } from '@/services/ai-insights'

/**
 * Super Agent console actions. Platform administrators only: these settings
 * apply to every agency's assistant, so they sit behind the same guard as the
 * rest of the platform area and are written to the audit trail.
 */

export interface PolicyState {
  error?: string
  success?: string
}

export async function saveGlobalPolicyAction(formData: FormData): Promise<PolicyState> {
  const session = await requireSession('admin')
  const groundRules = String(formData.get('groundRules') ?? '').trim()
  const knowledge = String(formData.get('knowledge') ?? '').trim()
  const bannedPhrases = String(formData.get('bannedPhrases') ?? '').trim()
  if (groundRules.length > 4000 || knowledge.length > 8000) return { error: 'That is longer than the assistant can carry on every answer. Trim it down.' }
  try {
    await saveGlobalPolicy({ groundRules, knowledge, bannedPhrases, updatedBy: session.uid })
    await audit({ organizationId: null, actorUserId: session.uid, action: 'ai.policy-updated', target: 'global', detail: { rules: groundRules.length, knowledge: knowledge.length } })
    revalidatePath('/super-admin/superagent/knowledge')
    revalidatePath('/super-admin/superagent/configuration')
    return { success: 'Saved. New answers use this within a minute.' }
  } catch (error) {
    console.error('saveGlobalPolicy failed', error instanceof Error ? error.message : error)
    return { error: 'Could not save the policy.' }
  }
}

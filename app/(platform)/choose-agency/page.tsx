import type { Metadata } from 'next'
import { AuthShell } from '@/components/platform/auth/AuthShell'
import { AgencyPicker } from '@/components/platform/auth/AgencyPicker'
import { requireAnySession } from '@/lib/auth/server'
import { listMemberships } from '@/services/memberships'
import { ROLE_LABELS } from '@/types/platform'

export const metadata: Metadata = { title: 'Choose an agency' }
export const dynamic = 'force-dynamic'

/** Shown after sign-in when one person belongs to several agencies. Data is never mixed across them. */
export default async function ChooseAgencyPage() {
  const session = await requireAnySession()
  const memberships = await listMemberships(session.uid)
  return (
    <AuthShell title="Which agency are you working with today?" intro="You belong to more than one agency. Each one has its own separate space; pick the one you want to open. You can switch later from your profile menu." aside={null}>
      <AgencyPicker options={memberships.map((m) => ({ id: m.organizationId, name: m.organizationName, role: ROLE_LABELS[m.role] }))} current={session.oid} />
    </AuthShell>
  )
}

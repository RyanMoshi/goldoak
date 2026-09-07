import type { Metadata } from 'next'
import { TeamManager } from '@/components/platform/team/TeamManager'
import { PageHeader } from '@/components/platform/ui/PageHeader'
import { requireAgencyAdmin } from '@/lib/auth/server'
import { listStaffUsers } from '@/services/users'

export const metadata: Metadata = { title: 'Team' }
export const dynamic = 'force-dynamic'

export default async function TeamPage() {
  const session = await requireAgencyAdmin()
  const users = await listStaffUsers(session.oid)
  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader eyebrow="Agency admin" title="Team" description="Your advisers and admins. Staff see the workspace; agency admins also manage the team and settings." />
      <TeamManager users={users} currentUserId={session.uid} />
    </div>
  )
}

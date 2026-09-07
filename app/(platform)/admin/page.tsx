import type { Metadata } from 'next'
import Link from 'next/link'
import { Activity, MessageSquare } from 'lucide-react'
import { AgencyAccounts } from '@/components/platform/admin/AgencyAccounts'
import { Organizations } from '@/components/platform/admin/Organizations'
import { Card } from '@/components/platform/ui/Card'
import { requireSession } from '@/lib/auth/server'
import { getProvider } from '@/lib/whatsapp/provider'
import { aiModelLabel } from '@/lib/ai/provider'
import { countPlatform, listOrganizationSummaries, listStaffUsers } from '@/services/users'

export const metadata: Metadata = { title: 'Platform admin' }
export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const session = await requireSession('admin')
  const [users, counts, organizations] = await Promise.all([listStaffUsers(), countPlatform(), listOrganizationSummaries()])
  const provider = getProvider()

  const tiles: { label: string; value: number | string; href?: string }[] = [
    { label: 'Agencies', value: counts.organizations },
    { label: 'Awaiting approval', value: organizations.filter((o) => o.status === 'pending').length },
    { label: 'Agency users', value: counts.staff },
    { label: 'Clients', value: counts.clients },
    { label: 'Policies in force', value: counts.policies },
    { label: 'Waiting on WhatsApp', value: counts.handoffs, href: '/admin/conversations' },
    { label: 'WhatsApp · AI', value: `${provider ? provider.name : 'off'} · ${aiModelLabel().replace(/^.*\//, '')}` },
  ]

  return (
    <div className="animate-fade-up space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="label-caps flex items-center gap-2 text-gold-700">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-gold" />
            Platform
          </p>
          <h1 className="mt-2 font-serif text-[28px] font-medium leading-9 text-forest sm:text-[34px] sm:leading-[2.75rem]">Agencies, accounts and health</h1>
          <p className="mt-1 text-[15px] text-ink-muted">You create agencies and their first admin. Agency admins invite their own staff. Clients sign up themselves on the website or on WhatsApp.</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Link href="/admin/system" className="inline-flex h-10 items-center gap-2 rounded-control border border-line bg-surface px-4 text-sm font-semibold text-ink hover:border-ink-muted focus-ring">
            <Activity className="size-4" aria-hidden="true" /> System
          </Link>
          <Link href="/admin/conversations" className="inline-flex h-10 items-center gap-2 rounded-control border border-line bg-surface px-4 text-sm font-semibold text-ink hover:border-ink-muted focus-ring">
            <MessageSquare className="size-4" aria-hidden="true" /> All conversations
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {tiles.map((t) => (
          <Card key={t.label} className="p-4">
            <p className="label-caps text-ink-muted">{t.label}</p>
            <p data-numeric className="mt-1.5 truncate font-serif text-[24px] font-bold leading-8 text-forest">{t.value}</p>
          </Card>
        ))}
      </div>

      <Organizations organizations={organizations} currentOrgId={session.oid} />
      <AgencyAccounts users={users} currentUserId={session.uid} organizations={organizations} />
    </div>
  )
}

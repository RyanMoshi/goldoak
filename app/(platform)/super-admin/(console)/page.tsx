import type { Metadata } from 'next'
import Link from 'next/link'
import { Activity, Building2, MessageSquare, ShieldCheck, Sparkles, UserRound, Users } from 'lucide-react'
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

  const pending = organizations.filter((o) => o.status === 'pending').length
  // A KPI earns its place by prompting an action, so each carries the line that
  // says what it means rather than a bare number.
  const tiles: { label: string; value: number | string; note: string; icon: typeof Building2; href?: string; alert?: boolean }[] = [
    { label: 'Agencies', value: counts.organizations, note: pending ? `${pending} awaiting approval` : 'all approved', icon: Building2, alert: pending > 0 },
    { label: 'Agency users', value: counts.staff, note: 'admins and staff across every tenant', icon: Users },
    { label: 'Clients', value: counts.clients, note: 'held by all agencies', icon: UserRound },
    { label: 'Policies in force', value: counts.policies, note: 'live and renewal-due', icon: ShieldCheck },
    {
      label: 'Waiting on WhatsApp',
      value: counts.handoffs,
      note: counts.handoffs ? 'someone is waiting for a person' : 'nobody waiting',
      icon: MessageSquare,
      href: '/super-admin/conversations',
      alert: counts.handoffs > 0,
    },
    { label: 'Engine', value: `${provider ? provider.name : 'off'}`, note: `assistant on ${aiModelLabel().replace(/^.*\//, '')}`, icon: Sparkles },
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
          <Link href="/super-admin/system" className="inline-flex h-10 items-center gap-2 rounded-control border border-line bg-surface px-4 text-sm font-semibold text-ink hover:border-ink-muted focus-ring">
            <Activity className="size-4" aria-hidden="true" /> System
          </Link>
          <Link href="/super-admin/conversations" className="inline-flex h-10 items-center gap-2 rounded-control border border-line bg-surface px-4 text-sm font-semibold text-ink hover:border-ink-muted focus-ring">
            <MessageSquare className="size-4" aria-hidden="true" /> All conversations
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {tiles.map((t) => {
          const Icon = t.icon
          const body = (
            <>
              <span className="flex items-start justify-between gap-2">
                <Icon className={`size-4 ${t.alert ? 'text-gold-700' : 'text-ink-faint'}`} aria-hidden="true" />
                {t.alert ? <span aria-hidden="true" className="mt-1 size-1.5 rounded-full bg-gold" /> : null}
              </span>
              <span data-numeric className="mt-3 block font-serif text-[26px] font-bold leading-8 text-forest">
                {t.value}
              </span>
              <span className="mt-0.5 block text-[12.5px] font-semibold text-ink">{t.label}</span>
              <span className="mt-0.5 block text-[11.5px] leading-4 text-ink-faint">{t.note}</span>
            </>
          )
          return t.href ? (
            <Link key={t.label} href={t.href} className="rounded-card border border-line bg-surface p-4 transition-colors hover:border-gold focus-ring">
              {body}
            </Link>
          ) : (
            <Card key={t.label} className="p-4">
              {body}
            </Card>
          )
        })}
      </div>

      <Organizations organizations={organizations} currentOrgId={session.oid} />
      <AgencyAccounts users={users} currentUserId={session.uid} organizations={organizations} />
    </div>
  )
}

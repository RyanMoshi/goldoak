import type { Metadata } from 'next'
import { AgencyAccounts } from '@/components/platform/admin/AgencyAccounts'
import { Card } from '@/components/platform/ui/Card'
import { requireSession } from '@/lib/auth/server'
import { getProvider } from '@/lib/whatsapp/provider'
import { countPlatform, listStaffUsers } from '@/services/users'

export const metadata: Metadata = { title: 'Platform admin' }

export default async function AdminPage() {
  const session = await requireSession('admin')
  const [users, counts] = await Promise.all([listStaffUsers(), countPlatform()])
  const provider = getProvider()

  const tiles: { label: string; value: number | string }[] = [
    { label: 'Organisations', value: counts.organizations },
    { label: 'Agency users', value: counts.staff },
    { label: 'Clients', value: counts.clients },
    { label: 'Policies in force', value: counts.policies },
    { label: 'Open claims', value: counts.openClaims },
    { label: 'WhatsApp', value: provider ? provider.name : 'off' },
  ]

  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <p className="label-caps flex items-center gap-2 text-gold-700">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-gold" />
          Platform
        </p>
        <h1 className="mt-2 font-serif text-[28px] font-medium leading-9 text-forest sm:text-[34px] sm:leading-[2.75rem]">Accounts and health</h1>
        <p className="mt-1 text-[15px] text-ink-muted">Agencies are invited here. Clients create their own accounts on the website or by messaging WhatsApp.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {tiles.map((t) => (
          <Card key={t.label} className="p-4">
            <p className="label-caps text-ink-muted">{t.label}</p>
            <p data-numeric className="mt-1.5 font-serif text-[26px] font-bold leading-8 text-forest">{t.value}</p>
          </Card>
        ))}
      </div>

      <AgencyAccounts users={users} currentUserId={session.uid} />
    </div>
  )
}

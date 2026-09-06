import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { PhoneForm } from '@/components/platform/portal/PhoneForm'
import { Card, CardHeader } from '@/components/platform/ui/Card'
import { requireSession } from '@/lib/auth/server'
import { getPortalData } from '@/services/portal'

export const metadata: Metadata = { title: 'My profile' }

export default async function ProfilePage() {
  const session = await requireSession('client')
  const data = await getPortalData(session.uid)
  if (!data) return <p className="text-ink-muted">We could not load your account. Please sign in again.</p>
  const { user, client, organization } = data

  return (
    <div className="animate-fade-up space-y-6">
      <Link href="/portal" className="inline-flex items-center gap-1.5 rounded-control text-[13px] font-semibold text-ink-muted hover:text-ink focus-ring">
        <ArrowLeft className="size-4" aria-hidden="true" /> My insurance
      </Link>
      <div>
        <p className="label-caps text-gold-700">Profile</p>
        <h1 className="mt-2 font-serif text-[28px] font-medium leading-9 text-forest">{user.name}</h1>
      </div>
      <Card as="section" flush>
        <div className="px-5 pb-3 pt-5"><CardHeader title="Your details" description="To change your name or email, message your adviser." /></div>
        <dl className="divide-y divide-divider border-t border-line text-[14px]">
          <Row label="Email">{user.email}</Row>
          {client ? <Row label={client.type === 'individual' ? 'Insured as' : 'Business'}>{client.name}</Row> : null}
          <Row label="Adviser">{client?.adviserName ?? `${organization.shortName} advisory team`}</Row>
          <Row label="Agency">{organization.name} · {organization.phone}</Row>
        </dl>
      </Card>
      <Card as="section">
        <CardHeader title="WhatsApp" description="Reminders and updates go to this number, and it is how we recognise you when you message us." />
        <div className="mt-4"><PhoneForm current={user.phone} /></div>
      </Card>
      <Card as="section">
        <CardHeader title="Your data" description="Held under the Data Protection Act 2019." />
        <p className="mt-3 text-[13.5px] text-ink-muted">
          We hold your identity, contact and insurance details to advise you and to place and service your cover. We share them only with the insurers you ask us to approach. To request a copy or deletion, email {organization.email}.
        </p>
      </Card>
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 px-5 py-3 sm:grid-cols-[180px_1fr] sm:gap-4">
      <dt className="text-[12px] font-bold uppercase tracking-[0.06em] text-ink-muted">{label}</dt>
      <dd className="text-ink">{children}</dd>
    </div>
  )
}

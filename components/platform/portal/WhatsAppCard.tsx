import { MessageCircle, Phone } from 'lucide-react'
import { Card } from '@/components/platform/ui/Card'
import { formatPhone } from '@/lib/format'
import type { Organization } from '@/types/platform'

/** The adviser, and the WhatsApp line that does everything the portal does. */
export function WhatsAppCard({ organization, adviserName, phoneLinked }: { organization: Organization; adviserName: string | null; phoneLinked: boolean }) {
  const wa = `https://wa.me/${organization.whatsapp}?text=${encodeURIComponent('STATUS')}`
  return (
    <Card as="section" className="border-forest bg-forest text-white">
      <p className="label-caps text-gold">Your adviser</p>
      <p className="mt-1 font-serif text-[20px] font-semibold">{adviserName ?? `${organization.shortName} advisory team`}</p>
      <p className="mt-1 text-[13px] text-white/75">Questions, changes, claims. Same-day acknowledgement.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center gap-2 rounded-control bg-gold px-4 text-sm font-semibold text-white hover:bg-gold-500 focus-ring">
          <MessageCircle className="size-4" aria-hidden="true" /> WhatsApp us
        </a>
        <a href={`tel:${organization.phone.replace(/\s/g, '')}`} className="inline-flex h-10 items-center gap-2 rounded-control border border-white/30 px-4 text-sm font-semibold text-white hover:bg-white/10 focus-ring">
          <Phone className="size-4" aria-hidden="true" /> {organization.phone}
        </a>
      </div>
      <div className="mt-5 rounded-card border border-white/15 bg-white/5 p-4 text-[13px]">
        <p className="font-semibold">Do it all from WhatsApp</p>
        <p className="mt-1 text-white/75">
          Message <span className="font-mono text-gold">{formatPhone(organization.whatsapp)}</span> from your registered number with one word:
        </p>
        <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 font-mono text-[12px] text-white/90 sm:grid-cols-4">
          <li>STATUS</li>
          <li>POLICIES</li>
          <li>QUOTES</li>
          <li>CLAIMS</li>
          <li>QUOTE</li>
          <li>CLAIM</li>
          <li>UPDATES</li>
          <li>ADVISER</li>
        </ul>
        <p className="mt-2 text-[12px] text-white/60">QUOTE asks for new cover. CLAIM reports one. Reminders arrive there automatically.</p>
        {!phoneLinked ? <p className="mt-2 text-[12px] text-gold">Add your mobile number in your profile so we recognise you on WhatsApp.</p> : null}
      </div>
    </Card>
  )
}

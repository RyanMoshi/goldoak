import PartnersHero from '@/components/PartnersHero'
import PartnersList from '@/components/PartnersList'
import PartnerBenefits from '@/components/PartnerBenefits'

export const metadata = {
  title: 'Our Insurance Partners - Goldoak Insurance Agency',
  description: 'Discover our trusted insurance partners including Jubilee, Britam, Old Mutual, CIC, AAR, GA Insurance and more. We work with Kenya\'s leading insurers.',
}

export default function Partners() {
  return (
    <div className="min-h-screen">
      <PartnersHero />
      <PartnersList />
      <PartnerBenefits />
    </div>
  )
}

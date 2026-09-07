import Hero from '@/components/Hero'
import HowItWorks from '@/components/HowItWorks'
import WhyGoldOak from '@/components/WhyGoldOak'
import SolutionsPreview from '@/components/SolutionsPreview'
import PortalPreview from '@/components/PortalPreview'
import InsurerPanel from '@/components/InsurerPanel'
import CTASection from '@/components/CTASection'

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      <HowItWorks />
      <WhyGoldOak />
      <SolutionsPreview />
      <PortalPreview />
      <InsurerPanel />
      <CTASection />
    </div>
  )
}

import Hero from '@/components/Hero'
import WhyGoldOak from '@/components/WhyGoldOak'
import WhoWeServe from '@/components/WhoWeServe'
import SolutionsPreview from '@/components/SolutionsPreview'
import ProcessPreview from '@/components/ProcessPreview'
import PortalPreview from '@/components/PortalPreview'
import InsurerPanel from '@/components/InsurerPanel'
import CTASection from '@/components/CTASection'

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      <WhyGoldOak />
      <WhoWeServe />
      <SolutionsPreview />
      <ProcessPreview />
      <PortalPreview />
      <InsurerPanel />
      <CTASection />
    </div>
  )
}

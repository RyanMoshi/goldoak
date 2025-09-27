import Hero from '@/components/Hero'
import HowItWorks from '@/components/HowItWorks'
import Partners from '@/components/Partners'
import Reviews from '@/components/Reviews'
import WhyChooseUs from '@/components/WhyChooseUs'
import FAQ from '@/components/FAQ'
import ContactSection from '@/components/ContactSection'

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      <HowItWorks />
      <Partners />
      <Reviews />
      <WhyChooseUs />
      <FAQ />
      <ContactSection />
    </div>
  )
}

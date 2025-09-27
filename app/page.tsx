import Hero from '@/components/Hero'
import Testimonials from '@/components/Testimonials'
import HowItWorksStrip from '@/components/HowItWorksStrip'
import Partners from '@/components/Partners'
import Reviews from '@/components/Reviews'
import WhyChooseUs from '@/components/WhyChooseUs'
import FAQ from '@/components/FAQ'
import ContactSection from '@/components/ContactSection'
import FloatingWhatsApp from '@/components/FloatingWhatsApp'

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      <Testimonials />
      <HowItWorksStrip />
      <Partners />
      <Reviews />
      <WhyChooseUs />
      <FAQ />
      <ContactSection />
      <FloatingWhatsApp />
    </div>
  )
}

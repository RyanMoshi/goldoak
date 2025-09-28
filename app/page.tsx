import Hero from '@/components/Hero'
import AboutSection from '@/components/AboutSection'
import ServicesSection from '@/components/ServicesSection'
import ProcessSection from '@/components/ProcessSection'
import ClaimsSection from '@/components/ClaimsSection'
import WhyChooseUsSection from '@/components/WhyChooseUsSection'
import ContactSection from '@/components/ContactSection'
import FloatingWhatsApp from '@/components/FloatingWhatsApp'

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      <AboutSection />
      <ServicesSection />
      <ProcessSection />
      <ClaimsSection />
      <WhyChooseUsSection />
      <ContactSection />
      <FloatingWhatsApp />
    </div>
  )
}

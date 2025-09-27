import Hero from '@/components/Hero'
import Services from '@/components/Services'
import Partners from '@/components/Partners'
import Testimonials from '@/components/Testimonials'
import CTA from '@/components/CTA'
import Stats from '@/components/Stats'

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      <Stats />
      <Services />
      <Partners />
      <Testimonials />
      <CTA />
    </div>
  )
}

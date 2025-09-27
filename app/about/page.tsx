import AboutHero from '@/components/AboutHero'
import AboutContent from '@/components/AboutContent'
import Team from '@/components/Team'
import Values from '@/components/Values'
import Licensing from '@/components/Licensing'
import BrandShowcase from '@/components/BrandShowcase'

export const metadata = {
  title: 'About Us - Goldoak Insurance Agency',
  description: 'Learn about Goldoak Insurance Agency, a licensed insurance agency in Kenya regulated by the Insurance Regulatory Authority. Our mission, values, and commitment to clients.',
}

export default function About() {
  return (
    <div className="min-h-screen">
      <AboutHero />
      <AboutContent />
      <Values />
      <Team />
      <BrandShowcase />
      <Licensing />
    </div>
  )
}

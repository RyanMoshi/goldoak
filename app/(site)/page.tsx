import type { Metadata } from 'next'
import { About, CallToAction, ClientValue, ContactStrip, Hero, HowWeWork, Services, WhyGoldOak } from '@/components/home/Sections'
import { company } from '@/lib/company'

export const metadata: Metadata = {
  title: `${company.legalName} — ${company.tagline}`,
  description: company.positioning,
}

/**
 * One page, one argument, in the company's own words: who GoldOak is, what it
 * places, why it is worth trusting, how it works, and how to start. Anything
 * that does not serve that argument lives on its own page.
 */
export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Services />
      <WhyGoldOak />
      <HowWeWork />
      <ClientValue />
      <CallToAction />
      <ContactStrip />
    </>
  )
}

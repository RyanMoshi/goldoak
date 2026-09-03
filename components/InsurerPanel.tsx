'use client'

import AnimatedSection from './AnimatedSection'
import SectionHeader from './SectionHeader'
import { insurers } from '@/lib/insurers'

const InsurerPanel = () => {
  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <AnimatedSection>
          <SectionHeader
            title="Our Insurer Panel"
            subtitle="We are not tied to a single insurer. Access to a panel is what makes comparison meaningful — it lets us match a client to the insurer whose terms, service and claims record actually suit the risk in front of us."
          />
        </AnimatedSection>

        <AnimatedSection delay={100}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-6">
            {insurers.map((insurer, index) => (
              <div
                key={insurer.name}
                className="group bg-section-cream rounded-xl p-6 flex items-center justify-center border border-gray-100 hover:border-secondary/30 hover:shadow-md transition-all duration-300 min-h-[100px]"
              >
                <span className="font-serif text-lg md:text-xl font-medium text-text-headline group-hover:text-secondary transition-colors text-center">
                  {insurer.name}
                </span>
              </div>
            ))}
          </div>
        </AnimatedSection>

        <AnimatedSection delay={200}>
          <p className="text-center text-sm text-text-body mt-8 max-w-2xl mx-auto">
            Each insurer on our panel is assessed for the classes they write, their claims 
            record, service standards, and financial strength. We review the panel annually 
            to ensure it serves our clients well.
          </p>
        </AnimatedSection>
      </div>
    </section>
  )
}

export default InsurerPanel

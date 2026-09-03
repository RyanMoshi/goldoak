'use client'

import Link from 'next/link'
import { ArrowRight, User, Building2, Landmark } from 'lucide-react'
import AnimatedSection from './AnimatedSection'
import SectionHeader from './SectionHeader'
import { clientSegments } from '@/lib/insurers'

const iconMap: Record<string, typeof User> = {
  individual: User,
  sme: Building2,
  corporate: Landmark,
}

const WhoWeServe = () => {
  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <AnimatedSection>
          <SectionHeader
            title="Who We Serve"
            subtitle="Three client segments, each with different exposures and different service needs. We build cover around the actual operation, not a standard package."
          />
        </AnimatedSection>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {clientSegments.map((segment, index) => {
            const Icon = iconMap[segment.id] || User
            return (
              <AnimatedSection key={segment.id} delay={index * 150} animation="fade-up">
                <div className="group relative bg-section-cream rounded-2xl p-8 border border-gray-100 hover:border-secondary/30 transition-all duration-300 h-full flex flex-col">
                  {/* Gold top accent */}
                  <div className="absolute top-0 left-8 right-8 h-0.5 bg-secondary/0 group-hover:bg-secondary/50 transition-colors rounded-full" />

                  <div className="w-14 h-14 rounded-xl bg-primary/5 flex items-center justify-center mb-6 group-hover:bg-secondary/10 transition-colors">
                    <Icon className="w-7 h-7 text-primary group-hover:text-secondary transition-colors" />
                  </div>

                  <h3 className="font-serif text-heading-3 font-medium text-text-headline mb-3">
                    {segment.title}
                  </h3>

                  <p className="text-body text-text-body mb-6 flex-grow">
                    {segment.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {segment.services.slice(0, 5).map((service) => (
                      <span
                        key={service}
                        className="text-xs font-medium text-primary/70 bg-navy-50 px-3 py-1 rounded-full"
                      >
                        {service}
                      </span>
                    ))}
                    {segment.services.length > 5 && (
                      <span className="text-xs font-medium text-secondary bg-gold-50 px-3 py-1 rounded-full">
                        +{segment.services.length - 5} more
                      </span>
                    )}
                  </div>

                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-secondary transition-colors group/link"
                  >
                    Start a conversation
                    <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </AnimatedSection>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default WhoWeServe

'use client'

import { Shield, Scale, GitCompare, HeartHandshake } from 'lucide-react'
import AnimatedSection from './AnimatedSection'
import SectionHeader from './SectionHeader'
import { processPrinciples } from '@/lib/process'

const icons = [Shield, Scale, GitCompare, HeartHandshake]

const WhyGoldOak = () => {
  return (
    <section className="section-padding bg-section-cream">
      <div className="container-custom">
        <AnimatedSection>
          <SectionHeader
            title="Why GoldOak"
            subtitle="Four operating principles that settle every decision. When a choice is unclear, one of these decides it."
          />
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {processPrinciples.map((principle, index) => {
            const Icon = icons[index]
            return (
              <AnimatedSection key={principle.title} delay={index * 100} animation="fade-up">
                <div className="group bg-white rounded-2xl p-8 border border-gray-100 hover:border-secondary/30 hover:shadow-lg transition-all duration-300 h-full">
                  <div className="flex items-start gap-5">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-navy-50 flex items-center justify-center group-hover:bg-secondary/10 transition-colors">
                      <Icon className="w-6 h-6 text-primary group-hover:text-secondary transition-colors" />
                    </div>
                    <div>
                      <h3 className="font-serif text-heading-3 font-medium text-text-headline mb-3">
                        {principle.title}
                      </h3>
                      <p className="text-body text-text-body leading-relaxed">
                        {principle.description}
                      </p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default WhyGoldOak

'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import AnimatedSection from './AnimatedSection'
import SectionHeader from './SectionHeader'
import { processStages } from '@/lib/process'

const ProcessPreview = () => {
  return (
    <section className="section-padding bg-primary text-white">
      <div className="container-custom">
        <AnimatedSection>
          <SectionHeader
            title="How We Work"
            subtitle="Every client goes through the same seven stages. It is the part of our work that does not change, whether we are placing one motor policy or an entire employee benefits programme."
            light
          />
        </AnimatedSection>

        <div className="space-y-0">
          {processStages.slice(0, 5).map((stage, index) => (
            <AnimatedSection key={stage.number} delay={index * 80} animation="fade-up">
              <div className="flex items-start gap-6 py-6 border-b border-white/10 last:border-0 group">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center font-serif text-xl text-secondary group-hover:bg-secondary/20 transition-colors">
                  {stage.number}
                </div>
                <div className="flex-grow">
                  <h3 className="font-serif text-xl font-medium text-white mb-1">
                    {stage.title}
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed max-w-xl">
                    {stage.description}
                  </p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection delay={400}>
          <div className="mt-10 text-center">
            <Link
              href="/how-we-work"
              className="inline-flex items-center gap-2 text-secondary hover:text-gold-300 transition-colors font-semibold group"
            >
              See the full seven-stage process
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}

export default ProcessPreview

'use client'

import PageHero from '@/components/PageHero'
import AnimatedSection from '@/components/AnimatedSection'
import CTASection from '@/components/CTASection'
import { processStages } from '@/lib/process'

export default function HowWeWorkPage() {
  return (
    <div className="min-h-screen">
      <PageHero
        title="How We Work"
        subtitle="Every client goes through the same seven stages. It is the part of our work that does not change, whether we are placing one motor policy or an entire employee benefits programme."
        breadcrumbs={[{ label: 'How We Work' }]}
      />

      {/* The Journey */}
      <section className="section-padding bg-white">
        <div className="container-narrow px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-16">
              <div className="badge-gold mb-4 inline-flex">The GoldOak Process</div>
              <h2 className="font-serif text-heading-2 font-medium text-text-headline">
                Seven stages. Seven outputs.
              </h2>
              <p className="text-body text-text-body mt-4 max-w-2xl mx-auto">
                Read these as a loop, not a line. Review feeds straight back into Understand. 
                A client who has been through two cycles should have a risk profile that is 
                visibly richer than the one built on day one.
              </p>
            </div>
          </AnimatedSection>

          <div className="space-y-0">
            {processStages.map((stage, index) => (
              <AnimatedSection key={stage.number} delay={index * 60} animation="fade-up">
                <div className="relative flex gap-6 md:gap-10 pb-12 last:pb-0">
                  {/* Vertical line */}
                  {index < processStages.length - 1 && (
                    <div className="absolute left-6 md:left-8 top-14 bottom-0 w-px bg-gradient-to-b from-secondary/40 to-transparent" />
                  )}

                  {/* Number */}
                  <div className="flex-shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-primary text-white flex items-center justify-center font-serif text-xl md:text-2xl relative z-10">
                    {stage.number}
                  </div>

                  {/* Content */}
                  <div className="flex-grow pt-1 md:pt-3">
                    <h3 className="font-serif text-heading-2 font-medium text-text-headline mb-2">
                      {stage.title}
                    </h3>
                    <p className="text-body text-text-body leading-relaxed mb-4 max-w-xl">
                      {stage.description}
                    </p>
                    <div className="bg-section-cream rounded-xl p-4 border border-gray-100">
                      <span className="text-xs font-semibold uppercase tracking-wider text-secondary">
                        Output
                      </span>
                      <p className="text-sm text-text-body mt-1">{stage.output}</p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="section-padding bg-primary text-white">
        <div className="container-narrow px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-12">
              <h2 className="font-serif text-heading-2 font-medium text-white">
                The principles behind every stage
              </h2>
              <p className="text-gray-300 mt-4 max-w-2xl mx-auto">
                These four rules settle arguments. When a decision is unclear, one of these decides it.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: 'Risk Before Product', desc: 'No recommendation is made before the exposure is understood and written down.' },
              { title: 'Appropriate Over Cheap', desc: 'The objective is the most suitable cover, not simply the lowest premium.' },
              { title: 'Options, Not Assumptions', desc: 'The client sees more than one option, compared on the same terms.' },
              { title: 'The Relationship Outlives the Policy', desc: 'Issuing the policy is the middle of the job, not the end.' },
            ].map((p, i) => (
              <AnimatedSection key={p.title} delay={i * 100}>
                <div className="bg-white/10 rounded-xl p-6 border border-white/10">
                  <h3 className="font-serif text-lg font-medium text-secondary mb-2">{p.title}</h3>
                  <p className="text-sm text-gray-300">{p.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </div>
  )
}

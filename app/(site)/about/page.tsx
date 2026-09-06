'use client'

import { Target, Shield, Users, BarChart3 } from 'lucide-react'
import PageHero from '@/components/PageHero'
import AnimatedSection from '@/components/AnimatedSection'
import SectionHeader from '@/components/SectionHeader'
import CTASection from '@/components/CTASection'
import { clientSegments } from '@/lib/insurers'

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <PageHero
        title="About GoldOak"
        subtitle="An insurance solutions agency, not a policy shop. GoldOak understands a client's risks before it discusses products, presents suitable options from a panel of insurers, and stays with the client through onboarding, claims and renewal."
        breadcrumbs={[{ label: 'About' }]}
      />

      {/* Who We Are */}
      <section className="section-padding bg-white">
        <div className="container-narrow px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="prose prose-lg max-w-none">
              <p className="text-body-lg text-text-body leading-relaxed">
                GoldOak was established in 2020 with a clear instinct: the client comes first, 
                not the insurer. Everything we do is that sentence turned into a structure.
              </p>
              <p className="text-body-lg text-text-body leading-relaxed">
                We are an insurance solutions agency serving corporate, SME and individual clients. 
                We identify a client's risk exposure, design an insurance programme around that 
                exposure, source and compare options from a panel of insurers, implement the chosen 
                solution, and manage the relationship through service, claims and review.
              </p>
              <p className="text-body-lg text-text-body leading-relaxed font-medium text-text-headline">
                We do not sell policies. We solve exposures, and a policy is what the solution is made of.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Philosophy */}
      <section className="section-padding bg-section-cream">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <SectionHeader
              title="Our Philosophy"
              subtitle="Four operating principles guide every decision we make."
              centered
            />
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              { icon: Target, title: 'Risk Before Product', desc: 'No recommendation is made before the exposure is understood and written down.' },
              { icon: BarChart3, title: 'Appropriate Over Cheap', desc: 'The objective is the most suitable cover for the client\'s circumstances.' },
              { icon: Users, title: 'Options, Not Assumptions', desc: 'The client sees more than one option and sees them compared on the same terms.' },
              { icon: Shield, title: 'The Relationship Outlives the Policy', desc: 'Issuing the policy is the middle of the job, not the end.' },
            ].map((item, i) => {
              const Icon = item.icon
              return (
                <AnimatedSection key={item.title} delay={i * 100}>
                  <div className="flex gap-4 p-6 bg-white rounded-xl border border-gray-100">
                    <Icon className="w-6 h-6 text-secondary flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-serif text-lg font-medium text-text-headline mb-1">{item.title}</h3>
                      <p className="text-sm text-text-body">{item.desc}</p>
                    </div>
                  </div>
                </AnimatedSection>
              )
            })}
          </div>
        </div>
      </section>

      {/* Who We Serve */}
      <section className="section-padding bg-white" id="who-we-serve">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <SectionHeader
              title="Who We Serve"
              subtitle="Three segments, each with different exposures and service needs."
            />
          </AnimatedSection>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {clientSegments.map((segment, index) => (
              <AnimatedSection key={segment.id} delay={index * 100}>
                <div className="bg-section-cream rounded-2xl p-8 border border-gray-100 h-full">
                  <h3 className="font-serif text-heading-3 font-medium text-text-headline mb-3">
                    {segment.title}
                  </h3>
                  <p className="text-body text-text-body mb-6">{segment.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {segment.services.map((service) => (
                      <span key={service} className="text-xs font-medium text-primary/70 bg-navy-50 px-3 py-1 rounded-full">
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* What we are not */}
      <section className="section-padding bg-primary text-white">
        <div className="container-narrow px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h2 className="font-serif text-heading-2 font-medium text-white text-center mb-10">
              What GoldOak is not
            </h2>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Not a quotation service', desc: 'Anyone can forward a rate. We provide analysis and recommendation.' },
              { title: 'Not a single-insurer arm', desc: 'The panel exists to give the client choice, not to push one product.' },
              { title: 'Not transactional', desc: 'A client who only hears from us at renewal is a client we are about to lose.' },
            ].map((item, i) => (
              <AnimatedSection key={item.title} delay={i * 100}>
                <div className="bg-white/10 rounded-xl p-6 border border-white/10 text-center">
                  <h3 className="font-serif text-lg font-medium text-secondary mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-300">{item.desc}</p>
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

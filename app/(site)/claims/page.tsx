'use client'

import Link from 'next/link'
import { ArrowRight, Phone } from 'lucide-react'
import PageHero from '@/components/PageHero'
import AnimatedSection from '@/components/AnimatedSection'
import CTASection from '@/components/CTASection'
import { claimsSteps } from '@/lib/insurers'
import { contact } from '@/lib/contact'

export default function ClaimsPage() {
  return (
    <div className="min-h-screen">
      <PageHero
        title="Claims Support"
        subtitle="Claims are the moment of truth."
        breadcrumbs={[{ label: 'Claims' }]}
      />

      <section className="section-padding bg-white">
        <div className="container-narrow px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-16">
              <div className="badge-gold mb-4 inline-flex">Our Claims Process</div>
              <h2 className="font-serif text-heading-2 font-medium text-text-headline">
                From notification to settlement
              </h2>
              <p className="text-body text-text-body mt-4 max-w-2xl mx-auto">
                We guide you through every step, chase the insurer, and keep you informed.
              </p>
            </div>
          </AnimatedSection>

          <div className="space-y-6">
            {claimsSteps.map((step, index) => (
              <AnimatedSection key={step.step} delay={index * 80} animation="fade-up">
                <div className="group flex gap-6 p-6 md:p-8 bg-section-cream rounded-2xl border border-gray-100 hover:border-secondary/30 hover:shadow-sm transition-all duration-300">
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-primary text-white flex items-center justify-center font-serif text-xl group-hover:bg-secondary transition-colors">
                    {index + 1}
                  </div>
                  <div className="flex-grow">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                      <h3 className="font-serif text-heading-3 font-medium text-text-headline">
                        {step.step}
                      </h3>
                      <span className="text-xs font-semibold text-secondary bg-gold-50 px-3 py-1 rounded-full self-start">
                        {step.timeframe}
                      </span>
                    </div>
                    <p className="text-body text-text-body leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-section-cream">
        <div className="container-narrow px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="bg-white rounded-2xl p-8 md:p-12 border border-gray-100">
              <h2 className="font-serif text-heading-2 font-medium text-text-headline mb-6">
                What to do if you need to claim
              </h2>
              <div className="space-y-4 text-body text-text-body">
                <p>
                  <strong className="text-text-headline">1. Contact GoldOak immediately.</strong>{' '}
                  Early notification gives us the best chance of managing the claim effectively.
                </p>
                <p>
                  <strong className="text-text-headline">2. Do not admit liability.</strong>{' '}
                  Speak to us first. What you say at the scene can affect the claim.
                </p>
                <p>
                  <strong className="text-text-headline">3. Gather evidence.</strong>{' '}
                  Photos, receipts, police reports, witness details.
                </p>
                <p>
                  <strong className="text-text-headline">4. We take it from there.</strong>{' '}
                  We register the claim, assemble documentation, and keep you updated.
                </p>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <a
                  href={'tel:' + contact.phoneRaw}
                  className="btn-primary inline-flex items-center justify-center gap-2"
                >
                  <Phone className="w-5 h-5" />
                  Call us now
                </a>
                <Link
                  href="/contact"
                  className="btn-outline inline-flex items-center justify-center gap-2"
                >
                  Contact claims team
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <CTASection />
    </div>
  )
}

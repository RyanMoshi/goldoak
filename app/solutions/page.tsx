'use client'

import { useState } from 'react'
import { Heart, Car, Building, Shield, Users, Briefcase, Sparkles } from 'lucide-react'
import PageHero from '@/components/PageHero'
import AnimatedSection from '@/components/AnimatedSection'
import SectionHeader from '@/components/SectionHeader'
import CTASection from '@/components/CTASection'
import { solutionCategories } from '@/lib/solutions'

const iconMap: Record<string, typeof Heart> = {
  'health-life': Heart,
  motor: Car,
  'property-assets': Building,
  liability: Shield,
  'people-statutory': Users,
  'personal-lines': Briefcase,
  specialty: Sparkles,
}

export default function SolutionsPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  return (
    <div className="min-h-screen">
      <PageHero
        title="Insurance Solutions"
        subtitle="From personal cover to complex corporate programmes — we design, compare and implement insurance solutions across seven key categories. Each solution is assessed against the client's actual risk, not a standard template."
        breadcrumbs={[{ label: 'Solutions' }]}
      />

      {/* Category filter */}
      <section className="bg-white border-b border-gray-100 sticky top-[72px] z-40">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 py-4 overflow-x-auto custom-scrollbar">
            <button
              onClick={() => setActiveCategory(null)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeCategory === null
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-text-body hover:bg-gray-200'
              }`}
            >
              All Categories
            </button>
            {solutionCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeCategory === cat.id
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-text-body hover:bg-gray-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section-padding bg-section-cream">
        <div className="container-custom">
          <div className="space-y-16">
            {solutionCategories
              .filter((cat) => !activeCategory || cat.id === activeCategory)
              .map((cat) => {
                const Icon = iconMap[cat.id] || Shield
                return (
                  <AnimatedSection key={cat.id} id={cat.id}>
                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                      {/* Category header */}
                      <div className="p-6 md:p-8 border-b border-gray-100 bg-section-cream">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h2 className="font-serif text-heading-2 font-medium text-text-headline">
                              {cat.name}
                            </h2>
                            <p className="text-body text-text-body mt-1">{cat.description}</p>
                            <div className="flex gap-2 mt-3">
                              {cat.segments.map((seg) => (
                                <span
                                  key={seg}
                                  className="text-xs font-medium text-secondary bg-gold-50 px-3 py-1 rounded-full"
                                >
                                  {seg}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Solutions list */}
                      <div className="p-6 md:p-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {cat.solutions.map((solution) => (
                            <div
                              key={solution}
                              className="flex items-center gap-3 p-3 rounded-lg hover:bg-section-cream transition-colors"
                            >
                              <div className="w-1.5 h-1.5 rounded-full bg-secondary flex-shrink-0" />
                              <span className="text-sm text-text-body">{solution}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </AnimatedSection>
                )
              })}
          </div>
        </div>
      </section>

      {/* Placement note */}
      <section className="py-12 bg-white">
        <div className="container-narrow px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="bg-section-cream rounded-2xl p-8 border border-gray-100">
              <h3 className="font-serif text-heading-3 font-medium text-text-headline mb-3">
                How we select the right insurer
              </h3>
              <p className="text-body text-text-body leading-relaxed">
                Not every insurer writes every class. We map each insurer against our solutions 
                catalogue to understand their appetite, claims record, and service standards. 
                When we present options, they are chosen because the insurer can actually carry 
                the risk — not because they answered the phone first.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <CTASection />
    </div>
  )
}

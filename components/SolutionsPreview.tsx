'use client'

import Link from 'next/link'
import { ArrowRight, Heart, Car, Building, Shield, Users, Briefcase } from 'lucide-react'
import AnimatedSection from './AnimatedSection'
import SectionHeader from './SectionHeader'

const categories = [
  { name: 'Health & Life', icon: Heart, href: '/solutions#health-life' },
  { name: 'Motor', icon: Car, href: '/solutions#motor' },
  { name: 'Property & Assets', icon: Building, href: '/solutions#property-assets' },
  { name: 'Liability', icon: Shield, href: '/solutions#liability' },
  { name: 'People & Statutory', icon: Users, href: '/solutions#people-statutory' },
  { name: 'Personal Lines', icon: Briefcase, href: '/solutions#personal-lines' },
]

const SolutionsPreview = () => {
  return (
    <section className="section-padding bg-section-cream">
      <div className="container-custom">
        <AnimatedSection>
          <SectionHeader
            title="Our Solutions"
            subtitle="From personal cover to complex corporate programmes — we design, compare and implement insurance solutions across seven key categories."
          />
        </AnimatedSection>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
          {categories.map((cat, index) => {
            const Icon = cat.icon
            return (
              <AnimatedSection key={cat.name} delay={index * 80} animation="fade-up">
                <Link
                  href={cat.href}
                  className="group flex flex-col items-center text-center bg-white rounded-xl p-6 lg:p-8 border border-gray-100 hover:border-secondary/30 hover:shadow-md transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-navy-50 flex items-center justify-center mb-4 group-hover:bg-secondary/10 transition-colors">
                    <Icon className="w-6 h-6 text-primary group-hover:text-secondary transition-colors" />
                  </div>
                  <span className="font-serif text-sm lg:text-base font-medium text-text-headline group-hover:text-secondary transition-colors">
                    {cat.name}
                  </span>
                </Link>
              </AnimatedSection>
            )
          })}
        </div>

        <AnimatedSection delay={500}>
          <div className="mt-10 text-center">
            <Link
              href="/solutions"
              className="inline-flex items-center gap-2 text-primary hover:text-secondary transition-colors font-semibold group"
            >
              View all solutions
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}

export default SolutionsPreview

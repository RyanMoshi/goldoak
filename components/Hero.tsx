'use client'

import Link from 'next/link'
import { ArrowRight, Shield, Users, BarChart3 } from 'lucide-react'
import AnimatedSection from './AnimatedSection'

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center hero-gradient-navy overflow-hidden">
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Gold accent line at top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-secondary to-transparent" />

      <div className="container-custom px-4 sm:px-6 lg:px-8 relative z-10 py-20">
        <div className="max-w-4xl">
          <AnimatedSection animation="fade-up" delay={100}>
            <div className="badge-gold mb-8 inline-flex">
              <Shield className="w-4 h-4" />
              Insurance solutions, not just policies
            </div>
          </AnimatedSection>

          <AnimatedSection animation="fade-up" delay={200}>
            <h1 className="font-serif text-display text-white mb-6">
              Understand the risk first.{' '}
              <span className="text-secondary italic">The policy comes after.</span>
            </h1>
          </AnimatedSection>

          <AnimatedSection animation="fade-up" delay={300}>
            <p className="text-body-lg text-gray-300 max-w-2xl mb-10 leading-relaxed">
              GoldOak is an insurance solutions agency working with individuals, growing businesses 
              and corporate organisations. We start by understanding what a client actually stands to 
              lose, then find, compare and place cover that answers it — and we stay involved long 
              after the policy is issued.
            </p>
          </AnimatedSection>

          <AnimatedSection animation="fade-up" delay={400}>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/contact"
                className="bg-secondary text-white px-8 py-4 rounded-lg font-semibold hover:bg-gold-500 transition-all duration-300 inline-flex items-center justify-center gap-2 group text-lg"
              >
                Start a Risk Review
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/solutions"
                className="border-2 border-white/30 text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-all duration-300 inline-flex items-center justify-center gap-2 text-lg"
              >
                Explore Our Solutions
              </Link>
            </div>
          </AnimatedSection>

          <AnimatedSection animation="fade-up" delay={500}>
            <div className="mt-16 flex flex-wrap gap-8 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-secondary" />
                <span>Individual, SME & Corporate</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-secondary" />
                <span>Multi-insurer comparison</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-secondary" />
                <span>Claims support throughout</span>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>

      {/* Bottom gold accent */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-secondary/30 to-transparent" />
    </section>
  )
}

export default Hero

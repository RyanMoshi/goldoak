'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Bot, Building2, LogIn, Shield } from 'lucide-react'
import AnimatedSection from './AnimatedSection'
import { contact } from '@/lib/contact'

/** Landing hero: one message, four clear doors. */
const Hero = () => {
  const wa = `https://wa.me/${contact.superAgentWhatsApp}?text=${encodeURIComponent('MENU')}`
  return (
    <section className="relative flex min-h-[86vh] items-center overflow-hidden hero-gradient-navy">
      <div className="absolute inset-0 opacity-[0.03]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>
      <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-transparent via-secondary to-transparent" />

      <div className="container-custom relative z-10 px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <AnimatedSection animation="fade-up" delay={100}>
              <div className="badge-gold mb-8 inline-flex">
                <Shield className="h-4 w-4" />
                Insurance solutions, not just policies
              </div>
            </AnimatedSection>
            <AnimatedSection animation="fade-up" delay={200}>
              <h1 className="mb-6 font-serif text-display text-white">
                Understand the risk first. <span className="italic text-secondary">The policy comes after.</span>
              </h1>
            </AnimatedSection>
            <AnimatedSection animation="fade-up" delay={300}>
              <p className="mb-10 max-w-2xl text-body-lg leading-relaxed text-gray-300">
                GoldOak finds, compares and places cover for individuals, growing businesses and organisations, then stays with you through every renewal and claim. Super Agent, our insurance assistant, keeps it all in one place: on the website or on WhatsApp.
              </p>
            </AnimatedSection>
            <AnimatedSection animation="fade-up" delay={400}>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link href="/signup" className="group inline-flex items-center justify-center gap-2 rounded-lg bg-secondary px-7 py-4 text-lg font-semibold text-white transition-all duration-300 hover:bg-gold-500">
                  Get started
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link href="/super-agent#ask" className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-white/30 px-7 py-4 text-lg font-semibold text-white transition-all duration-300 hover:bg-white/10">
                  <Bot className="h-5 w-5 text-secondary" /> Talk to the AI
                </Link>
              </div>
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-300">
                <Link href="/signin" className="inline-flex items-center gap-1.5 hover:text-white">
                  <LogIn className="h-4 w-4 text-secondary" /> Sign in
                </Link>
                <Link href="/super-agent#agencies" className="inline-flex items-center gap-1.5 hover:text-white">
                  <Building2 className="h-4 w-4 text-secondary" /> For agencies
                </Link>
                <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-white">
                  WhatsApp <span className="font-mono text-secondary">{contact.superAgentWhatsAppDisplay}</span>
                </a>
              </div>
            </AnimatedSection>
          </div>

          <div className="lg:col-span-5">
            <AnimatedSection animation="fade-up" delay={500}>
              <div className="relative mx-auto max-w-sm rounded-3xl border border-white/15 bg-white/5 p-6 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <Image src="/assets/Gold Icon.png" alt="GoldOak" width={56} height={56} className="size-14 rounded-2xl" priority />
                  <div>
                    <p className="font-serif text-lg font-semibold text-white">Super Agent</p>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-secondary">by GoldOak</p>
                  </div>
                </div>
                <ol className="mt-5 space-y-2.5 text-sm text-gray-200">
                  <li className="flex gap-3">
                    <span className="font-mono text-secondary">1</span> Tell us what you want to protect.
                  </li>
                  <li className="flex gap-3">
                    <span className="font-mono text-secondary">2</span> Your adviser compares the market on identical terms.
                  </li>
                  <li className="flex gap-3">
                    <span className="font-mono text-secondary">3</span> Follow every quote, renewal and claim here or on WhatsApp.
                  </li>
                </ol>
                <p className="mt-5 border-t border-white/10 pt-4 text-xs text-gray-400">Licensed insurance intermediary · Nairobi, Kenya</p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-secondary/30 to-transparent" />
    </section>
  )
}

export default Hero

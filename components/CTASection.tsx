'use client'

import Link from 'next/link'
import { ArrowRight, Phone, MessageCircle } from 'lucide-react'
import AnimatedSection from './AnimatedSection'
import { contact } from '@/lib/contact'

const CTASection = () => {
  return (
    <section className="section-padding bg-section-cream">
      <div className="container-custom">
        <AnimatedSection>
          <div className="bg-white rounded-3xl p-8 md:p-12 lg:p-16 border border-gray-100 shadow-sm">
            <div className="max-w-3xl mx-auto text-center">
              <div className="badge-gold mb-6 inline-flex">
                Start with a conversation
              </div>
              <h2 className="font-serif text-heading-1 font-medium text-text-headline mb-4">
                Tell us what you own, what you run and who depends on you.
              </h2>
              <p className="text-body-lg text-text-body mb-8 max-w-xl mx-auto">
                We will come back with the options worth considering and the reasoning behind each one.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="btn-primary inline-flex items-center justify-center gap-2 group"
                >
                  Start a Risk Review
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a
                  href={`tel:${contact.phoneRaw}`}
                  className="btn-outline inline-flex items-center justify-center gap-2"
                >
                  <Phone className="w-5 h-5" />
                  Call {contact.phone}
                </a>
              </div>

              <div className="mt-6 flex items-center justify-center gap-4 text-sm text-text-body">
                <a
                  href={contact.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-secondary hover:text-gold-500 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </a>
                <span className="text-gray-300">|</span>
                <a href={`mailto:${contact.email}`} className="hover:text-primary transition-colors">
                  {contact.email}
                </a>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}

export default CTASection

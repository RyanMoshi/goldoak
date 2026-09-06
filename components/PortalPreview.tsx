'use client'

import Link from 'next/link'
import { ArrowRight, ListChecks, MessageCircle, ShieldCheck, Sparkles } from 'lucide-react'
import AnimatedSection from './AnimatedSection'
import { contact } from '@/lib/contact'

const points = [
  { icon: ListChecks, title: 'See your progress', text: 'Understand → Solve → Compare → Implement → Support → Review. You always know which stage we are at.' },
  { icon: ShieldCheck, title: 'Every policy in one place', text: 'Insurer, premium, renewal date, what is covered and the exclusions that matter.' },
  { icon: MessageCircle, title: 'Or just use WhatsApp', text: 'STATUS, POLICIES, QUOTES, CLAIMS, QUOTE, CLAIM. One word from your registered number and the answer comes straight back.' },
]

/** Homepage section introducing Super Agent. One door: the Super Agent page. */
const PortalPreview = () => {
  return (
    <section className="section-padding bg-white" id="super-agent">
      <div className="container-custom">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <AnimatedSection animation="fade-up">
            <div className="badge-gold mb-6 inline-flex"><Sparkles className="w-4 h-4" /> Super Agent</div>
            <h2 className="font-serif text-heading-1 font-medium text-text-headline mb-4">Follow your cover from the first conversation to the claim.</h2>
            <p className="text-body-lg text-text-body mb-8 max-w-xl">
              Super Agent is GoldOak’s insurance operating system. Clients see exactly where things stand and can ask for cover or report a claim in two taps. Reminders come to them. And everything works on WhatsApp too.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link href="/super-agent" className="btn-secondary inline-flex items-center justify-center gap-2 group">
                Open Super Agent
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </AnimatedSection>

          <div className="grid gap-4">
            {points.map((point, index) => {
              const Icon = point.icon
              return (
                <AnimatedSection key={point.title} animation="fade-up" delay={100 + index * 100}>
                  <div className="card-premium p-6 flex gap-4">
                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary text-secondary">
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="font-serif text-lg font-medium text-text-headline">{point.title}</h3>
                      <p className="mt-1 text-body-sm text-text-body">{point.text}</p>
                    </div>
                  </div>
                </AnimatedSection>
              )
            })}
            <AnimatedSection animation="fade-up" delay={400}>
              <a
                href={`https://wa.me/${contact.superAgentWhatsApp}?text=${encodeURIComponent('STATUS')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-xl border border-gold-200 bg-gold-50 px-6 py-4 text-sm text-text-headline hover:bg-gold-100 transition-colors"
              >
                <span>
                  <span className="font-semibold">Try it:</span> WhatsApp <span className="font-mono">{contact.superAgentWhatsAppDisplay}</span> with the word <span className="font-mono">STATUS</span>
                </span>
                <ArrowRight className="w-4 h-4 text-secondary" aria-hidden="true" />
              </a>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </section>
  )
}

export default PortalPreview

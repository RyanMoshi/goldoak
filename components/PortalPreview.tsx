'use client'

import Link from 'next/link'
import { ArrowRight, ListChecks, MessageCircle, ShieldCheck } from 'lucide-react'
import AnimatedSection from './AnimatedSection'
import { contact } from '@/lib/contact'

const points = [
  {
    icon: ListChecks,
    title: 'See your progress',
    text: 'Understand → Solve → Compare → Implement → Support → Review. You always know which stage we are at and what happens next.',
  },
  {
    icon: ShieldCheck,
    title: 'Every policy in one place',
    text: 'Insurer, premium, renewal date, what is covered and the exclusions that matter, across all your policies.',
  },
  {
    icon: MessageCircle,
    title: 'Ask on WhatsApp',
    text: 'Message us from your registered number with one word: status, policies, quotes or claims. The answer comes straight back.',
  },
]

/** Homepage section introducing the client portal and the agency workspace. */
const PortalPreview = () => {
  return (
    <section className="section-padding bg-white" id="client-portal">
      <div className="container-custom">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <AnimatedSection animation="fade-up">
            <div className="badge-gold mb-6 inline-flex">Your insurance, online</div>
            <h2 className="font-serif text-heading-1 font-medium text-text-headline mb-4">Follow your cover from the first conversation to the claim.</h2>
            <p className="text-body-lg text-text-body mb-8 max-w-xl">
              Create a free account and see exactly where things stand: the stage of your risk review, the quotes coming in, the policies in force and any claim in progress. Or just ask on WhatsApp.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link href="/signup" className="btn-secondary inline-flex items-center justify-center gap-2 group">
                Create your account
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/signin?as=client" className="btn-outline inline-flex items-center justify-center gap-2">
                Sign in
              </Link>
            </div>
            <p className="mt-6 text-sm text-text-body">
              Already a client? Sign in to see your progress. GoldOak advisers sign in to{' '}
              <Link href="/signin?as=agency" className="font-semibold text-primary hover:underline">
                Super Agent
              </Link>
              .
            </p>
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
                href={`${contact.whatsapp}?text=${encodeURIComponent('status')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-xl border border-gold-200 bg-gold-50 px-6 py-4 text-sm text-text-headline hover:bg-gold-100 transition-colors"
              >
                <span>
                  <span className="font-semibold">Try it:</span> WhatsApp <span className="font-mono">{contact.phone}</span> with the word <span className="font-mono">status</span>
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

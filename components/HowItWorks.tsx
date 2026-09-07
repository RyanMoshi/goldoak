'use client'

import Link from 'next/link'
import { ArrowRight, Bot, Building2, FileUp, MessageCircle, ShieldAlert, UserRound } from 'lucide-react'
import AnimatedSection from './AnimatedSection'
import { superAgentLink } from '@/lib/contact'

const steps = [
  { n: '1', title: 'Say what you need', text: 'On the website or on WhatsApp. Sign up in two minutes, or just ask a question.' },
  { n: '2', title: 'Your adviser gets to work', text: 'They understand your risk, compare the market on identical terms and recommend what fits.' },
  { n: '3', title: 'Follow everything in one place', text: 'Quotes, policies, renewals, claims and documents, with reminders that reach you.' },
]

const answers = [
  { icon: Bot, q: 'Need help with insurance?', a: 'Ask the assistant anything about cover, in plain language. It hands the hard questions to a person.', href: '/super-agent#ask', cta: 'Talk to the AI' },
  { icon: ShieldAlert, q: 'Want to submit a claim?', a: 'Report it from your portal or reply 9 on WhatsApp. It is registered within 24 hours and updated weekly.', href: '/signin?as=client', cta: 'Sign in to report' },
  { icon: FileUp, q: 'Need to upload a document?', a: 'Send a photo or PDF of your ID, logbook or policy. We read it and ask you to confirm what we found.', href: '/signin?as=client', cta: 'Upload a document' },
  { icon: UserRound, q: 'Want to talk to an agent?', a: 'Reply 7 on WhatsApp or ask in your portal. A person from your agency takes over the chat.', href: superAgentLink('Hi, I would like to talk to an agent'), cta: 'Chat on WhatsApp', external: true },
  { icon: Building2, q: 'Run an agency?', a: 'Get a workspace for clients, conversations, claims, documents and reports, with an assistant that does the chasing.', href: '/agencies/signup', cta: 'Register your agency' },
  { icon: MessageCircle, q: 'Prefer WhatsApp for everything?', a: 'Open Super Agent on WhatsApp and reply with a number. Sign up, ask, upload, check a request, all from your phone.', href: superAgentLink(), cta: 'Open WhatsApp', external: true },
]

/** How it works in three steps, then the questions visitors actually arrive with. */
export default function HowItWorks() {
  return (
    <>
      <section className="section-padding bg-white" id="how-it-works">
        <div className="container-custom">
          <AnimatedSection>
            <div className="mx-auto max-w-2xl text-center">
              <div className="badge-gold mb-6 inline-flex">How it works</div>
              <h2 className="mb-4 font-serif text-heading-1 font-medium text-text-headline">Three steps. No jargon, no chasing.</h2>
            </div>
          </AnimatedSection>
          <ol className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map((s, i) => (
              <AnimatedSection key={s.n} animation="fade-up" delay={100 + i * 100}>
                <li className="card-premium h-full p-6">
                  <span className="inline-flex size-10 items-center justify-center rounded-full bg-primary font-mono text-lg font-bold text-secondary">{s.n}</span>
                  <h3 className="mt-4 font-serif text-xl font-medium text-text-headline">{s.title}</h3>
                  <p className="mt-2 text-body-sm text-text-body">{s.text}</p>
                </li>
              </AnimatedSection>
            ))}
          </ol>
        </div>
      </section>

      <section className="section-padding bg-section-cream" id="what-you-can-do">
        <div className="container-custom">
          <AnimatedSection>
            <div className="mx-auto max-w-2xl text-center">
              <div className="badge-gold mb-6 inline-flex">What you can do</div>
              <h2 className="mb-4 font-serif text-heading-1 font-medium text-text-headline">Start with the question you came with.</h2>
            </div>
          </AnimatedSection>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {answers.map((item, i) => {
              const Icon = item.icon
              const inner = (
                <>
                  <span className="inline-flex size-11 items-center justify-center rounded-full bg-primary text-secondary">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 font-serif text-xl font-medium text-text-headline">{item.q}</h3>
                  <p className="mt-2 flex-1 text-body-sm text-text-body">{item.a}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:text-secondary">
                    {item.cta} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </>
              )
              return (
                <AnimatedSection key={item.q} animation="fade-up" delay={50 + i * 60}>
                  {item.external ? (
                    <a href={item.href} target="_blank" rel="noopener noreferrer" className="card-premium group flex h-full flex-col p-6">
                      {inner}
                    </a>
                  ) : (
                    <Link href={item.href} className="card-premium group flex h-full flex-col p-6">
                      {inner}
                    </Link>
                  )}
                </AnimatedSection>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}

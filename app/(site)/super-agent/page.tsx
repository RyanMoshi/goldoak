import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Bell, Building2, FileSearch, ListChecks, MessageCircle, ShieldCheck, Sparkles, UserRound } from 'lucide-react'
import { contact } from '@/lib/contact'

export const metadata: Metadata = {
  title: 'Super Agent',
  description: 'Super Agent is GoldOak’s insurance operating system. Clients follow their cover from the first conversation to the claim, on the site or on WhatsApp. Agencies run the whole book from one workspace.',
}

const clientPoints = [
  { icon: ListChecks, title: 'See your progress', text: 'Understand → Solve → Compare → Implement → Support → Review. You always know which stage we are at and what happens next.' },
  { icon: ShieldCheck, title: 'Every policy in one place', text: 'Insurer, premium, renewal date, what is covered and the exclusions that matter.' },
  { icon: FileSearch, title: 'Ask for cover, report a claim', text: 'Two taps on the site, or one word on WhatsApp. Your adviser picks it up the same day.' },
  { icon: Bell, title: 'Reminders that find you', text: 'Renewals at 30, 14, 7 and 1 days. Quote replies as they arrive. Claim updates every week.' },
]

const commands = ['STATUS', 'POLICIES', 'QUOTES', 'CLAIMS', 'QUOTE', 'CLAIM', 'UPDATES', 'ADVISER']

export default function SuperAgentPage() {
  const wa = `https://wa.me/${contact.superAgentWhatsApp}?text=${encodeURIComponent('STATUS')}`
  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden hero-gradient-navy">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-secondary to-transparent" aria-hidden="true" />
        <div className="container-custom px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="max-w-3xl">
            <div className="badge-gold mb-6 inline-flex"><Sparkles className="w-4 h-4" /> GoldOak Insurance OS</div>
            <h1 className="font-serif text-display text-white mb-6">
              Super Agent. <span className="text-secondary italic">Your insurance, in one place.</span>
            </h1>
            <p className="text-body-lg text-gray-300 max-w-2xl mb-10">
              Follow your cover from the first conversation to the policy, the renewal and the claim. On the website or on WhatsApp, whichever you prefer. Your adviser sees the same file and works it the same way.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link href="/signup" className="bg-secondary text-white px-8 py-4 rounded-lg font-semibold hover:bg-gold-500 transition-all duration-300 inline-flex items-center justify-center gap-2 group text-lg">
                Create your free account <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/signin?as=client" className="border-2 border-white/30 text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-all duration-300 inline-flex items-center justify-center gap-2 text-lg">
                <UserRound className="w-5 h-5" /> Client sign in
              </Link>
            </div>
            <p className="mt-6 text-sm text-gray-400">
              Or skip the website: WhatsApp <a href={wa} className="font-mono text-secondary hover:underline" target="_blank" rel="noopener noreferrer">{contact.superAgentWhatsAppDisplay}</a> with the word <span className="font-mono text-white">STATUS</span>.
            </p>
          </div>
        </div>
      </section>

      <section id="clients" className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <div className="badge-gold mb-6 inline-flex">For clients</div>
              <h2 className="font-serif text-heading-1 font-medium text-text-headline mb-4">Nothing to chase. Nothing to guess.</h2>
              <p className="text-body-lg text-text-body mb-8 max-w-xl">Create an account once, with the number you use on WhatsApp. From then on the site and WhatsApp show the same thing, and reminders come to you.</p>
              <div className="rounded-2xl border border-gold-200 bg-gold-50 p-6">
                <p className="font-semibold text-text-headline">On WhatsApp, one word does it</p>
                <ul className="mt-3 grid grid-cols-2 gap-2 font-mono text-sm text-text-headline sm:grid-cols-4">
                  {commands.map((c) => <li key={c} className="rounded-lg bg-white px-3 py-2 text-center border border-gold-200">{c}</li>)}
                </ul>
                <p className="mt-3 text-sm text-text-body">Send any of these to <span className="font-mono">{contact.superAgentWhatsAppDisplay}</span> from your registered number.</p>
              </div>
            </div>
            <div className="grid gap-4">
              {clientPoints.map((p) => {
                const Icon = p.icon
                return (
                  <div key={p.title} className="card-premium p-6 flex gap-4">
                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary text-secondary"><Icon className="w-5 h-5" aria-hidden="true" /></span>
                    <div>
                      <h3 className="font-serif text-lg font-medium text-text-headline">{p.title}</h3>
                      <p className="mt-1 text-body-sm text-text-body">{p.text}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <section id="agencies" className="section-padding bg-section-cream">
        <div className="container-custom">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="order-2 lg:order-1 grid gap-4">
              {[
                ['Today', 'Every lead, quote, renewal and claim with a service deadline, prioritised. New sign-ups appear as leads by themselves.'],
                ['Clients', 'One record per client: stage, policies, quotes, claims, history. Move a stage or update a claim and the client is told.'],
                ['Ask it anything', '“Which quotes are still outstanding?”, “Clients without WIBA cover”, “Find Mwangi”. Answered from your own records, on the site or on WhatsApp.'],
                ['Automation', 'Renewal reminders, quote chasers and weekly claim updates are scheduled for you. Nothing lives in someone’s head.'],
              ].map(([t, d]) => (
                <div key={t} className="card-premium p-6">
                  <h3 className="font-serif text-lg font-medium text-text-headline">{t}</h3>
                  <p className="mt-1 text-body-sm text-text-body">{d}</p>
                </div>
              ))}
            </div>
            <div className="order-1 lg:order-2">
              <div className="badge-gold mb-6 inline-flex"><Building2 className="w-4 h-4" /> For agencies</div>
              <h2 className="font-serif text-heading-1 font-medium text-text-headline mb-4">The workspace behind the advice.</h2>
              <p className="text-body-lg text-text-body mb-8 max-w-xl">Agency accounts are created by the GoldOak platform admin. If you have yours, sign in below.</p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link href="/signin?as=agency" className="btn-primary inline-flex items-center justify-center gap-2 group">
                  Agency sign in <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a href={`mailto:${contact.email}?subject=Super%20Agent%20agency%20access`} className="btn-outline inline-flex items-center justify-center gap-2">
                  <MessageCircle className="w-5 h-5" /> Ask for access
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Bell, Bot, Building2, FileSearch, ListChecks, LogIn, MessageCircle, ShieldCheck, UserRound, Users } from 'lucide-react'
import { AskWidget } from '@/components/site/AskWidget'
import { contact } from '@/lib/contact'

export const metadata: Metadata = {
  title: 'Super Agent',
  description: 'Super Agent is the insurance assistant and operating system behind GoldOak. Clients follow their cover from the first conversation to the claim, on the site or on WhatsApp. Agencies run the whole book from one workspace.',
}

const clientPoints = [
  { icon: ListChecks, title: 'See your progress', text: 'Understand, Solve, Compare, Implement, Support, Review. You always know which stage you are at and what happens next.' },
  { icon: ShieldCheck, title: 'Every policy in one place', text: 'Insurer, premium, renewal date, what is covered and the exclusions that matter. Branded PDFs whenever you need them.' },
  { icon: FileSearch, title: 'Ask for cover, report a claim', text: 'Two taps on the site, or reply 5 or 6 on WhatsApp. Your adviser picks it up the same day.' },
  { icon: Bell, title: 'Reminders that find you', text: 'Renewals at 30, 14, 7 and 1 days. Quote replies as they arrive. Claim updates every week.' },
]

const agencyPoints = [
  { icon: Users, title: 'One workspace for the whole book', text: 'Today queue, pipeline, quotes, renewals, claims, insurers and reports. Nothing invented: every number comes from your own records.' },
  { icon: MessageCircle, title: 'Your own WhatsApp front door', text: 'One shared Super Agent number, strictly separated per agency. Clients reach you with your join code or link; your team replies from the dashboard when the assistant hands over.' },
  { icon: Bot, title: 'An assistant that knows when to stop', text: 'It signs clients up, takes quote and claim details step by step, answers cover questions, and hands anything sensitive to a person.' },
]

const menu = ['Where things stand', 'My policies', 'My quotes', 'My claims', 'Ask for cover', 'Report a claim', 'Ask a question', 'Recent updates', 'Talk to an adviser']

export default function SuperAgentPage() {
  const wa = `https://wa.me/${contact.superAgentWhatsApp}?text=${encodeURIComponent('MENU')}`
  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden hero-gradient-navy">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-secondary to-transparent" aria-hidden="true" />
        <div className="container-custom px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            <div className="max-w-2xl lg:col-span-7">
              <div className="mb-6 flex items-center gap-3">
                <Image src="/assets/Gold Icon.png" alt="" width={48} height={48} className="size-12 rounded-xl" priority />
                <span className="font-serif text-sm font-bold uppercase tracking-[0.14em] text-secondary">Super Agent · by GoldOak</span>
              </div>
              <h1 className="mb-6 font-serif text-display text-white">
                Your insurance, <span className="italic text-secondary">in one place.</span>
              </h1>
              <p className="mb-8 text-body-lg text-gray-300">Follow your cover from the first conversation to the policy, the renewal and the claim. On the website or on WhatsApp, whichever you prefer. Your adviser sees the same file and works it the same way.</p>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link href="/signup" className="group inline-flex items-center justify-center gap-2 rounded-lg bg-secondary px-7 py-4 text-lg font-semibold text-white transition-all hover:bg-gold-500">
                  Sign up free <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <a href="#ask" className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-white/30 px-7 py-4 text-lg font-semibold text-white transition-all hover:bg-white/10">
                  <Bot className="h-5 w-5 text-secondary" /> Talk to the AI
                </a>
              </div>
              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-300">
                <Link href="/signin?as=client" className="inline-flex items-center gap-1.5 hover:text-white">
                  <UserRound className="h-4 w-4 text-secondary" /> Client sign in
                </Link>
                <Link href="/signin?as=agency" className="inline-flex items-center gap-1.5 hover:text-white">
                  <LogIn className="h-4 w-4 text-secondary" /> Agency sign in
                </Link>
                <a href="#agencies" className="inline-flex items-center gap-1.5 hover:text-white">
                  <Building2 className="h-4 w-4 text-secondary" /> For agencies
                </a>
              </div>
            </div>
            <div id="ask" className="scroll-mt-24 lg:col-span-5">
              <AskWidget />
            </div>
          </div>
        </div>
      </section>

      <section id="clients" className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <div className="badge-gold mb-6 inline-flex">For clients</div>
              <h2 className="mb-4 font-serif text-heading-1 font-medium text-text-headline">Nothing to chase. Nothing to guess.</h2>
              <p className="mb-8 max-w-xl text-body-lg text-text-body">Create an account once, with the number you use on WhatsApp. From then on the site and WhatsApp show the same thing, and reminders come to you.</p>
              <div className="rounded-2xl border border-gold-200 bg-gold-50 p-6">
                <p className="font-semibold text-text-headline">On WhatsApp, reply with a number</p>
                <ol className="mt-3 grid grid-cols-1 gap-1.5 text-sm text-text-headline sm:grid-cols-3">
                  {menu.map((m, i) => (
                    <li key={m} className="flex gap-2 rounded-lg border border-gold-200 bg-white px-3 py-2">
                      <span className="font-mono text-secondary">{i + 1}</span> {m}
                    </li>
                  ))}
                </ol>
                <p className="mt-3 text-sm text-text-body">
                  Save <span className="font-mono">{contact.superAgentWhatsAppDisplay}</span> as Super Agent and send MENU from your registered number. New here? Send{' '}
                  <a href={wa} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary underline-offset-2 hover:underline">
                    a message
                  </a>{' '}
                  and reply 1 to sign up from your phone.
                </p>
              </div>
            </div>
            <div className="grid gap-4">
              {clientPoints.map((p) => {
                const Icon = p.icon
                return (
                  <div key={p.title} className="card-premium flex gap-4 p-6">
                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-secondary">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
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

      <section id="agencies" className="section-padding scroll-mt-20 bg-section-cream">
        <div className="container-custom">
          <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="grid gap-4">
              {agencyPoints.map((p) => {
                const Icon = p.icon
                return (
                  <div key={p.title} className="card-premium flex gap-4 p-6">
                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-secondary">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="font-serif text-lg font-medium text-text-headline">{p.title}</h3>
                      <p className="mt-1 text-body-sm text-text-body">{p.text}</p>
                    </div>
                  </div>
                )
              })}
            </div>
            <div>
              <div className="badge-gold mb-6 inline-flex">For agencies</div>
              <h2 className="mb-4 font-serif text-heading-1 font-medium text-text-headline">Run the whole book, and let the assistant do the chasing.</h2>
              <p className="mb-6 max-w-xl text-body-lg text-text-body">Agencies join by invitation. GoldOak creates your agency and your first admin login; you invite your own advisers, set your WhatsApp join code and greeting, and start working the queue.</p>
              <ul className="mb-8 space-y-2 text-sm text-text-body">
                <li>· Strict separation: your clients, conversations and reports are yours alone.</li>
                <li>· Roles: agency admin, agency staff. Clients see only their own file.</li>
                <li>· Works on a phone: bottom tabs, cards instead of tables, one-thumb replies.</li>
              </ul>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/contact" className="btn-primary inline-flex items-center justify-center gap-2">
                  Request an agency account <ArrowRight className="h-5 w-5" />
                </Link>
                <Link href="/signin?as=agency" className="btn-outline inline-flex items-center justify-center gap-2">
                  <LogIn className="h-5 w-5" /> Agency sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

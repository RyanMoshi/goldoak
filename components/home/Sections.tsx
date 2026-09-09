import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Check, Phone, Mail, MapPin, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/cn'
import { contact } from '@/lib/contact'
import { company, differentiators, figures, howWeWork, productLines, setup, whatAnAgencyDoes } from '@/lib/company'

/**
 * The GoldOak home page, section by section.
 *
 * Every line of copy here comes from the company profile. The job of the page
 * is to make that material scannable: one idea per section, the strongest
 * sentence given room, and a single clear action at the end of each. Nothing
 * is invented, and the facts the company has not yet supplied (licence
 * number, registered address) are simply not claimed.
 */

function Section({ id, className, children }: { id?: string; className?: string; children: React.ReactNode }) {
  return (
    <section id={id} className={cn('px-4 py-16 sm:px-6 sm:py-20 lg:py-24', className)}>
      <div className="mx-auto w-full max-w-6xl">{children}</div>
    </section>
  )
}

function Eyebrow({ children, on = 'light' }: { children: React.ReactNode; on?: 'light' | 'forest' }) {
  return (
    <p className={cn('flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em]', on === 'forest' ? 'text-gold' : 'text-gold-700')}>
      <span aria-hidden="true" className="inline-block size-1.5 rounded-full bg-gold" />
      {children}
    </p>
  )
}

/* ---------------------------------------------------------------- Hero --- */

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-forest text-white">
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 size-[28rem] rounded-full bg-gold/10 blur-3xl" />
      <div className="relative mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:py-32">
        <div className="max-w-3xl">
          <Eyebrow on="forest">{company.regulatoryNote}</Eyebrow>
          <h1 className="mt-5 font-serif text-[34px] font-medium leading-[1.1] tracking-[-0.01em] sm:text-[52px] lg:text-[60px]">
            Protection, considered.
            <br />
            <span className="text-gold">Service, sustained.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-[16px] leading-7 text-white/80 sm:text-[18px] sm:leading-8">{company.positioning}</p>
          <p className="mt-4 max-w-2xl text-[15px] leading-7 text-white/65">{company.whatWeDo}</p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/contact"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-control bg-gold px-6 text-[15px] font-bold text-forest transition-colors hover:bg-gold-500 focus-ring"
            >
              Get a quote <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <a
              href={`tel:${contact.phoneRaw}`}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-control border border-white/25 px-6 text-[15px] font-semibold text-white transition-colors hover:border-white/60 focus-ring"
            >
              <Phone className="size-4" aria-hidden="true" /> Talk to GoldOak
            </a>
          </div>

          <p className="mt-8 text-[14px] italic leading-6 text-white/55">“{company.promise}”</p>
        </div>

        <dl className="mt-14 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-white/15 pt-8 lg:grid-cols-4">
          {figures.map((f) => (
            <div key={f.label}>
              <dt className="text-[12px] font-semibold uppercase tracking-[0.08em] text-white/50">{f.label}</dt>
              <dd data-numeric className="mt-1 font-serif text-[30px] font-bold leading-none text-gold sm:text-[36px]">
                {f.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

/* --------------------------------------------------------------- About --- */

export function About() {
  return (
    <Section id="about" className="bg-canvas">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <Eyebrow>Who we are</Eyebrow>
          <h2 className="mt-4 font-serif text-[28px] font-medium leading-tight text-forest sm:text-[36px]">An intermediary that sits on your side of the table</h2>
          <p className="mt-5 text-[15.5px] leading-7 text-ink-muted">
            An agency sits between the client and the insurer. Our independence matters: because we place business with a panel of underwriters rather than a single
            company, we can compare terms honestly and recommend on merit. Our remuneration comes from the insurer as commission, so our advice costs you nothing at the
            point of purchase.
          </p>
          <figure className="mt-7 border-l-2 border-gold pl-5">
            <blockquote className="font-serif text-[17px] italic leading-7 text-forest">“{company.leadershipLine}”</blockquote>
          </figure>
        </div>

        <div className="lg:col-span-7">
          <ol className="space-y-4">
            {whatAnAgencyDoes.map((step, i) => (
              <li key={step.title} className="flex gap-4 rounded-card border border-line bg-surface p-5">
                <span aria-hidden="true" className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-forest font-serif text-[15px] font-bold text-gold">
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-[16px] font-bold text-ink">{step.title}</h3>
                  <p className="mt-1 text-[14.5px] leading-6 text-ink-muted">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <ul className="mt-6 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
            {setup.map((item) => (
              <li key={item} className="flex items-start gap-2 text-[13.5px] text-ink">
                <Check className="mt-0.5 size-4 shrink-0 text-gold-700" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-14 grid gap-6 border-t border-line pt-12 sm:grid-cols-2">
        <div>
          <Eyebrow>Vision</Eyebrow>
          <p className="mt-3 font-serif text-[19px] leading-8 text-forest">{company.vision}</p>
        </div>
        <div>
          <Eyebrow>Mission</Eyebrow>
          <p className="mt-3 font-serif text-[19px] leading-8 text-forest">{company.mission}</p>
        </div>
      </div>
    </Section>
  )
}

/* ------------------------------------------------------------ Services --- */

export function Services() {
  return (
    <Section id="services" className="bg-surface">
      <div className="max-w-2xl">
        <Eyebrow>What we place</Eyebrow>
        <h2 className="mt-4 font-serif text-[28px] font-medium leading-tight text-forest sm:text-[36px]">Cover for individuals, families and businesses</h2>
        <p className="mt-4 text-[15.5px] leading-7 text-ink-muted">Six core lines, each placed with the underwriter best suited to carry it.</p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {productLines.map((line) => (
          <article key={line.id} className="flex flex-col rounded-card border border-line bg-canvas p-6 transition-colors hover:border-gold">
            <h3 className="font-serif text-[19px] font-semibold leading-tight text-forest">{line.name}</h3>
            <p className="mt-1.5 text-[12px] font-semibold uppercase tracking-[0.06em] text-gold-700">{line.strapline}</p>
            <p className="mt-3 flex-1 text-[14.5px] leading-6 text-ink-muted">{line.summary}</p>
            <Link href={`/solutions#${line.id}`} className="mt-5 inline-flex items-center gap-1.5 text-[13.5px] font-bold text-forest hover:gap-2.5 focus-ring">
              Learn more <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </article>
        ))}
      </div>

      <p className="mt-8 max-w-3xl text-[14.5px] leading-6 text-ink-muted">
        Not listed here does not mean unavailable. If you carry a risk we do not routinely place, we will tell you honestly whether we can source it — and if we cannot,
        who can.
      </p>
    </Section>
  )
}

/* --------------------------------------------------------- Why GoldOak --- */

export function WhyGoldOak() {
  return (
    <Section id="why" className="bg-canvas">
      <div className="max-w-2xl">
        <Eyebrow>Why GoldOak</Eyebrow>
        <h2 className="mt-4 font-serif text-[28px] font-medium leading-tight text-forest sm:text-[36px]">Why clients place their business with us — and renew it</h2>
      </div>

      <div className="mt-10 grid gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
        {differentiators.map((d) => (
          <div key={d.number} className="bg-surface p-6">
            <span aria-hidden="true" className="font-serif text-[13px] font-bold text-gold">
              {d.number}
            </span>
            <h3 className="mt-2 text-[16px] font-bold leading-snug text-ink">{d.title}</h3>
            <p className="mt-2 text-[14px] leading-6 text-ink-muted">{d.body}</p>
          </div>
        ))}
        <div className="flex flex-col justify-center bg-forest p-6 text-white">
          <ShieldCheck className="size-6 text-gold" aria-hidden="true" />
          <p className="mt-3 font-serif text-[16px] leading-7">{company.oakLine}</p>
        </div>
      </div>
    </Section>
  )
}

/* -------------------------------------------------------- How we work ---- */

export function HowWeWork() {
  return (
    <Section id="how-we-work" className="bg-surface">
      <div className="max-w-2xl">
        <Eyebrow>How we work</Eyebrow>
        <h2 className="mt-4 font-serif text-[28px] font-medium leading-tight text-forest sm:text-[36px]">Five stages, each with something you can hold us to</h2>
        <p className="mt-4 text-[15.5px] leading-7 text-ink-muted">You should never be unsure which stage you are at or what happens next.</p>
      </div>

      <ol className="mt-10 space-y-3">
        {howWeWork.map((stage) => (
          <li key={stage.step} className="grid gap-3 rounded-card border border-line bg-canvas p-5 sm:grid-cols-12 sm:items-baseline sm:gap-6">
            <div className="sm:col-span-3">
              <p className="font-serif text-[17px] font-semibold text-forest">
                <span className="mr-2 text-gold">{String(stage.step).padStart(2, '0')}</span>
                {stage.title}
              </p>
              <p className="mt-0.5 text-[11.5px] font-bold uppercase tracking-[0.08em] text-ink-faint">{stage.timing}</p>
            </div>
            <p className="text-[14.5px] leading-6 text-ink-muted sm:col-span-6">{stage.body}</p>
            <p className="text-[13px] leading-5 text-ink sm:col-span-3">
              <span className="block text-[11px] font-bold uppercase tracking-[0.06em] text-gold-700">Output</span>
              {stage.output}
            </p>
          </li>
        ))}
      </ol>
    </Section>
  )
}

/* ---------------------------------------------------------------- Value -- */

export function ClientValue() {
  return (
    <Section className="bg-forest text-white">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-6">
          <Eyebrow on="forest">The test we apply</Eyebrow>
          <p className="mt-5 font-serif text-[22px] leading-9 sm:text-[26px] sm:leading-10">{company.theTest}</p>
        </div>
        <div className="lg:col-span-6">
          <h2 className="font-serif text-[22px] font-medium leading-tight text-gold">When it matters most</h2>
          <p className="mt-3 text-[15px] leading-7 text-white/75">
            Insurance claims can be complex and time-consuming. With GoldOak, you are never alone. We act as your representative to the insurer, not the insurer’s
            representative to you.
          </p>
          <ul className="mt-6 space-y-2.5">
            {[
              ['Claim acknowledged', 'Within 1 working day of notification'],
              ['Claim registered with underwriter', 'Within 1 working day of documentation'],
              ['Claim status update', 'At least every 7 days until settlement'],
              ['Renewal review initiated', '30 days before policy expiry'],
            ].map(([commitment, standard]) => (
              <li key={commitment} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-white/10 pb-2.5 text-[14px]">
                <span className="text-white/85">{commitment}</span>
                <span className="font-semibold text-gold">{standard}</span>
              </li>
            ))}
          </ul>
          <Link href="/how-we-work" className="mt-6 inline-flex items-center gap-1.5 text-[13.5px] font-bold text-gold hover:gap-2.5 focus-ring">
            Read our full service charter <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </Section>
  )
}

/* ------------------------------------------------------------------ CTA -- */

export function CallToAction() {
  return (
    <Section className="bg-canvas">
      <div className="rounded-card border border-line bg-surface px-6 py-12 text-center sm:px-12 sm:py-16">
        <h2 className="mx-auto max-w-2xl font-serif text-[28px] font-medium leading-tight text-forest sm:text-[36px]">Ready to protect what matters?</h2>
        <p className="mx-auto mt-4 max-w-xl text-[15.5px] leading-7 text-ink-muted">
          Send us your current policy schedule and we will tell you, free of charge, where the gaps are.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/contact"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-control bg-forest px-6 text-[15px] font-bold text-white transition-colors hover:bg-forest-700 focus-ring"
          >
            Get started <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <a
            href={`tel:${contact.phoneRaw}`}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-control border border-line px-6 text-[15px] font-semibold text-ink transition-colors hover:border-forest hover:text-forest focus-ring"
          >
            <Phone className="size-4" aria-hidden="true" /> {contact.phone}
          </a>
        </div>
      </div>
    </Section>
  )
}

/* -------------------------------------------------------------- Contact -- */

export function ContactStrip() {
  const items = [
    { icon: Phone, label: 'Telephone', value: contact.phone, href: `tel:${contact.phoneRaw}`, note: 'The fastest route for an urgent claim.' },
    { icon: Mail, label: 'Email', value: contact.email, href: `mailto:${contact.email}`, note: 'Attach documents and we will confirm receipt.' },
    { icon: MapPin, label: 'Office', value: company.city, href: null, note: 'We will come to your home, office or site anywhere in Nairobi.' },
  ]
  return (
    <Section id="contact" className="bg-surface">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <Eyebrow>Contact</Eyebrow>
          <h2 className="mt-4 font-serif text-[28px] font-medium leading-tight text-forest sm:text-[32px]">Talk to us</h2>
          <p className="mt-4 text-[15px] leading-7 text-ink-muted">Opening an account takes one conversation and a short list of documents.</p>
        </div>
        <dl className="grid gap-5 sm:grid-cols-3 lg:col-span-8">
          {items.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.label} className="rounded-card border border-line bg-canvas p-5">
                <Icon className="size-5 text-gold-700" aria-hidden="true" />
                <dt className="mt-3 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-faint">{item.label}</dt>
                <dd className="mt-1 text-[15px] font-bold text-ink">
                  {item.href ? (
                    <a href={item.href} className="hover:text-forest focus-ring">
                      {item.value}
                    </a>
                  ) : (
                    item.value
                  )}
                </dd>
                <p className="mt-2 text-[13px] leading-5 text-ink-muted">{item.note}</p>
              </div>
            )
          })}
        </dl>
      </div>
    </Section>
  )
}

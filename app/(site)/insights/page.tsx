import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { insights } from '@/lib/insights'

export const metadata: Metadata = {
  title: 'Know your cover — GoldOak Insurance Agency',
  description: 'Short, plain answers to the insurance questions that decide whether a policy actually responds.',
}

/**
 * The explainers, published as pages rather than buried in a chat. They are
 * the same answers the assistant gives, from one source, so a visitor gets
 * consistent wording whether they read or ask.
 */
export default function InsightsPage() {
  return (
    <>
      <section className="bg-forest px-4 py-16 text-white sm:px-6 sm:py-20">
        <div className="mx-auto w-full max-w-6xl">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-gold">
            <span aria-hidden="true" className="inline-block size-1.5 rounded-full bg-gold" />
            Know your cover
          </p>
          <h1 className="mt-5 max-w-3xl font-serif text-[32px] font-medium leading-tight sm:text-[44px]">The questions that decide whether a policy responds</h1>
          <p className="mt-5 max-w-2xl text-[16px] leading-7 text-white/75">
            Short answers, in plain language. If one of them applies to your cover and you are not sure where you stand, ask us — that is what we are for.
          </p>
        </div>
      </section>

      <section className="bg-canvas px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto grid w-full max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {insights.map((insight, i) => (
            <Link
              key={insight.slug}
              href={`/insights/${insight.slug}`}
              className="group flex flex-col rounded-card border border-line bg-surface p-6 transition-colors hover:border-gold focus-ring"
            >
              <span aria-hidden="true" className="font-serif text-[13px] font-bold text-gold">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h2 className="mt-2 font-serif text-[18px] font-semibold leading-snug text-forest">{insight.title}</h2>
              <p className="mt-2 flex-1 text-[14px] leading-6 text-ink-muted">{insight.description}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-bold text-forest group-hover:gap-2.5">
                Read <ArrowRight className="size-3.5" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}

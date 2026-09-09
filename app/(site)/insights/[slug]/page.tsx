import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight, Phone } from 'lucide-react'
import { insightBySlug, insights } from '@/lib/insights'
import { contact } from '@/lib/contact'
import { legalNote } from '@/lib/company'

export function generateStaticParams() {
  return insights.map((i) => ({ slug: i.slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const insight = insightBySlug(params.slug)
  if (!insight) return { title: 'Not found' }
  return { title: `${insight.title} — GoldOak Insurance Agency`, description: insight.description }
}

export default function InsightPage({ params }: { params: { slug: string } }) {
  const insight = insightBySlug(params.slug)
  if (!insight) notFound()
  const index = insights.findIndex((i) => i.slug === insight.slug)
  const next = insights[(index + 1) % insights.length]

  return (
    <article className="bg-canvas">
      <header className="bg-forest px-4 py-14 text-white sm:px-6 sm:py-18">
        <div className="mx-auto w-full max-w-3xl">
          <Link href="/insights" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-white/70 hover:text-white focus-ring">
            <ArrowLeft className="size-4" aria-hidden="true" /> Know your cover
          </Link>
          <h1 className="mt-5 font-serif text-[28px] font-medium leading-tight sm:text-[38px]">{insight.title}</h1>
        </div>
      </header>

      <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        {insight.body.map((paragraph, i) => (
          <p key={i} className="mb-5 text-[16px] leading-8 text-ink">
            {paragraph}
          </p>
        ))}

        {insight.short ? (
          <div className="my-8 rounded-card border-l-2 border-gold bg-surface p-5">
            <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-gold-700">In short</p>
            <p className="mt-1.5 text-[15.5px] leading-7 text-ink">{insight.short}</p>
          </div>
        ) : null}

        <div className="mt-10 flex flex-col gap-3 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
          <a
            href={`tel:${contact.phoneRaw}`}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-control bg-forest px-5 text-[14px] font-semibold text-white hover:bg-forest-700 focus-ring"
          >
            <Phone className="size-4" aria-hidden="true" /> Ask us about your own cover
          </a>
          <Link href={`/insights/${next.slug}`} className="inline-flex items-center gap-1.5 text-[13.5px] font-bold text-forest hover:gap-2.5 focus-ring">
            {next.title} <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>

        <p className="mt-10 text-[12px] leading-5 text-ink-faint">{legalNote}</p>
      </div>
    </article>
  )
}

import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

/** Split layout: brand panel on the left, form on the right. Stacks on phones. */
export function AuthShell({ title, intro, children, aside }: { title: string; intro: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-canvas text-ink lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <aside className="relative flex flex-col justify-between bg-forest px-6 py-6 text-white sm:px-10 lg:min-h-dvh lg:py-10">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent" aria-hidden="true" />
        <Link href="/" className="inline-flex w-fit items-center gap-3 rounded-control focus-ring" aria-label="GoldOak, back to the website">
          <Image src="/assets/Gold Icon.png" alt="" width={44} height={44} className="size-11 rounded-[9px]" priority />
          <span className="flex flex-col leading-none">
            <span className="font-serif text-[17px] font-bold tracking-[0.02em]">GoldOak</span>
            <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-gold">Insurance Solutions</span>
          </span>
        </Link>
        <div className="my-10 max-w-md lg:my-0">
          <h1 className="font-serif text-[30px] font-medium leading-tight sm:text-[36px]">{title}</h1>
          <p className="mt-4 text-[15px] leading-relaxed text-white/75">{intro}</p>
          {aside ? <div className="mt-8">{aside}</div> : null}
        </div>
        <Link href="/" className="hidden w-fit items-center gap-1.5 rounded-control text-[13px] font-semibold text-white/70 hover:text-white focus-ring lg:inline-flex">
          <ArrowLeft className="size-4" aria-hidden="true" /> Back to goldoak.co.ke
        </Link>
      </aside>
      <div className="flex items-start justify-center px-4 py-8 sm:px-8 lg:items-center lg:py-12">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  )
}

export function Field({ label, htmlFor, error, hint, children }: { label: string; htmlFor: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-[13px] font-semibold text-ink">
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
      {error ? (
        <p className="mt-1.5 text-[12.5px] font-semibold text-error" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-[12px] text-ink-faint">{hint}</p>
      ) : null}
    </div>
  )
}

export const inputClass =
  'h-11 w-full rounded-control border border-line bg-surface px-3 text-[15px] text-ink placeholder:text-ink-faint focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest aria-[invalid=true]:border-error'

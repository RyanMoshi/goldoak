import Image from 'next/image'
import Link from 'next/link'
import { LogOut, ShieldCheck } from 'lucide-react'
import { signOutAction } from '@/lib/auth/actions'
import { requireSession } from '@/lib/auth/server'

export const dynamic = 'force-dynamic'

/**
 * The Super Agent console: the AI product, managed on its own terms.
 *
 * It sits at platform level next to the super admin area, not inside any
 * agency, because one assistant serves every tenant. Access is the platform
 * administrator's; an agency configures its own assistant from
 * `/agency/ai`, which is a different, tenant-scoped surface.
 */
const SECTIONS: [string, string][] = [
  ['/superagent', 'Overview'],
  ['/superagent/agencies', 'Agencies'],
  ['/superagent/knowledge', 'Knowledge'],
  ['/superagent/configuration', 'Configuration'],
  ['/superagent/monitoring', 'Monitoring'],
]

export default async function SuperAgentLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession('admin')
  return (
    <div className="min-h-dvh bg-canvas text-ink">
      <header className="sticky top-0 z-20 border-b border-line bg-surface/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/superagent" className="flex shrink-0 items-center gap-2.5 rounded-control focus-ring" aria-label="Super Agent console home">
            <Image src="/assets/Gold Icon.png" alt="" width={36} height={36} className="size-9 rounded-[8px]" priority />
            <span className="flex flex-col leading-none">
              <span className="font-serif text-[15px] font-bold tracking-[0.06em] text-forest">SUPER AGENT</span>
              <span className="mt-1 text-[9.5px] font-bold uppercase tracking-[0.14em] text-gold">AI console</span>
            </span>
          </Link>
          <div className="flex items-center gap-1">
            <span className="hidden text-[13px] text-ink-muted xl:inline">{session.name}</span>
            <Link href="/super-admin" className="inline-flex h-9 items-center gap-2 rounded-control px-2.5 text-[13px] font-semibold text-ink-muted hover:bg-surface-2 hover:text-ink focus-ring">
              <ShieldCheck className="size-4" aria-hidden="true" strokeWidth={1.75} />
              <span className="hidden sm:inline">Platform admin</span>
            </Link>
            <form action={signOutAction}>
              <button type="submit" className="inline-flex h-9 items-center gap-2 rounded-control px-2.5 text-[13px] font-semibold text-ink-muted hover:bg-surface-2 hover:text-ink focus-ring" aria-label="Sign out">
                <LogOut className="size-4" aria-hidden="true" strokeWidth={1.75} />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </form>
          </div>
        </div>
        <nav aria-label="Super Agent sections" className="mx-auto max-w-6xl overflow-x-auto px-4 sm:px-6">
          <ul className="flex min-w-max gap-1 pb-2">
            {SECTIONS.map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="inline-flex h-9 items-center rounded-control px-3 text-[13px] font-semibold text-ink-muted hover:bg-surface-2 hover:text-ink focus-ring">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  )
}

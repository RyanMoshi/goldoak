import Image from 'next/image'
import Link from 'next/link'
import { Building2, LogOut, Mail, MessagesSquare, Server, ShieldCheck, Smartphone, Sparkles, Type } from 'lucide-react'
import { signOutAction } from '@/lib/auth/actions'
import { requireSession } from '@/lib/auth/server'

export const dynamic = 'force-dynamic'

/**
 * The platform console shell.
 *
 * It is deliberately its own product: a dark operator rail on the left, no
 * link into any agency workspace, and nothing shared with the tenant shell
 * beyond the design tokens. Someone signed in here should never be one click
 * from a tenant's data by accident.
 */
const SECTIONS: { href: string; label: string; icon: typeof Building2; hint: string }[] = [
  { href: '/super-admin', label: 'Agencies', icon: Building2, hint: 'Tenants and their accounts' },
  { href: '/superagent', label: 'Super Agent', icon: Sparkles, hint: 'The AI product' },
  { href: '/super-admin/conversations', label: 'Conversations', icon: MessagesSquare, hint: 'Every WhatsApp thread' },
  { href: '/super-admin/channels', label: 'WhatsApp', icon: Smartphone, hint: 'Numbers and gateways' },
  { href: '/super-admin/emails', label: 'Emails', icon: Mail, hint: 'Delivery across the platform' },
  { href: '/super-admin/templates', label: 'Templates', icon: Type, hint: 'Global email wording' },
  { href: '/super-admin/system', label: 'System', icon: Server, hint: 'Health, jobs, dead letters' },
]

export default async function SuperAdminConsoleLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession('admin')

  return (
    <div className="min-h-dvh bg-canvas text-ink">
      {/* Operator rail: desktop only. */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-forest text-white xl:flex" aria-label="Platform sections">
        <div className="flex h-16 items-center gap-2.5 px-5">
          <Image src="/assets/Gold Icon.png" alt="" width={32} height={32} className="size-8 rounded-[7px]" priority />
          <span className="flex flex-col leading-none">
            <span className="font-serif text-[14px] font-bold tracking-[0.06em]">SUPER ADMIN</span>
            <span className="mt-1 text-[9px] font-bold uppercase tracking-[0.14em] text-gold">Platform control</span>
          </span>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-3">
          {SECTIONS.map((s) => {
            const Icon = s.icon
            return (
              <Link key={s.href} href={s.href} className="group flex items-start gap-3 rounded-control px-3 py-2.5 transition-colors hover:bg-white/10 focus-ring">
                <Icon className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden="true" strokeWidth={1.75} />
                <span className="min-w-0">
                  <span className="block text-[13.5px] font-semibold leading-tight">{s.label}</span>
                  <span className="block text-[11.5px] leading-tight text-white/50">{s.hint}</span>
                </span>
              </Link>
            )
          })}
        </nav>
        <div className="border-t border-white/10 p-3">
          <p className="px-2 text-[12px] font-semibold text-white/80">{session.name}</p>
          <p className="px-2 text-[11px] text-white/45">Platform administrator</p>
          <form action={signOutAction} className="mt-2">
            <button type="submit" className="flex w-full items-center gap-2 rounded-control px-2 py-2 text-[12.5px] font-semibold text-white/70 hover:bg-white/10 hover:text-white focus-ring">
              <LogOut className="size-4" aria-hidden="true" strokeWidth={1.75} /> Sign out
            </button>
          </form>
        </div>
      </aside>

      <div className="flex min-h-dvh flex-col xl:pl-64">
        {/* Compact header below xl, where the rail is hidden. */}
        <header className="sticky top-0 z-20 border-b border-line bg-surface/95 backdrop-blur-sm xl:hidden">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
            <Link href="/super-admin" className="flex shrink-0 items-center gap-2.5 rounded-control focus-ring">
              <Image src="/assets/Gold Icon.png" alt="" width={32} height={32} className="size-8 rounded-[7px]" priority />
              <span className="flex flex-col leading-none">
                <span className="font-serif text-[14px] font-bold tracking-[0.06em] text-forest">SUPER ADMIN</span>
                <span className="mt-1 text-[9px] font-bold uppercase tracking-[0.14em] text-gold">Platform control</span>
              </span>
            </Link>
            <span className="flex items-center gap-1">
              <span className="hidden items-center gap-1.5 text-[12.5px] text-ink-muted sm:inline-flex">
                <ShieldCheck className="size-4 text-gold-700" aria-hidden="true" /> {session.name}
              </span>
              <form action={signOutAction}>
                <button type="submit" aria-label="Sign out" className="inline-flex size-9 items-center justify-center rounded-control text-ink-muted hover:bg-surface-2 hover:text-ink focus-ring">
                  <LogOut className="size-4" aria-hidden="true" strokeWidth={1.75} />
                </button>
              </form>
            </span>
          </div>
          <nav aria-label="Platform sections" className="mx-auto max-w-6xl overflow-x-auto px-4 sm:px-6">
            <ul className="flex min-w-max gap-1 pb-2">
              {SECTIONS.map((s) => (
                <li key={s.href}>
                  <Link href={s.href} className="inline-flex h-9 items-center rounded-control px-3 text-[13px] font-semibold text-ink-muted hover:bg-surface-2 hover:text-ink focus-ring">
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
    </div>
  )
}

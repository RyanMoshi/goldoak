import Image from 'next/image'
import Link from 'next/link'
import { LogOut, UserRound } from 'lucide-react'
import { signOutAction } from '@/lib/auth/actions'
import type { Organization, PublicUser } from '@/types/platform'

/** Simple, mobile-first shell for clients: one top bar, one column. */
export function PortalShell({ user, organization, children }: { user: PublicUser; organization: Organization; children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-canvas text-ink">
      <header className="sticky top-0 z-20 border-b border-line bg-surface/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/portal" className="flex items-center gap-2.5 rounded-control focus-ring" aria-label="My insurance, home">
            <Image src="/assets/Gold Icon.png" alt="" width={36} height={36} className="size-9 rounded-[8px]" priority />
            <span className="flex flex-col leading-none">
              <span className="font-serif text-[15px] font-bold tracking-[0.02em] text-forest">{organization.shortName}</span>
              <span className="mt-1 text-[9.5px] font-bold uppercase tracking-[0.14em] text-gold">My insurance</span>
            </span>
          </Link>
          <div className="flex items-center gap-1">
            <Link href="/portal/profile" className="inline-flex h-9 items-center gap-2 rounded-control px-2.5 text-[13px] font-semibold text-ink-muted hover:bg-surface-2 hover:text-ink focus-ring">
              <UserRound className="size-4" aria-hidden="true" strokeWidth={1.75} />
              <span className="hidden sm:inline">{user.name.split(' ')[0]}</span>
            </Link>
            <form action={signOutAction}>
              <button type="submit" className="inline-flex h-9 items-center gap-2 rounded-control px-2.5 text-[13px] font-semibold text-ink-muted hover:bg-surface-2 hover:text-ink focus-ring" aria-label="Sign out">
                <LogOut className="size-4" aria-hidden="true" strokeWidth={1.75} />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      <footer className="mx-auto max-w-4xl px-4 pb-8 text-[12px] text-ink-faint sm:px-6">
        {organization.name} · {organization.phone} · {organization.email}
      </footer>
    </div>
  )
}

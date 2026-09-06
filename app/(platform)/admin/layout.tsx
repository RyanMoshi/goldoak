import Image from 'next/image'
import Link from 'next/link'
import { LayoutDashboard, LogOut } from 'lucide-react'
import { signOutAction } from '@/lib/auth/actions'
import { requireSession } from '@/lib/auth/server'

export const dynamic = 'force-dynamic'

/** Platform admin: a plain, single-column shell. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession('admin')
  return (
    <div className="min-h-dvh bg-canvas text-ink">
      <header className="sticky top-0 z-20 border-b border-line bg-surface/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/admin" className="flex items-center gap-2.5 rounded-control focus-ring" aria-label="Platform admin home">
            <Image src="/assets/Gold Icon.png" alt="" width={36} height={36} className="size-9 rounded-[8px]" priority />
            <span className="flex flex-col leading-none">
              <span className="font-serif text-[15px] font-bold tracking-[0.06em] text-forest">SUPER AGENT</span>
              <span className="mt-1 text-[9.5px] font-bold uppercase tracking-[0.14em] text-gold">Platform admin</span>
            </span>
          </Link>
          <div className="flex items-center gap-1">
            <span className="hidden text-[13px] text-ink-muted sm:inline">{session.name}</span>
            <Link href="/agency/today" className="inline-flex h-9 items-center gap-2 rounded-control px-2.5 text-[13px] font-semibold text-ink-muted hover:bg-surface-2 hover:text-ink focus-ring">
              <LayoutDashboard className="size-4" aria-hidden="true" strokeWidth={1.75} />
              <span className="hidden sm:inline">Agency workspace</span>
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
      <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  )
}

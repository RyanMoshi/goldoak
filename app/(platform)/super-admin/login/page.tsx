import type { Metadata } from 'next'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { ShieldCheck } from 'lucide-react'
import { SuperAdminSignIn } from '@/components/platform/auth/SuperAdminSignIn'
import { getSession } from '@/lib/auth/server'

export const metadata: Metadata = { title: 'Platform sign-in', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

/**
 * The platform operator's own door.
 *
 * It is deliberately separate from the tenant sign-in at `/signin`: a
 * different page, a different form, and an action that refuses anything but a
 * platform administrator. Nothing here reveals whether an email exists.
 */
export default async function SuperAdminLoginPage({ searchParams }: { searchParams: { next?: string } }) {
  const session = await getSession()
  if (session?.role === 'admin' && !session.mcp) redirect('/super-admin')

  return (
    <main className="grid min-h-dvh place-items-center bg-forest px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Image src="/assets/Gold Icon.png" alt="" width={52} height={52} className="size-13 rounded-[12px]" priority style={{ width: '3.25rem', height: '3.25rem' }} />
          <p className="mt-4 font-serif text-[17px] font-bold tracking-[0.08em] text-white">SUPER ADMIN</p>
          <p className="mt-1 flex items-center gap-1.5 text-[11.5px] font-bold uppercase tracking-[0.14em] text-gold">
            <ShieldCheck className="size-3.5" aria-hidden="true" /> Platform control
          </p>
        </div>

        <div className="rounded-card border border-white/10 bg-surface p-6 shadow-drawer">
          <h1 className="font-serif text-[22px] font-medium leading-tight text-forest">Sign in to the platform</h1>
          <p className="mt-1.5 text-[13px] leading-5 text-ink-muted">This console administers every agency on the platform. Agency staff and clients sign in elsewhere.</p>
          <SuperAdminSignIn next={searchParams.next} />
        </div>

        <p className="mt-6 text-center text-[12px] leading-5 text-white/50">
          Agency or client? Use the <a href="/signin" className="font-semibold text-white/80 underline">main sign-in</a>.
        </p>
      </div>
    </main>
  )
}

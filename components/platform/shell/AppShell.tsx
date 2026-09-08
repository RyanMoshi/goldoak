'use client'

import { useCallback, useState, type ReactNode } from 'react'
import { MobileNav, MobileTabBar } from '@/components/platform/shell/MobileNav'
import { Sidebar } from '@/components/platform/shell/Sidebar'
import { TopBar } from '@/components/platform/shell/TopBar'
import { ImpersonationBanner } from '@/components/platform/shell/ImpersonationBanner'
import type { Organization, PublicUser } from '@/types/platform'

interface AppShellProps {
  organization: Organization
  agent: PublicUser
  dateLabel: string
  /** WhatsApp chats waiting for a person; shown as a badge on Conversations. */
  waiting?: number
  /** How many agencies this person belongs to (shows the switcher when more than one). */
  memberships?: number
  /** Name of the super admin acting as this user, when impersonating. */
  impersonatedBy?: string | null
  children: ReactNode
}

/** Desktop: fixed 240px forest rail and top bar. Mobile: drawer plus a bottom tab bar. */
export function AppShell({ organization, agent, dateLabel, waiting = 0, memberships = 1, impersonatedBy = null, children }: AppShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const openNav = useCallback(() => setMobileNavOpen(true), [])
  const closeNav = useCallback(() => setMobileNavOpen(false), [])

  return (
    <div className="min-h-dvh bg-canvas text-ink">
      <a
        href="#workspace"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-control focus:bg-forest focus:px-3 focus:py-2 focus:text-sm focus:text-white"
      >
        Skip to content
      </a>
      <Sidebar organization={organization} agent={agent} waiting={waiting} memberships={memberships} />
      <MobileNav open={mobileNavOpen} onClose={closeNav} organization={organization} agent={agent} waiting={waiting} memberships={memberships} />
      <div className="flex min-h-dvh flex-col lg:pl-60">
        {impersonatedBy ? <ImpersonationBanner adminName={impersonatedBy} userName={agent.name} /> : null}
        <TopBar dateLabel={dateLabel} onOpenNav={openNav} agent={agent} memberships={memberships} />
        <main id="workspace" className="flex-1 pb-24 lg:pb-8">
          <div className="mx-auto w-full max-w-[1400px] px-4 pt-5 sm:px-6 lg:px-8 lg:pt-8">{children}</div>
        </main>
      </div>
      <MobileTabBar waiting={waiting} />
    </div>
  )
}

'use client'

import { useCallback, useState, type ReactNode } from 'react'
import { MobileNav } from '@/components/platform/shell/MobileNav'
import { Sidebar } from '@/components/platform/shell/Sidebar'
import { TopBar } from '@/components/platform/shell/TopBar'
import type { Organization, PublicUser } from '@/types/platform'

interface AppShellProps {
  organization: Organization
  agent: PublicUser
  dateLabel: string
  children: ReactNode
}

/** Desktop: fixed 240px rail and top bar. Mobile: the rail becomes a drawer. */
export function AppShell({ organization, agent, dateLabel, children }: AppShellProps) {
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
      <Sidebar organization={organization} agent={agent} />
      <MobileNav open={mobileNavOpen} onClose={closeNav} organization={organization} agent={agent} />
      <div className="flex min-h-dvh flex-col lg:pl-60">
        <TopBar dateLabel={dateLabel} onOpenNav={openNav} agent={agent} />
        <main id="workspace" className="flex-1 pb-8">
          <div className="mx-auto w-full max-w-[1400px] px-4 pt-5 sm:px-6 lg:px-8 lg:pt-8">{children}</div>
        </main>
      </div>
    </div>
  )
}

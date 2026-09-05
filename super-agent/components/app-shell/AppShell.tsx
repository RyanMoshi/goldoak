"use client";

import { useCallback, useState, type ReactNode } from "react";
import { MobileNav } from "@/components/app-shell/MobileNav";
import { Sidebar } from "@/components/app-shell/Sidebar";
import { TopBar } from "@/components/app-shell/TopBar";
import type { Agent, Organization } from "@/types/domain";

interface AppShellProps {
  organization: Organization;
  agent: Agent;
  /** Pre-formatted in the organisation's timezone on the server. */
  dateLabel: string;
  children: ReactNode;
}

/**
 * Desktop: fixed 240px navigation rail and a top bar. Mobile: the rail becomes
 * a drawer opened from the top bar. Content scrolls; chrome stays put.
 */
export function AppShell({ organization, agent, dateLabel, children }: AppShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const openNav = useCallback(() => setMobileNavOpen(true), []);
  const closeNav = useCallback(() => setMobileNavOpen(false), []);

  return (
    <div className="min-h-dvh bg-canvas">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-control focus:bg-forest focus:px-3 focus:py-2 focus:text-sm focus:text-white"
      >
        Skip to content
      </a>

      <Sidebar organization={organization} agent={agent} />
      <MobileNav
        open={mobileNavOpen}
        onClose={closeNav}
        organization={organization}
        agent={agent}
      />

      <div className="flex min-h-dvh flex-col lg:pl-60">
        <TopBar dateLabel={dateLabel} onOpenNav={openNav} agent={agent} />
        <main id="main" className="flex-1 pb-[max(2rem,env(safe-area-inset-bottom))]">
          <div className="mx-auto w-full max-w-[1400px] px-4 pt-5 sm:px-6 lg:px-8 lg:pt-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

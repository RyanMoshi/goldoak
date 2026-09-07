import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'
import { AgentProfile } from '@/components/platform/shell/AgentProfile'
import { SettingsNavLink, SidebarNav } from '@/components/platform/shell/SidebarNav'
import { Wordmark } from '@/components/platform/ui/Wordmark'
import type { Organization, PublicUser } from '@/types/platform'

/** Desktop navigation rail. Fixed, 240px, forest green with a gold active pill. Hidden below lg. */
export function Sidebar({ organization, agent, waiting }: { organization: Organization; agent: PublicUser; waiting: number }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col bg-forest text-white lg:flex" aria-label="Primary">
      <div className="flex h-16 items-center px-4">
        <Link href="/agency/today" className="rounded-control focus-ring" aria-label="Super Agent, go to Today">
          <Wordmark on="forest" />
        </Link>
      </div>
      <div className="px-3 pb-3">
        <div title={organization.name} className="flex h-9 w-full items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3">
          <ShieldCheck className="size-4 shrink-0 text-gold" aria-hidden="true" strokeWidth={1.75} />
          <span className="min-w-0 flex-1 truncate text-[11px] font-bold uppercase tracking-[0.08em] text-white/90">{organization.name}</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-1">
        <SidebarNav role={agent.role} waiting={waiting} />
      </div>
      <div className="flex flex-col gap-2 border-t border-white/10 p-3">
        <SettingsNavLink />
        <AgentProfile agent={agent} placement="above" on="forest" />
      </div>
    </aside>
  )
}

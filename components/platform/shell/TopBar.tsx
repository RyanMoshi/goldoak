'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Menu, Plus } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { AgentProfile } from '@/components/platform/shell/AgentProfile'
import { AICommandBar } from '@/components/platform/ai/AICommandBar'
import { agencyNavFor } from '@/data/platform/navigation'
import type { PublicUser } from '@/types/platform'

interface TopBarProps {
  dateLabel: string
  onOpenNav: () => void
  agent: PublicUser
}

/** Page title and date left, command bar centre, actions right. Command bar gets its own row on phones. */
export function TopBar({ dateLabel, onOpenNav, agent }: TopBarProps) {
  const pathname = usePathname()
  const title = agencyNavFor(pathname)?.label ?? 'Super Agent'

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-surface/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-4 py-3 sm:px-6 lg:h-16 lg:flex-row lg:items-center lg:gap-6 lg:px-8 lg:py-0">
        <div className="flex items-center gap-3 lg:w-56 lg:shrink-0">
          <button
            type="button"
            onClick={onOpenNav}
            aria-label="Open navigation"
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-control text-ink-muted hover:bg-surface-2 hover:text-ink focus-ring lg:hidden"
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>
          <Image src="/assets/Gold Icon.png" alt="" width={32} height={32} className="size-8 rounded-[7px] lg:hidden" />
          <div className="min-w-0">
            <h1 className="truncate font-serif text-[17px] font-semibold leading-5 text-forest">{title}</h1>
            <p className="truncate font-mono text-[11px] leading-4 text-ink-muted">{dateLabel}</p>
          </div>
          <div className="ml-auto flex items-center gap-1 lg:hidden">
            <AgentProfile agent={agent} compact placement="below" />
          </div>
        </div>

        <div className="min-w-0 flex-1 lg:max-w-2xl">
          <AICommandBar />
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <Link
            href="/agency/clients/new"
            className="inline-flex h-10 items-center gap-2 rounded-control bg-gold px-4 text-sm font-semibold text-white transition-colors hover:bg-gold-500 focus-ring"
          >
            <Plus className="size-4" aria-hidden="true" strokeWidth={2.25} />
            New lead
          </Link>
          <AgentProfile agent={agent} compact placement="below" />
        </div>
      </div>
    </header>
  )
}

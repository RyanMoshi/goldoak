'use client'

import Link from 'next/link'
import { ShieldCheck, X } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { AgentProfile } from '@/components/platform/shell/AgentProfile'
import { SidebarNav } from '@/components/platform/shell/SidebarNav'
import { Wordmark } from '@/components/platform/ui/Wordmark'
import { agencyMobileTabs } from '@/data/platform/navigation'
import { cn } from '@/lib/cn'
import type { Organization, PublicUser } from '@/types/platform'

interface MobileNavProps {
  open: boolean
  onClose: () => void
  organization: Organization
  agent: PublicUser
  waiting: number
  memberships?: number
}

/** Navigation drawer below lg. Traps focus while open and closes on Escape. */
export function MobileNav({ open, onClose, organization, agent, waiting, memberships = 1 }: MobileNavProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    closeButtonRef.current?.focus()
    document.body.style.overflow = 'hidden'

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
        return
      }
      if (event.key !== 'Tab' || !panelRef.current) return
      const focusable = panelRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
      previouslyFocused?.focus()
    }
  }, [open, onClose])

  return (
    <div className={cn('fixed inset-0 z-50 lg:hidden', open ? '' : 'pointer-events-none')} aria-hidden={!open}>
      <div className={cn('absolute inset-0 bg-forest/50 transition-opacity duration-200', open ? 'opacity-100' : 'opacity-0')} onClick={onClose} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
        className={cn(
          'absolute inset-y-0 left-0 flex w-[min(20rem,86vw)] flex-col bg-forest text-white shadow-drawer transition-transform duration-200 ease-out',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 items-center justify-between px-4">
          <Wordmark on="forest" />
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="inline-flex size-9 items-center justify-center rounded-control text-white/70 hover:bg-white/10 hover:text-white focus-ring"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        <div className="px-3 pb-3">
          <div title={organization.name} className="flex h-9 w-full items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3">
            <ShieldCheck className="size-4 shrink-0 text-gold" aria-hidden="true" strokeWidth={1.75} />
            <span className="min-w-0 flex-1 truncate text-[11px] font-bold uppercase tracking-[0.08em] text-white/90">{organization.name}</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-1">
          <SidebarNav role={agent.role} onNavigate={onClose} withSettings waiting={waiting} />
        </div>
        <div className="border-t border-white/10 p-3">
          <AgentProfile agent={agent} placement="above" on="forest" memberships={memberships} />
        </div>
      </div>
    </div>
  )
}

/** Bottom tab bar on phones: the five most used destinations, always one tap away. */
export function MobileTabBar({ waiting }: { waiting: number }) {
  const pathname = usePathname()
  return (
    <nav aria-label="Quick navigation" className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm lg:hidden">
      <ul className="grid grid-cols-5">
        {agencyMobileTabs.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
          const badge = item.href === '/agency/conversations' ? waiting : 0
          return (
            <li key={item.href}>
              <Link href={item.href} aria-current={active ? 'page' : undefined} className={cn('relative flex h-14 flex-col items-center justify-center gap-1 text-[10.5px] font-semibold uppercase tracking-[0.06em] focus-ring', active ? 'text-forest' : 'text-ink-faint')}>
                <span className={cn('inline-flex h-7 w-11 items-center justify-center rounded-full transition-colors', active ? 'bg-gold/20' : '')}>
                  <Icon className="size-[18px]" aria-hidden="true" strokeWidth={active ? 2.25 : 1.75} />
                </span>
                {item.label}
                {badge ? <span className="absolute right-3 top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 font-mono text-[10px] font-bold text-forest">{badge}</span> : null}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

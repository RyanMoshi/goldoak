'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { agencySettings, navigationFor, type PlatformNavItem } from '@/data/platform/navigation'
import { cn } from '@/lib/cn'
import type { Role } from '@/types/platform'

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`)
}

function NavLink({ item, active, onNavigate, badge }: { item: PlatformNavItem; active: boolean; onNavigate?: () => void; badge?: number }) {
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      title={item.description}
      className={cn(
        'group flex h-10 items-center gap-3 rounded-full px-3.5 text-[13px] font-semibold transition-colors duration-150 focus-ring',
        active ? 'bg-gold text-forest shadow-sm' : 'text-white/75 hover:bg-white/10 hover:text-white',
      )}
    >
      <Icon aria-hidden="true" className={cn('size-[18px] shrink-0', active ? 'text-forest' : 'text-white/60 group-hover:text-white')} strokeWidth={1.75} />
      <span className="truncate">{item.label}</span>
      {badge ? <span className={cn('ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 font-mono text-[11px] font-bold', active ? 'bg-forest text-gold' : 'bg-gold text-forest')}>{badge}</span> : null}
    </Link>
  )
}

interface SidebarNavProps {
  role: Role
  onNavigate?: () => void
  withSettings?: boolean
  className?: string
  waiting?: number
}

export function SidebarNav({ role, onNavigate, withSettings = false, className, waiting = 0 }: SidebarNavProps) {
  const pathname = usePathname()
  return (
    <nav aria-label="Workspace" className={cn('flex flex-col gap-1', className)}>
      {navigationFor(role).map((item) => (
        <NavLink key={item.href} item={item} active={isActive(pathname, item.href)} onNavigate={onNavigate} badge={item.href === '/agency/conversations' ? waiting : undefined} />
      ))}
      {withSettings ? <NavLink item={agencySettings} active={isActive(pathname, agencySettings.href)} onNavigate={onNavigate} /> : null}
    </nav>
  )
}

export function SettingsNavLink({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  return <NavLink item={agencySettings} active={isActive(pathname, agencySettings.href)} onNavigate={onNavigate} />
}

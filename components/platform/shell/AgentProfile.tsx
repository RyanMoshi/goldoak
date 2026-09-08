'use client'

import Link from 'next/link'
import { Building2, KeyRound, LogOut, MoreHorizontal, Repeat, Settings, UserRound } from 'lucide-react'
import { useCallback, useId, useRef, useState } from 'react'
import { Avatar } from '@/components/platform/ui/Avatar'
import { useClickOutside } from '@/hooks/useClickOutside'
import { signOutAction } from '@/lib/auth/actions'
import { cn } from '@/lib/cn'
import { ROLE_LABELS, type PublicUser } from '@/types/platform'

interface AgentProfileProps {
  agent: PublicUser
  compact?: boolean
  placement?: 'above' | 'below'
  /** Surface the trigger sits on. */
  on?: 'light' | 'forest'
  memberships?: number
}

/** The signed-in agent, with a restrained menu. */
export function AgentProfile({ agent, compact = false, placement = 'above', on = 'light', memberships = 1 }: AgentProfileProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const menuId = useId()
  const close = useCallback(() => setOpen(false), [])
  useClickOutside(rootRef, close, open)

  return (
    <div
      ref={rootRef}
      className="relative"
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          event.stopPropagation()
          setOpen(false)
        }
      }}
    >
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={compact ? `Account menu for ${agent.name}` : undefined}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex items-center gap-3 rounded-control text-left transition-colors focus-ring',
          compact ? 'size-9 justify-center hover:bg-surface-2' : on === 'forest' ? 'w-full border border-white/15 bg-white/5 px-2.5 py-2 hover:bg-white/10' : 'w-full border border-line bg-surface-3 px-2.5 py-2 hover:border-line-strong hover:bg-surface',
        )}
      >
        <Avatar name={agent.name} size={compact ? 'sm' : 'md'} />
        {compact ? null : (
          <>
            <span className="min-w-0 flex-1">
              <span className={cn('block truncate text-[13px] font-bold', on === 'forest' ? 'text-white' : 'text-ink')}>{agent.name}</span>
              <span className={cn('block truncate text-[11.5px]', on === 'forest' ? 'text-white/60' : 'text-ink-muted')}>{agent.title ?? ROLE_LABELS[agent.role]}</span>
            </span>
            <MoreHorizontal className={cn('size-4 shrink-0', on === 'forest' ? 'text-white/50' : 'text-ink-faint')} aria-hidden="true" />
          </>
        )}
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label="Account"
          className={cn(
            'absolute z-50 w-60 animate-fade-in-fast rounded-card border border-line bg-surface p-1.5 shadow-float',
            placement === 'above' ? 'bottom-full left-0 mb-2' : 'right-0 top-full mt-2',
          )}
        >
          <div className="px-2.5 py-2">
            <p className="text-[13px] font-bold text-ink">{agent.name}</p>
            <p className="truncate font-mono text-[11px] text-ink-muted">{agent.email}</p>
          </div>
          <div className="my-1 h-px bg-divider" />
          <MenuLink href="/agency/settings" icon={Building2} onSelect={close}>
            Agency settings
          </MenuLink>
          {agent.role === 'admin' || agent.role === 'agency_admin' ? (
            <MenuLink href="/agency/team" icon={UserRound} onSelect={close}>
              Team
            </MenuLink>
          ) : null}
          {agent.role === 'admin' ? (
            <MenuLink href="/admin" icon={Settings} onSelect={close}>
              Platform admin
            </MenuLink>
          ) : null}
          {memberships > 1 ? (
            <MenuLink href="/choose-agency" icon={Repeat} onSelect={close}>
              Switch agency
            </MenuLink>
          ) : null}
          <MenuLink href="/account/password" icon={KeyRound} onSelect={close}>
            Change password
          </MenuLink>
          <div className="my-1 h-px bg-divider" />
          <form action={signOutAction}>
            <button
              type="submit"
              role="menuitem"
              className="flex w-full items-center gap-2.5 rounded-control px-2.5 py-2 text-left text-[13px] text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink focus-ring"
            >
              <LogOut className="size-4" aria-hidden="true" strokeWidth={1.75} />
              Sign out
            </button>
          </form>
        </div>
      ) : null}
    </div>
  )
}

function MenuLink({ href, icon: Icon, onSelect, children }: { href: string; icon: typeof UserRound; onSelect: () => void; children: string }) {
  return (
    <Link href={href} role="menuitem" onClick={onSelect} className="flex items-center gap-2.5 rounded-control px-2.5 py-2 text-[13px] text-ink transition-colors hover:bg-surface-2 focus-ring">
      <Icon className="size-4 text-ink-muted" aria-hidden="true" strokeWidth={1.75} />
      {children}
    </Link>
  )
}

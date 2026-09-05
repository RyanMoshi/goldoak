"use client";

import Link from "next/link";
import { Building2, LogOut, MoreHorizontal, Settings, UserRound } from "lucide-react";
import { useCallback, useId, useRef, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { useClickOutside } from "@/hooks/useClickOutside";
import { cn } from "@/lib/cn";
import type { Agent } from "@/types/domain";

interface AgentProfileProps {
  agent: Agent;
  /** Compact variant for the top bar on small screens. */
  compact?: boolean;
  /** Where the menu opens relative to the trigger. */
  placement?: "above" | "below";
}

/** The signed-in agent, with a restrained menu. Not a social profile card. */
export function AgentProfile({ agent, compact = false, placement = "above" }: AgentProfileProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const fullName = `${agent.firstName} ${agent.lastName}`;

  const close = useCallback(() => setOpen(false), []);
  useClickOutside(rootRef, close, open);

  return (
    <div
      ref={rootRef}
      className="relative"
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          event.stopPropagation();
          setOpen(false);
        }
      }}
    >
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={compact ? `Account menu for ${fullName}` : undefined}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-3 rounded-control text-left transition-colors focus-ring",
          compact
            ? "size-9 justify-center hover:bg-surface-2"
            : "w-full border border-line bg-surface-3 px-2.5 py-2 hover:bg-surface hover:border-line-strong",
        )}
      >
        <Avatar name={fullName} size={compact ? "sm" : "md"} />
        {compact ? null : (
          <>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-bold text-ink">{fullName}</span>
              <span className="block truncate text-[11.5px] text-ink-muted">{agent.role}</span>
            </span>
            <MoreHorizontal className="size-4 shrink-0 text-ink-faint" aria-hidden="true" />
          </>
        )}
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label="Account"
          className={cn(
            "absolute z-50 w-60 rounded-card border border-line bg-surface p-1.5 shadow-float animate-fade-in",
            placement === "above" ? "bottom-full left-0 mb-2" : "top-full right-0 mt-2",
          )}
        >
          <div className="px-2.5 py-2">
            <p className="text-[13px] font-bold text-ink">{fullName}</p>
            <p className="truncate font-mono text-[11px] text-ink-muted">{agent.email}</p>
          </div>
          <div className="my-1 h-px bg-divider" />
          <MenuLink href="/settings" icon={UserRound} onSelect={close}>
            My profile
          </MenuLink>
          <MenuLink href="/settings" icon={Building2} onSelect={close}>
            Organisation
          </MenuLink>
          <MenuLink href="/settings" icon={Settings} onSelect={close}>
            Settings
          </MenuLink>
          <div className="my-1 h-px bg-divider" />
          <button
            type="button"
            role="menuitem"
            onClick={close}
            className="flex w-full items-center gap-2.5 rounded-control px-2.5 py-2 text-left text-[13px] text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink focus-ring"
          >
            <LogOut className="size-4" aria-hidden="true" strokeWidth={1.75} />
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}

function MenuLink({
  href,
  icon: Icon,
  onSelect,
  children,
}: {
  href: string;
  icon: typeof UserRound;
  onSelect: () => void;
  children: string;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onSelect}
      className="flex items-center gap-2.5 rounded-control px-2.5 py-2 text-[13px] text-ink transition-colors hover:bg-surface-2 focus-ring"
    >
      <Icon className="size-4 text-ink-muted" aria-hidden="true" strokeWidth={1.75} />
      {children}
    </Link>
  );
}

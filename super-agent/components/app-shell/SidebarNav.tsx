"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { primaryNavigation, settingsNavigation } from "@/data/navigation";
import { cn } from "@/lib/cn";
import type { NavItem } from "@/types/navigation";

interface SidebarNavProps {
  /** Called after a navigation link is activated (closes the mobile drawer). */
  onNavigate?: () => void;
  /** Include the settings entry at the end of the list. */
  withSettings?: boolean;
  className?: string;
}

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({ item, active, onNavigate }: { item: NavItem; active: boolean; onNavigate?: () => void }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      title={item.description}
      className={cn(
        "group flex h-10 items-center gap-3 rounded-control px-3 text-[13px] font-semibold uppercase tracking-[0.08em] transition-colors duration-150 focus-ring",
        active
          ? "bg-forest text-white"
          : "text-ink-muted hover:bg-surface-2 hover:text-ink",
      )}
    >
      <Icon
        aria-hidden="true"
        className={cn("size-[18px] shrink-0", active ? "text-gold" : "text-ink-faint group-hover:text-ink")}
        strokeWidth={1.75}
      />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

export function SidebarNav({ onNavigate, withSettings = false, className }: SidebarNavProps) {
  const pathname = usePathname();
  return (
    <nav aria-label="Workspace" className={cn("flex flex-col gap-0.5", className)}>
      {primaryNavigation.map((item) => (
        <NavLink key={item.href} item={item} active={isActive(pathname, item.href)} onNavigate={onNavigate} />
      ))}
      {withSettings ? (
        <NavLink
          item={settingsNavigation}
          active={isActive(pathname, settingsNavigation.href)}
          onNavigate={onNavigate}
        />
      ) : null}
    </nav>
  );
}

export function SettingsNavLink({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <NavLink
      item={settingsNavigation}
      active={isActive(pathname, settingsNavigation.href)}
      onNavigate={onNavigate}
    />
  );
}

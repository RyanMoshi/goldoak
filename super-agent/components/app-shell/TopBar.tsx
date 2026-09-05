"use client";

import { Bell, Menu, Plus } from "lucide-react";
import { usePathname } from "next/navigation";
import { AgentProfile } from "@/components/app-shell/AgentProfile";
import { AICommandBar } from "@/components/ai/AICommandBar";
import { Button } from "@/components/ui/Button";
import { ShieldMark } from "@/components/ui/Wordmark";
import { navItemFor } from "@/data/navigation";
import type { Agent } from "@/types/domain";

interface TopBarProps {
  dateLabel: string;
  onOpenNav: () => void;
  agent: Agent;
}

/**
 * Page title and date on the left, the command bar in the centre, actions on
 * the right. On small screens the command bar drops to its own row so it
 * stays full-width and reachable.
 */
export function TopBar({ dateLabel, onOpenNav, agent }: TopBarProps) {
  const pathname = usePathname();
  const current = navItemFor(pathname);
  const title = current?.label ?? "Super Agent";

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
          <span className="lg:hidden">
            <ShieldMark className="size-8" />
          </span>
          <div className="min-w-0">
            <h1 className="truncate font-serif text-[17px] leading-5 font-bold text-forest">{title}</h1>
            <p className="truncate font-mono text-[11px] leading-4 text-ink-muted">{dateLabel}</p>
          </div>

          <div className="ml-auto flex items-center gap-1 lg:hidden">
            <NotificationsButton />
            <AgentProfile agent={agent} compact placement="below" />
          </div>
        </div>

        <div className="min-w-0 flex-1 lg:max-w-2xl">
          <AICommandBar />
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <Button variant="primary" size="md" className="gap-2">
            <Plus className="size-4" aria-hidden="true" strokeWidth={2.25} />
            New lead
          </Button>
          <NotificationsButton />
          <AgentProfile agent={agent} compact placement="below" />
        </div>
      </div>
    </header>
  );
}

function NotificationsButton() {
  return (
    <button
      type="button"
      aria-label="Notifications, 3 unread"
      className="relative inline-flex size-9 items-center justify-center rounded-control text-ink-muted hover:bg-surface-2 hover:text-ink focus-ring"
    >
      <Bell className="size-5" aria-hidden="true" strokeWidth={1.75} />
      <span
        aria-hidden="true"
        className="absolute top-1.5 right-1.5 inline-flex size-4 items-center justify-center rounded-full bg-gold font-mono text-[9.5px] font-bold text-white"
      >
        3
      </span>
    </button>
  );
}

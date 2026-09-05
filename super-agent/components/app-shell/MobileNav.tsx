"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { AgentProfile } from "@/components/app-shell/AgentProfile";
import { OrganizationChip } from "@/components/app-shell/OrganizationChip";
import { SidebarNav } from "@/components/app-shell/SidebarNav";
import { Wordmark } from "@/components/ui/Wordmark";
import { cn } from "@/lib/cn";
import type { Agent, Organization } from "@/types/domain";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
  organization: Organization;
  agent: Agent;
}

/** Navigation drawer for screens below lg. Traps focus while open and closes on Escape. */
export function MobileNav({ open, onClose, organization, agent }: MobileNavProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      previouslyFocused?.focus();
    };
  }, [open, onClose]);

  return (
    <div
      className={cn("fixed inset-0 z-50 lg:hidden", open ? "" : "pointer-events-none")}
      aria-hidden={!open}
    >
      <div
        className={cn(
          "absolute inset-0 bg-forest/40 transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0",
        )}
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
        className={cn(
          "absolute inset-y-0 left-0 flex w-[min(20rem,86vw)] flex-col bg-surface shadow-drawer transition-transform duration-250 ease-out",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between px-4">
          <Wordmark />
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="inline-flex size-9 items-center justify-center rounded-control text-ink-muted hover:bg-surface-2 hover:text-ink focus-ring"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        <div className="px-3 pb-3">
          <OrganizationChip organization={organization} />
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-1">
          <SidebarNav onNavigate={onClose} withSettings />
        </div>
        <div className="border-t border-line p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <AgentProfile agent={agent} placement="above" />
        </div>
      </div>
    </div>
  );
}

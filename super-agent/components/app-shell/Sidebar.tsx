import Link from "next/link";
import { AgentProfile } from "@/components/app-shell/AgentProfile";
import { OrganizationChip } from "@/components/app-shell/OrganizationChip";
import { SettingsNavLink, SidebarNav } from "@/components/app-shell/SidebarNav";
import { Wordmark } from "@/components/ui/Wordmark";
import type { Agent, Organization } from "@/types/domain";

interface SidebarProps {
  organization: Organization;
  agent: Agent;
}

/** Desktop navigation rail. Fixed, 240px, hidden below the lg breakpoint. */
export function Sidebar({ organization, agent }: SidebarProps) {
  return (
    <aside
      className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-line bg-surface lg:flex"
      aria-label="Primary"
    >
      <div className="flex h-16 items-center px-4">
        <Link href="/today" className="rounded-control focus-ring" aria-label="Super Agent, go to Today">
          <Wordmark />
        </Link>
      </div>

      <div className="px-3 pb-3">
        <OrganizationChip organization={organization} />
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-1">
        <SidebarNav />
      </div>

      <div className="flex flex-col gap-2 border-t border-line p-3">
        <SettingsNavLink />
        <AgentProfile agent={agent} placement="above" />
      </div>
    </aside>
  );
}

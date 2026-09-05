import { ChevronsUpDown, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Organization } from "@/types/domain";

interface OrganizationChipProps {
  organization: Organization;
  className?: string;
}

/**
 * Shows which organisation the agent is working in. A button so that
 * switching tenants can be wired up later without changing the layout.
 */
export function OrganizationChip({ organization, className }: OrganizationChipProps) {
  return (
    <button
      type="button"
      aria-label={`Organisation: ${organization.name}. Switch organisation`}
      title={organization.licenceLabel}
      className={cn(
        "flex h-9 w-full items-center gap-2 rounded-control border border-line bg-surface-3 px-2.5 text-left transition-colors hover:bg-surface hover:border-line-strong focus-ring",
        className,
      )}
    >
      <ShieldCheck className="size-4 shrink-0 text-gold" aria-hidden="true" strokeWidth={1.75} />
      <span className="min-w-0 flex-1 truncate text-[11px] font-bold uppercase tracking-[0.08em] text-ink">
        {organization.shortName} Agency
      </span>
      <ChevronsUpDown className="size-3.5 shrink-0 text-ink-faint" aria-hidden="true" />
    </button>
  );
}

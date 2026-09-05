import {
  Activity,
  FileCheck2,
  FileText,
  RefreshCw,
  Send,
  ShieldAlert,
  UserCheck,
  type LucideIcon,
} from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import type { ActivityItem, ActivityKind } from "@/types/dashboard";

const kindIcon: Record<ActivityKind, LucideIcon> = {
  "quote-received": FileText,
  "risk-profile": UserCheck,
  "proposal-sent": Send,
  "documents-uploaded": FileCheck2,
  renewal: RefreshCw,
  claim: ShieldAlert,
};

interface RecentActivityProps {
  items: ActivityItem[];
}

export function RecentActivity({ items }: RecentActivityProps) {
  return (
    <Card as="section" flush aria-labelledby="recent-activity" className="animate-fade-up [animation-delay:240ms]">
      <div className="px-5 pt-5 pb-3">
        <CardHeader id="recent-activity" title="Recent activity" description="Across your clients and insurers." />
      </div>
      {items.length === 0 ? (
        <EmptyState icon={Activity} title="Nothing yet today" className="py-6" />
      ) : (
        <ol className="border-t border-line px-5 py-2">
          {items.map((item, index) => {
            const Icon = kindIcon[item.kind];
            const last = index === items.length - 1;
            return (
              <li key={item.id} className="relative flex gap-3 py-2.5">
                {!last ? (
                  <span aria-hidden="true" className="absolute top-9 bottom-0 left-[13px] w-px bg-divider" />
                ) : null}
                <span
                  aria-hidden="true"
                  className="relative z-10 inline-flex size-7 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-ink-muted"
                >
                  <Icon className="size-3.5" strokeWidth={1.75} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13.5px] leading-5 text-ink">{item.title}</span>
                  <span className="block truncate text-[12.5px] text-ink-muted">{item.client}</span>
                </span>
                <time dateTime={item.at} className="shrink-0 pt-0.5 font-mono text-[11px] text-ink-faint">
                  {item.when}
                </time>
              </li>
            );
          })}
        </ol>
      )}
    </Card>
  );
}

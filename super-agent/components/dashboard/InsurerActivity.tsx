import { Building2 } from "lucide-react";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { insurers } from "@/data/insurers";
import type { InsurerActivity as InsurerActivityRow, InsurerActivityStatus } from "@/types/dashboard";

const statusMeta: Record<InsurerActivityStatus, { label: string; tone: BadgeTone }> = {
  awaiting: { label: "Awaiting", tone: "warning" },
  received: { label: "Received", tone: "success" },
  clarification: { label: "Needs reply", tone: "info" },
  ready: { label: "Ready", tone: "forest" },
};

interface InsurerActivityProps {
  rows: InsurerActivityRow[];
}

export function InsurerActivity({ rows }: InsurerActivityProps) {
  const desks = rows.length;
  return (
    <Card as="section" flush aria-labelledby="insurer-activity" className="animate-fade-up [animation-delay:200ms]">
      <div className="px-5 pt-5 pb-3">
        <CardHeader
          id="insurer-activity"
          title="Insurer activity"
          description={desks ? `${desks} desks active` : undefined}
        />
      </div>
      {rows.length === 0 ? (
        <EmptyState icon={Building2} title="No insurer activity" className="py-6" />
      ) : (
        <ul className="divide-y divide-divider border-t border-line">
          {rows.map((row) => {
            const insurer = insurers[row.insurer];
            const status = statusMeta[row.status];
            return (
              <li key={row.insurer} className="flex items-center gap-3 px-5 py-3">
                <span
                  aria-hidden="true"
                  className="inline-flex h-8 w-9 shrink-0 items-center justify-center rounded-control bg-forest font-mono text-[10.5px] font-semibold tracking-wide text-gold"
                >
                  {insurer.monogram}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13.5px] font-bold text-ink">{insurer.name}</span>
                  <span className="block truncate text-[12.5px] text-ink-muted">{row.summary}</span>
                </span>
                <Badge tone={status.tone}>{status.label}</Badge>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

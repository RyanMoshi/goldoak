import { ArrowRight, KanbanSquare } from "lucide-react";
import Link from "next/link";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Money } from "@/components/ui/Money";
import type { PipelineStage, PipelineStageId } from "@/types/dashboard";

/** Sequential forest ramp by stage order; gold marks the money stage. */
const stageColor: Record<PipelineStageId, string> = {
  leads: "#c9d9cf",
  "risk-profiling": "#8fb39f",
  quoting: "#2a6b4f",
  proposal: "#c28d38",
  won: "#073423",
};

interface PipelineSnapshotProps {
  stages: PipelineStage[];
}

export function PipelineSnapshot({ stages }: PipelineSnapshotProps) {
  const totalCount = stages.reduce((sum, s) => sum + s.count, 0);
  const totalValue = stages.reduce((sum, s) => sum + s.value, 0);

  return (
    <Card as="section" aria-labelledby="pipeline-snapshot" className="animate-fade-up [animation-delay:160ms]">
      <CardHeader
        id="pipeline-snapshot"
        title="Pipeline"
        description={`${totalCount} open opportunities`}
        aside={
          <Link
            href="/pipeline"
            className="inline-flex items-center gap-1 rounded-control text-[12.5px] font-semibold text-forest-500 hover:text-forest focus-ring"
          >
            Open
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        }
      />

      {stages.length === 0 ? (
        <EmptyState icon={KanbanSquare} title="No open opportunities" className="py-6" />
      ) : (
        <>
          <div className="mt-4 flex items-baseline justify-between gap-3">
            <span className="label-caps text-ink-muted">Estimated premium</span>
            <Money amount={totalValue} className="text-[15px] text-forest" />
          </div>
          <div
            className="mt-2 flex h-2.5 w-full gap-0.5 overflow-hidden rounded-[3px]"
            role="img"
            aria-label={stages.map((s) => `${s.label} ${s.count}`).join(", ")}
          >
            {stages.map((stage) => (
              <span
                key={stage.id}
                style={{ width: `${(stage.count / totalCount) * 100}%`, background: stageColor[stage.id] }}
                className="h-full min-w-1"
              />
            ))}
          </div>
          <ol className="mt-3 divide-y divide-divider">
            {stages.map((stage) => (
              <li key={stage.id} className="flex items-center gap-2.5 py-2">
                <span aria-hidden="true" className="size-2.5 shrink-0 rounded-[2px]" style={{ background: stageColor[stage.id] }} />
                <span className="min-w-0 flex-1 truncate text-[13.5px] text-ink">{stage.label}</span>
                <span data-numeric className="w-6 text-right font-mono text-[13px] font-medium text-ink">
                  {stage.count}
                </span>
                <Money amount={stage.value} compact className="w-24 text-right text-[11.5px] text-ink-muted" />
              </li>
            ))}
          </ol>
        </>
      )}
    </Card>
  );
}

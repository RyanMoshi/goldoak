"use client";

import { PriorityMetricCard } from "@/components/dashboard/PriorityMetricCard";
import type { PriorityMetric, TaskFilter } from "@/types/dashboard";

interface PriorityMetricsProps {
  metrics: PriorityMetric[];
  activeFilter: TaskFilter;
  onSelect: (metric: PriorityMetric) => void;
}

/** Five priorities. Horizontal scroll on phones, a single row from the sm breakpoint. */
export function PriorityMetrics({ metrics, activeFilter, onSelect }: PriorityMetricsProps) {
  return (
    <section aria-label="Today's priorities" className="animate-fade-up [animation-delay:60ms]">
      <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-5">
        {metrics.map((metric) => (
          <PriorityMetricCard
            key={metric.id}
            metric={metric}
            active={activeFilter === metric.taskType}
            onSelect={onSelect}
          />
        ))}
      </div>
    </section>
  );
}

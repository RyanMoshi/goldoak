'use client'

import { PriorityMetricCard } from '@/components/platform/dashboard/PriorityMetricCard'
import type { PriorityMetric, TaskFilter } from '@/types/platform'

export function PriorityMetrics({ metrics, activeFilter, onSelect }: { metrics: PriorityMetric[]; activeFilter: TaskFilter; onSelect: (m: PriorityMetric) => void }) {
  return (
    <section aria-label="Today's priorities" className="animate-fade-up [animation-delay:60ms]">
      <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-5">
        {metrics.map((metric) => (
          <PriorityMetricCard key={metric.id} metric={metric} active={activeFilter === metric.taskType} onSelect={onSelect} />
        ))}
      </div>
    </section>
  )
}

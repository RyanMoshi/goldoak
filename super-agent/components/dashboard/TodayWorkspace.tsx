"use client";

import { useState, type ReactNode } from "react";
import { PriorityMetrics } from "@/components/dashboard/PriorityMetrics";
import { SLATaskList } from "@/components/dashboard/SLATaskList";
import type { PriorityMetric, SLATask, TaskFilter } from "@/types/dashboard";

interface TodayWorkspaceProps {
  metrics: PriorityMetric[];
  tasks: SLATask[];
  /** Server-rendered secondary panels (pipeline, insurers, activity). */
  aside: ReactNode;
}

/**
 * The interactive part of Today: the metric strip and the work queue share
 * one filter. Everything else is server-rendered and passed in as `aside`.
 */
export function TodayWorkspace({ metrics, tasks, aside }: TodayWorkspaceProps) {
  const [filter, setFilter] = useState<TaskFilter>("all");

  function selectMetric(metric: PriorityMetric) {
    setFilter((current) => (current === metric.taskType ? "all" : metric.taskType));
  }

  return (
    <div className="mt-6 flex flex-col gap-6 lg:mt-8 lg:gap-8">
      <PriorityMetrics metrics={metrics} activeFilter={filter} onSelect={selectMetric} />
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8">
        <div className="min-w-0 lg:col-span-8">
          <SLATaskList tasks={tasks} filter={filter} onFilterChange={setFilter} />
        </div>
        <div className="flex min-w-0 flex-col gap-6 lg:col-span-4">{aside}</div>
      </div>
    </div>
  );
}

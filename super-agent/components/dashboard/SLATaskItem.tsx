"use client";

import {
  ArrowRight,
  Check,
  Clock3,
  FileWarning,
  Mail,
  PhoneCall,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Money } from "@/components/ui/Money";
import { insurerName } from "@/data/insurers";
import { cn } from "@/lib/cn";
import type { SLAStatus, SLATask, TaskType } from "@/types/dashboard";

const typeMeta: Record<TaskType, { label: string; icon: LucideIcon }> = {
  "lead-contact": { label: "New lead", icon: UserPlus },
  "quote-follow-up": { label: "Quote follow-up", icon: Mail },
  "ai-review": { label: "AI review", icon: Sparkles },
  "documents-missing": { label: "Documents missing", icon: FileWarning },
  proposal: { label: "Proposal", icon: ArrowRight },
  renewal: { label: "Renewal", icon: RefreshCw },
  "claim-update": { label: "Claim update", icon: ShieldAlert },
};

const slaMeta: Record<SLAStatus, { label: string; tone: BadgeTone }> = {
  "on-track": { label: "On track", tone: "success" },
  "at-risk": { label: "At risk", tone: "warning" },
  overdue: { label: "Overdue", tone: "error" },
  "needs-review": { label: "Needs review", tone: "info" },
};

const actionIcons: Record<SLATask["action"]["kind"], LucideIcon> = {
  "follow-up": Mail,
  review: Sparkles,
  "request-documents": FileWarning,
  call: PhoneCall,
  send: ArrowRight,
  "update-client": ShieldAlert,
};

interface SLATaskItemProps {
  task: SLATask;
  leaving: boolean;
  onAction: (task: SLATask) => void;
  onComplete: (task: SLATask) => void;
}

export function SLATaskItem({ task, leaving, onAction, onComplete }: SLATaskItemProps) {
  const type = typeMeta[task.type];
  const sla = slaMeta[task.sla];
  const TypeIcon = type.icon;
  const ActionIcon = actionIcons[task.action.kind];
  const isAI = task.type === "ai-review";

  return (
    <li
      className={cn(
        "relative flex flex-col gap-3 px-4 py-4 transition-[opacity,transform] duration-200 sm:flex-row sm:items-start sm:gap-4 sm:px-5",
        leaving && "translate-x-2 opacity-0",
        isAI && "border-l-[3px] border-l-gold bg-surface-3",
      )}
    >
      <span
        className={cn(
          "inline-flex size-9 shrink-0 items-center justify-center rounded-control",
          isAI ? "bg-gold-100 text-gold-600" : "bg-surface-2 text-ink-muted",
        )}
        aria-hidden="true"
      >
        <TypeIcon className="size-4" strokeWidth={1.75} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="label-caps text-ink-muted">{type.label}</span>
          <Badge tone={sla.tone} dot>
            {sla.label}
          </Badge>
          {task.dueToday ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-ink-muted">
              <Clock3 className="size-3" aria-hidden="true" />
              Today
            </span>
          ) : null}
        </div>

        <p className="mt-1.5 text-[15px] leading-5 font-bold text-ink">
          {task.client}
          <span className="font-normal text-ink-muted">
            {task.insurer ? ` · ${insurerName(task.insurer)}` : ""}
            {` · ${task.product}`}
          </span>
        </p>
        <p className="mt-1 text-[13.5px] leading-5 text-ink-muted">{task.summary}</p>

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-ink-muted">
          <span className={cn("font-semibold", task.sla === "overdue" ? "text-error" : task.sla === "at-risk" ? "text-warning" : "text-ink")}>
            {task.timing}
          </span>
          {task.amount !== undefined ? <Money amount={task.amount} className="text-ink" /> : null}
          {task.reference ? <span className="font-mono tracking-[0.03em] text-ink-faint">{task.reference}</span> : null}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-stretch sm:pt-0.5">
        <Button
          variant={isAI ? "forest" : "outline"}
          size="sm"
          onClick={() => onAction(task)}
          className="flex-1 sm:min-w-36"
        >
          <ActionIcon className="size-3.5" aria-hidden="true" strokeWidth={2} />
          {task.action.label}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onComplete(task)}
          aria-label={`Mark ${type.label.toLowerCase()} for ${task.client} as done`}
          className="text-ink-muted"
        >
          <Check className="size-3.5" aria-hidden="true" strokeWidth={2.25} />
          Done
        </Button>
      </div>
    </li>
  );
}

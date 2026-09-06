'use client'

import { CheckCircle2, Inbox, X } from 'lucide-react'
import { useEffect, useMemo, useState, useTransition } from 'react'
import { SLATaskItem } from '@/components/platform/dashboard/SLATaskItem'
import { Card, CardHeader } from '@/components/platform/ui/Card'
import { EmptyState } from '@/components/platform/ui/EmptyState'
import { completeTaskAction } from '@/lib/agency/actions'
import { cn } from '@/lib/cn'
import type { SLATask, TaskFilter, TaskType } from '@/types/platform'

interface Props {
  tasks: SLATask[]
  filter: TaskFilter
  onFilterChange: (filter: TaskFilter) => void
}

const quickFilters: { id: TaskFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'urgent', label: 'Urgent' },
  { id: 'today', label: 'Today' },
]

const typeLabels: Record<TaskType, string> = {
  'lead-contact': 'New leads',
  'quote-follow-up': 'Quotes awaited',
  'ai-review': 'AI review',
  'documents-missing': 'Documents',
  proposal: 'Proposals',
  renewal: 'Renewals',
  'claim-update': 'Claims',
}

function matches(task: SLATask, filter: TaskFilter): boolean {
  if (filter === 'all') return true
  if (filter === 'urgent') return task.sla === 'overdue' || task.sla === 'at-risk'
  if (filter === 'today') return task.dueToday
  return task.type === filter
}

function noticeFor(task: SLATask): string {
  const insurer = task.insurer ?? 'the insurer'
  switch (task.action.kind) {
    case 'follow-up':
      return `Follow-up drafted to ${insurer} for ${task.client}. It is waiting for you in Quotes.`
    case 'review':
      return `Opening the reasoning draft for ${task.client}. Approval lives in the comparison workspace (Step 2).`
    case 'request-documents':
      return `Document request queued for ${task.client} by SMS and WhatsApp link.`
    case 'call':
      return `${task.client} added to today's call list.`
    case 'send':
      return `Renewal review for ${task.client} queued to send.`
    case 'update-client':
      return `Client update drafted for ${task.client}. Review before it goes out.`
  }
}

/** The work queue. Completing a task writes to the database; the row leaves after a short transition. */
export function SLATaskList({ tasks, filter, onFilterChange }: Props) {
  const [completed, setCompleted] = useState<Set<string>>(() => new Set())
  const [leaving, setLeaving] = useState<Set<string>>(() => new Set())
  const [notice, setNotice] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  useEffect(() => {
    if (!notice) return
    const timer = setTimeout(() => setNotice(null), 6000)
    return () => clearTimeout(timer)
  }, [notice])

  const open = useMemo(() => tasks.filter((t) => !completed.has(t.id)), [tasks, completed])
  const visible = useMemo(() => open.filter((t) => matches(t, filter)), [open, filter])
  const urgentCount = open.filter((t) => matches(t, 'urgent')).length
  const todayCount = open.filter((t) => matches(t, 'today')).length

  function complete(task: SLATask) {
    setLeaving((s) => new Set(s).add(task.id))
    setTimeout(() => {
      setCompleted((s) => new Set(s).add(task.id))
      setLeaving((s) => {
        const next = new Set(s)
        next.delete(task.id)
        return next
      })
    }, 200)
    setNotice(`Marked done: ${task.client}.`)
    startTransition(async () => {
      const result = await completeTaskAction(task.id)
      if (!result.ok) setNotice(`Could not save that change for ${task.client}. It will reappear on refresh.`)
    })
  }

  const isTypeFilter = !quickFilters.some((f) => f.id === filter)

  return (
    <Card as="section" flush aria-labelledby="needs-attention" className="animate-fade-up [animation-delay:120ms]">
      <div className="flex flex-col gap-3 px-4 pb-3 pt-4 sm:flex-row sm:items-start sm:justify-between sm:px-5">
        <CardHeader
          id="needs-attention"
          title="Needs attention"
          description="Prioritised by urgency and service deadline."
          aside={
            <span data-numeric className="inline-flex h-6 min-w-6 items-center justify-center rounded-[4px] bg-forest px-1.5 font-mono text-[11.5px] font-semibold text-white" aria-label={`${visible.length} tasks shown`}>
              {visible.length}
            </span>
          }
        />
        <div role="group" aria-label="Filter tasks" className="flex flex-wrap items-center gap-1.5">
          {quickFilters.map((f) => {
            const count = f.id === 'urgent' ? urgentCount : f.id === 'today' ? todayCount : open.length
            const active = filter === f.id
            return (
              <button
                key={f.id}
                type="button"
                aria-pressed={active}
                onClick={() => onFilterChange(f.id)}
                className={cn(
                  'inline-flex h-8 items-center gap-1.5 rounded-control border px-2.5 text-[12.5px] font-semibold transition-colors focus-ring',
                  active ? 'border-forest bg-forest text-white' : 'border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink',
                )}
              >
                {f.label}
                <span data-numeric className={cn('font-mono text-[11px]', active ? 'text-gold' : 'text-ink-faint')}>
                  {count}
                </span>
              </button>
            )
          })}
          {isTypeFilter ? (
            <button
              type="button"
              onClick={() => onFilterChange('all')}
              aria-label={`Clear ${typeLabels[filter as TaskType]} filter`}
              className="inline-flex h-8 items-center gap-1.5 rounded-control border border-gold bg-gold-100 px-2.5 text-[12.5px] font-semibold text-gold-700 hover:bg-gold/20 focus-ring"
            >
              {typeLabels[filter as TaskType]}
              <X className="size-3.5" aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </div>

      {notice ? (
        <div role="status" className="mx-4 mb-2 flex items-start gap-2 rounded-control border border-success/25 bg-success/10 px-3 py-2 text-[13px] text-ink sm:mx-5">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
          <span className="flex-1">{notice}</span>
          <button type="button" onClick={() => setNotice(null)} aria-label="Dismiss" className="rounded-control text-ink-muted hover:text-ink focus-ring">
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      ) : null}

      {visible.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={open.length === 0 ? 'Nothing needs attention' : 'Nothing in this view'}
          description={open.length === 0 ? 'Every task with a service deadline is handled. New work appears here as it arrives.' : 'Clear the filter to see the rest of the queue.'}
        />
      ) : (
        <ul className="divide-y divide-divider border-t border-line">
          {visible.map((task) => (
            <SLATaskItem key={task.id} task={task} leaving={leaving.has(task.id)} onAction={(t) => setNotice(noticeFor(t))} onComplete={complete} />
          ))}
        </ul>
      )}
    </Card>
  )
}

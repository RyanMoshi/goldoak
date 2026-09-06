import { ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { Organization } from '@/types/platform'

/** Which organisation the agent is working in. */
export function OrganizationChip({ organization, className }: { organization: Organization; className?: string }) {
  return (
    <div
      title={organization.name}
      className={cn('flex h-9 w-full items-center gap-2 rounded-control border border-line bg-surface-3 px-2.5', className)}
    >
      <ShieldCheck className="size-4 shrink-0 text-gold" aria-hidden="true" strokeWidth={1.75} />
      <span className="min-w-0 flex-1 truncate text-[11px] font-bold uppercase tracking-[0.08em] text-ink">{organization.name}</span>
    </div>
  )
}

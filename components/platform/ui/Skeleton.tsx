import { cn } from '@/lib/cn'

/** Shimmering placeholder blocks that mirror the layout about to appear. */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn('skeleton rounded-control', className)} />
}

export function SkeletonCard({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('rounded-card border border-line bg-surface p-5', className)}>
      <Skeleton className="h-4 w-1/3" />
      <div className="mt-4 space-y-2.5">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className={cn('h-3.5', i % 3 === 2 ? 'w-2/3' : 'w-full')} />
        ))}
      </div>
    </div>
  )
}

export function SkeletonHeader() {
  return (
    <div>
      <Skeleton className="h-3 w-28" />
      <Skeleton className="mt-3 h-8 w-64 max-w-full" />
      <Skeleton className="mt-2 h-4 w-96 max-w-full" />
    </div>
  )
}

export function SkeletonTiles({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-card border border-line bg-surface p-4">
          <Skeleton className="size-9 rounded-full" />
          <Skeleton className="mt-3 h-7 w-16" />
          <Skeleton className="mt-2 h-3 w-24" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonList({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-card border border-line bg-surface">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 border-b border-divider px-5 py-3.5 last:border-b-0">
          <Skeleton className="size-9 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </div>
          <Skeleton className="h-5 w-16" />
        </div>
      ))}
    </div>
  )
}

/** Default workspace skeleton: header, tiles, a list and a side card. */
export function WorkspaceSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading">
      <SkeletonHeader />
      <SkeletonTiles />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <SkeletonList />
        </div>
        <div className="space-y-6 lg:col-span-4">
          <SkeletonCard />
          <SkeletonCard lines={4} />
        </div>
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  )
}

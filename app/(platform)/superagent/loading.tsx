import { SkeletonCard, SkeletonHeader, SkeletonTiles } from '@/components/platform/ui/Skeleton'

export default function SuperAgentLoading() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading">
      <SkeletonHeader />
      <SkeletonTiles />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-7">
          <SkeletonCard lines={5} />
          <SkeletonCard lines={4} />
        </div>
        <div className="space-y-6 lg:col-span-5">
          <SkeletonCard lines={4} />
          <SkeletonCard lines={3} />
        </div>
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  )
}

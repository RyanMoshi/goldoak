import { SkeletonCard, SkeletonHeader, SkeletonList } from '@/components/platform/ui/Skeleton'

export default function PortalLoading() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading">
      <SkeletonHeader />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <SkeletonCard lines={2} />
          <SkeletonList rows={3} />
        </div>
        <div className="space-y-6 lg:col-span-4">
          <SkeletonCard lines={4} />
        </div>
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  )
}

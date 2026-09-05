/** Skeleton that mirrors the Today layout so the page does not jump when data lands. */
export default function TodayLoading() {
  return (
    <div aria-busy="true" aria-label="Loading today" className="animate-pulse">
      <div className="h-3 w-40 rounded-[3px] bg-surface-2" />
      <div className="mt-3 h-9 w-72 rounded-[4px] bg-surface-2" />
      <div className="mt-2 h-4 w-56 rounded-[3px] bg-surface-2" />

      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-[118px] rounded-card border border-line bg-surface" />
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
        <div className="rounded-card border border-line bg-surface lg:col-span-8">
          <div className="border-b border-line px-5 py-4">
            <div className="h-5 w-40 rounded-[3px] bg-surface-2" />
            <div className="mt-2 h-3 w-64 rounded-[3px] bg-surface-2" />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4 border-b border-divider px-5 py-4 last:border-b-0">
              <div className="size-9 rounded-control bg-surface-2" />
              <div className="flex-1">
                <div className="h-3 w-32 rounded-[3px] bg-surface-2" />
                <div className="mt-2 h-4 w-3/4 rounded-[3px] bg-surface-2" />
                <div className="mt-2 h-3 w-1/2 rounded-[3px] bg-surface-2" />
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-6 lg:col-span-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-56 rounded-card border border-line bg-surface" />
          ))}
        </div>
      </div>
    </div>
  );
}

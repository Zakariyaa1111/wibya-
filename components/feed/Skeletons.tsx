export function FeedSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 pt-2">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-100 dark:border-neutral-800 overflow-hidden animate-pulse">
          {/* Image skeleton */}
          <div className="w-full h-56 bg-neutral-100 dark:bg-neutral-800" />
          {/* Content skeleton */}
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-neutral-100 dark:bg-neutral-800" />
              <div className="h-3 bg-neutral-100 dark:bg-neutral-800 rounded-full w-24" />
            </div>
            <div className="h-4 bg-neutral-100 dark:bg-neutral-800 rounded-full w-3/4" />
            <div className="h-3 bg-neutral-100 dark:bg-neutral-800 rounded-full w-1/2" />
            <div className="flex justify-between items-center pt-1">
              <div className="h-5 bg-neutral-100 dark:bg-neutral-800 rounded-full w-20" />
              <div className="h-9 bg-neutral-100 dark:bg-neutral-800 rounded-2xl w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function ProductSkeleton() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 animate-pulse">
      <div className="h-14 bg-neutral-100 dark:bg-neutral-900" />
      <div className="aspect-square bg-neutral-100 dark:bg-neutral-800" />
      <div className="p-4 space-y-4">
        <div className="h-5 bg-neutral-100 dark:bg-neutral-800 rounded-full w-3/4" />
        <div className="h-8 bg-neutral-100 dark:bg-neutral-800 rounded-full w-1/3" />
        <div className="h-16 bg-neutral-100 dark:bg-neutral-800 rounded-2xl" />
        <div className="space-y-2">
          {[1,2,3].map(i => <div key={i} className="h-3 bg-neutral-100 dark:bg-neutral-800 rounded-full" />)}
        </div>
      </div>
    </div>
  )
}

export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 bg-neutral-100 dark:bg-neutral-800 rounded-full w-2/3" />
              <div className="h-3 bg-neutral-100 dark:bg-neutral-800 rounded-full w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
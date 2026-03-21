export function FeedSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 px-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white rounded-3xl overflow-hidden border border-neutral-100">
          <div className="skeleton aspect-[4/5]" />
          <div className="p-3 space-y-2">
            <div className="skeleton h-4 rounded-lg w-3/4" />
            <div className="skeleton h-3 rounded-lg w-1/2" />
            <div className="skeleton h-8 rounded-xl mt-3" />
          </div>
        </div>
      ))}
    </div>
  )
}

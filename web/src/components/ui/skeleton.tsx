function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-stone-200 dark:bg-zinc-700 rounded ${className}`} />;
}

/** Grid of card-shaped skeletons matching the listing/shop card layout. */
export function CardGridSkeleton({ count = 8, columns }: { count?: number; columns?: string }) {
  const cols = columns || 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
  return (
    <div className={`grid ${cols} gap-5`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3">
          <Skeleton className="aspect-[4/3] rounded-xl" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}

/** Horizontal row of circle skeletons matching the category bubbles. */
export function CategoryRowSkeleton({ count = 9 }: { count?: number }) {
  return (
    <div className="flex gap-6 overflow-hidden pb-2 pl-4 pr-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-2 shrink-0">
          <Skeleton className="w-[100px] h-[100px] rounded-full" />
          <Skeleton className="h-3 w-14" />
        </div>
      ))}
    </div>
  );
}

/** Section header skeleton (title bar). */
export function SectionHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between py-5">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-4 w-16" />
    </div>
  );
}

/** Banner skeleton matching the editorial banner aspect ratio. */
export function BannerSkeleton() {
  return <Skeleton className="aspect-[4/1] rounded-2xl" />;
}

/** Stat card skeleton for analytics/team dashboards. */
export function StatGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 rounded-xl border border-stone-200 dark:border-zinc-700">
          <Skeleton className="h-3 w-20 mb-3" />
          <Skeleton className="h-7 w-16" />
        </div>
      ))}
    </div>
  );
}

/** Page header skeleton (avatar + search bar). */
export function PageHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between py-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-10 w-10 rounded-full" />
    </div>
  );
}

export default Skeleton;

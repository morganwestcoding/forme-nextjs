import Skeleton, { PageHeaderSkeleton, StatGridSkeleton, SectionHeaderSkeleton } from '@/components/ui/skeleton';

export default function TeamLoading() {
  return (
    <div className="pb-20 pt-2 px-4 sm:px-6">
      <PageHeaderSkeleton />
      <div className="mt-8">
        <Skeleton className="h-7 w-40 mb-6" />
        <StatGridSkeleton count={6} />
      </div>
      <div className="mt-8">
        <SectionHeaderSkeleton />
        {/* Member rows */}
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-stone-200 dark:border-zinc-700">
              <Skeleton className="w-10 h-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

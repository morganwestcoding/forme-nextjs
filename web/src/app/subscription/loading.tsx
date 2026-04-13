import Skeleton, { PageHeaderSkeleton } from '@/components/ui/skeleton';

export default function SubscriptionLoading() {
  return (
    <div className="pb-20 pt-2 px-4 sm:px-6">
      <PageHeaderSkeleton />
      <div className="mt-8 flex flex-col items-center">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-80 mb-10" />

        {/* Plan cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-6 rounded-2xl border border-stone-200 dark:border-zinc-700 space-y-4">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-8 w-20" />
              <div className="space-y-2 pt-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Skeleton key={j} className="h-3 w-full" />
                ))}
              </div>
              <Skeleton className="h-10 w-full rounded-full mt-4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import Skeleton, {
  ContainerSkeleton,
  PageHeaderSkeleton,
} from '@/components/ui/Skeleton';

const SubscriptionLoading = () => (
  <ContainerSkeleton>
    <PageHeaderSkeleton />

    <div className="mt-8 max-w-5xl mx-auto">
      <div className="text-center mb-10">
        <Skeleton className="h-8 w-72 mx-auto mb-3" />
        <Skeleton className="h-4 w-96 mx-auto" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-stone-200/60 dark:border-stone-800 p-6"
          >
            <Skeleton className="h-4 w-24 mb-4" />
            <Skeleton className="h-9 w-32 mb-2" />
            <Skeleton className="h-3 w-20 mb-6" />
            <div className="space-y-3 mb-6">
              {Array.from({ length: 6 }).map((_, j) => (
                <div key={j} className="flex items-center gap-2">
                  <Skeleton rounded="full" className="h-4 w-4 shrink-0" />
                  <Skeleton className="h-3 flex-1" />
                </div>
              ))}
            </div>
            <Skeleton rounded="xl" className="h-12 w-full" />
          </div>
        ))}
      </div>
    </div>
  </ContainerSkeleton>
);

export default SubscriptionLoading;

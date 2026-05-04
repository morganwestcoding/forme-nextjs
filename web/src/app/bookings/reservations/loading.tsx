import React from 'react';
import Skeleton, {
  ContainerSkeleton,
  PageHeaderSkeleton,
} from '@/components/ui/Skeleton';

const ReservationsLoading = () => (
  <ContainerSkeleton>
    <PageHeaderSkeleton />

    <div className="mt-8">
      <Skeleton className="h-8 w-48 mb-2" />
      <Skeleton className="h-4 w-72 mb-8" />

      <div className="flex gap-2 mb-6 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} rounded="full" className="h-9 w-24 shrink-0" />
        ))}
      </div>

      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-stone-200/60 dark:border-stone-800 p-4 flex items-center gap-4"
          >
            <Skeleton rounded="xl" className="h-20 w-20 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton rounded="full" className="h-5 w-16" />
              </div>
              <Skeleton className="h-5 w-48 mb-1.5" />
              <Skeleton className="h-3 w-36 mb-1.5" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton rounded="full" className="h-10 w-24" />
          </div>
        ))}
      </div>
    </div>
  </ContainerSkeleton>
);

export default ReservationsLoading;

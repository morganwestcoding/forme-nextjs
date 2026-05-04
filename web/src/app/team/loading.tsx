import React from 'react';
import Skeleton, {
  ContainerSkeleton,
  PageHeaderSkeleton,
} from '@/components/ui/Skeleton';

const TeamLoading = () => (
  <ContainerSkeleton>
    <PageHeaderSkeleton />

    <div className="mt-8">
      <Skeleton className="h-8 w-32 mb-2" />
      <Skeleton className="h-4 w-72 mb-8" />

      <div className="flex gap-2 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} rounded="full" className="h-9 w-20" />
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-stone-200/60 dark:border-stone-800 p-5 text-center"
          >
            <Skeleton rounded="full" className="h-20 w-20 mx-auto mb-4" />
            <Skeleton className="h-4 w-32 mx-auto mb-2" />
            <Skeleton className="h-3 w-24 mx-auto mb-4" />
            <div className="flex gap-2 justify-center">
              <Skeleton rounded="full" className="h-8 w-20" />
              <Skeleton rounded="full" className="h-8 w-8" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </ContainerSkeleton>
);

export default TeamLoading;

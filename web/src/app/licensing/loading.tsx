import React from 'react';
import Skeleton, {
  ContainerSkeleton,
  PageHeaderSkeleton,
} from '@/components/ui/Skeleton';

const LicensingLoading = () => (
  <ContainerSkeleton>
    <PageHeaderSkeleton />

    <div className="mt-8 max-w-3xl">
      <Skeleton className="h-8 w-40 mb-2" />
      <Skeleton className="h-4 w-72 mb-8" />

      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-stone-200/60 dark:border-stone-800 p-5"
          >
            <div className="flex items-start gap-4 mb-4">
              <Skeleton rounded="xl" className="h-12 w-12 shrink-0" />
              <div className="flex-1 min-w-0">
                <Skeleton className="h-5 w-40 mb-2" />
                <Skeleton className="h-3 w-56 mb-1.5" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton rounded="full" className="h-7 w-20" />
            </div>
            <div className="flex gap-2">
              <Skeleton rounded="full" className="h-7 w-16" />
              <Skeleton rounded="full" className="h-7 w-20" />
              <Skeleton rounded="full" className="h-7 w-14" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </ContainerSkeleton>
);

export default LicensingLoading;

import React from 'react';
import Skeleton, {
  ContainerSkeleton,
  PageHeaderSkeleton,
} from '@/components/ui/Skeleton';

const AnalyticsLoading = () => (
  <ContainerSkeleton>
    <PageHeaderSkeleton />

    <div className="mt-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton rounded="full" className="h-10 w-40" />
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl border border-stone-200/60 dark:border-stone-800"
          >
            <Skeleton className="h-3 w-24 mb-3" />
            <Skeleton className="h-7 w-20 mb-2" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl border border-stone-200/60 dark:border-stone-800"
          >
            <div className="flex items-center justify-between mb-5">
              <Skeleton className="h-5 w-32" />
              <Skeleton rounded="full" className="h-7 w-20" />
            </div>
            <Skeleton rounded="xl" className="h-56 w-full" />
          </div>
        ))}
      </div>
    </div>
  </ContainerSkeleton>
);

export default AnalyticsLoading;

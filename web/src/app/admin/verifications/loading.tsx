import React from 'react';
import Skeleton, { ContainerSkeleton } from '@/components/ui/Skeleton';

const AdminVerificationsLoading = () => (
  <ContainerSkeleton>
    <div className="mt-8 mb-8">
      <Skeleton className="h-3 w-20 mb-4" />
      <Skeleton className="h-8 w-56 mb-2" />
      <Skeleton className="h-4 w-72" />
    </div>

    {/* Filter row */}
    <div className="flex gap-2 mb-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} rounded="full" className="h-9 w-24" />
      ))}
    </div>

    <div className="flex flex-col gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="p-5 rounded-2xl border border-stone-200/60 dark:border-stone-800">
          <div className="flex items-start gap-4">
            <Skeleton rounded="full" className="h-12 w-12 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton rounded="full" className="h-6 w-20" />
              </div>
              <Skeleton className="h-3 w-32 mb-3" />
              <Skeleton rounded="xl" className="h-32 w-48" />
            </div>
            <div className="flex flex-col gap-2">
              <Skeleton rounded="full" className="h-9 w-24" />
              <Skeleton rounded="full" className="h-9 w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </ContainerSkeleton>
);

export default AdminVerificationsLoading;

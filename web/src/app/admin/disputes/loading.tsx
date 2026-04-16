import React from 'react';
import Skeleton, { ContainerSkeleton } from '@/components/ui/Skeleton';

const AdminDisputesLoading = () => (
  <ContainerSkeleton>
    <div className="mt-8 mb-8">
      <Skeleton className="h-3 w-20 mb-4" />
      <Skeleton className="h-8 w-40 mb-2" />
      <Skeleton className="h-4 w-64" />
    </div>

    {/* Filter chips */}
    <div className="flex gap-2 mb-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} rounded="full" className="h-9 w-24" />
      ))}
    </div>

    <div className="rounded-2xl border border-stone-200/60 dark:border-stone-800 overflow-hidden">
      <div className="grid grid-cols-[1fr_1fr_auto_auto_auto] gap-4 px-4 py-3 border-b border-stone-200/60 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/60">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-16" />
        ))}
      </div>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="grid grid-cols-[1fr_1fr_auto_auto_auto] gap-4 px-4 py-4 items-center border-b last:border-0 border-stone-200/40 dark:border-stone-800/60">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-4 w-16" />
          <Skeleton rounded="full" className="h-6 w-20" />
          <Skeleton rounded="full" className="h-8 w-20" />
        </div>
      ))}
    </div>
  </ContainerSkeleton>
);

export default AdminDisputesLoading;

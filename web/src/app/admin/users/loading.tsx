import React from 'react';
import Skeleton, { ContainerSkeleton } from '@/components/ui/Skeleton';

const AdminUsersLoading = () => (
  <ContainerSkeleton>
    <div className="mt-8 mb-8">
      <Skeleton className="h-3 w-20 mb-4" />
      <Skeleton className="h-8 w-32 mb-2" />
      <Skeleton className="h-4 w-48" />
    </div>

    {/* Search */}
    <div className="mb-6 flex gap-2">
      <Skeleton rounded="full" className="h-11 flex-1 max-w-md" />
      <Skeleton rounded="full" className="h-11 w-24" />
    </div>

    {/* Table */}
    <div className="rounded-2xl border border-stone-200/60 dark:border-stone-800 overflow-hidden">
      <div className="grid grid-cols-[auto_1fr_1fr_auto_auto_auto] gap-4 px-4 py-3 border-b border-stone-200/60 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/60">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-16" />
        ))}
      </div>
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="grid grid-cols-[auto_1fr_1fr_auto_auto_auto] gap-4 px-4 py-4 items-center border-b last:border-0 border-stone-200/40 dark:border-stone-800/60">
          <Skeleton rounded="full" className="h-9 w-9" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-40" />
          <Skeleton rounded="full" className="h-6 w-16" />
          <Skeleton rounded="full" className="h-6 w-20" />
          <Skeleton rounded="full" className="h-8 w-20" />
        </div>
      ))}
    </div>

    {/* Pagination */}
    <div className="flex items-center justify-between mt-4">
      <Skeleton className="h-3 w-32" />
      <div className="flex gap-2">
        <Skeleton rounded="full" className="h-9 w-20" />
        <Skeleton rounded="full" className="h-9 w-20" />
      </div>
    </div>
  </ContainerSkeleton>
);

export default AdminUsersLoading;

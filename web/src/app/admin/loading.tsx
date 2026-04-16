import React from 'react';
import Skeleton, { ContainerSkeleton } from '@/components/ui/Skeleton';

const AdminDashboardLoading = () => (
  <ContainerSkeleton>
    <div className="mt-8 mb-12">
      <Skeleton className="h-3 w-24 mb-4" />
      <div className="mb-8">
        <Skeleton className="h-3 w-20 mb-2" />
        <Skeleton className="h-8 w-48" />
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="p-5 rounded-2xl border border-stone-200/60 dark:border-stone-800">
            <Skeleton className="h-3 w-24 mb-3" />
            <Skeleton className="h-7 w-16" />
          </div>
        ))}
      </div>

      {/* Nav cards */}
      <Skeleton className="h-5 w-20 mb-4" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-5 rounded-2xl border border-stone-200/60 dark:border-stone-800">
            <Skeleton className="h-5 w-28 mb-2" />
            <Skeleton className="h-3 w-60" />
          </div>
        ))}
      </div>
    </div>
  </ContainerSkeleton>
);

export default AdminDashboardLoading;

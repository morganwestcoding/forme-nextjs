import React from 'react';
import Skeleton, { ContainerSkeleton } from '@/components/ui/Skeleton';

const AdminAcademiesLoading = () => (
  <ContainerSkeleton>
    <div className="mt-8 mb-8">
      <Skeleton className="h-3 w-20 mb-4" />
      <Skeleton className="h-8 w-48 mb-2" />
      <Skeleton className="h-4 w-56" />
    </div>

    <div className="flex items-center justify-between mb-6">
      <Skeleton rounded="full" className="h-11 w-full max-w-md" />
      <Skeleton rounded="full" className="h-11 w-32" />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="p-5 rounded-2xl border border-stone-200/60 dark:border-stone-800">
          <div className="flex items-center gap-3 mb-4">
            <Skeleton rounded="xl" className="h-12 w-12 shrink-0" />
            <div className="flex-1 min-w-0">
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
          </div>
        </div>
      ))}
    </div>
  </ContainerSkeleton>
);

export default AdminAcademiesLoading;

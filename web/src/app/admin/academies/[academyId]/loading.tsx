import React from 'react';
import Skeleton, { ContainerSkeleton } from '@/components/ui/Skeleton';

const AdminAcademyDetailLoading = () => (
  <ContainerSkeleton>
    <div className="mt-8 mb-6">
      <Skeleton className="h-3 w-32 mb-4" />
      <div className="flex items-start gap-4">
        <Skeleton rounded="2xl" className="h-16 w-16 shrink-0" />
        <div className="flex-1">
          <Skeleton className="h-8 w-60 mb-2" />
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="flex gap-2">
          <Skeleton rounded="full" className="h-10 w-24" />
          <Skeleton rounded="full" className="h-10 w-10" />
        </div>
      </div>
    </div>

    {/* Tabs */}
    <div className="flex gap-2 border-b border-stone-200 dark:border-stone-800 mb-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-8 w-24 mb-2" />
      ))}
    </div>

    {/* Detail rows */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 p-5 rounded-2xl border border-stone-200/60 dark:border-stone-800">
        <Skeleton className="h-5 w-32 mb-4" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex justify-between py-3 border-b last:border-0 border-stone-200/40 dark:border-stone-800/60">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>

      <div className="p-5 rounded-2xl border border-stone-200/60 dark:border-stone-800">
        <Skeleton className="h-5 w-24 mb-4" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="mb-4">
            <Skeleton className="h-3 w-20 mb-2" />
            <Skeleton className="h-6 w-24" />
          </div>
        ))}
      </div>
    </div>
  </ContainerSkeleton>
);

export default AdminAcademyDetailLoading;

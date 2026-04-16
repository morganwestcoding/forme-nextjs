import React from 'react';
import Skeleton from '@/components/ui/Skeleton';

const ListingEditLoading = () => (
  <div className="fixed inset-0 z-[9999] bg-white dark:bg-stone-950 flex flex-col">
    {/* Progress bar */}
    <div className="w-full h-1 bg-stone-100 dark:bg-stone-900">
      <Skeleton rounded="none" className="h-full w-1/3" />
    </div>

    {/* Top bar */}
    <div className="flex items-center justify-between px-6 py-4">
      <Skeleton rounded="full" className="h-9 w-9" />
      <Skeleton className="h-4 w-28" />
      <Skeleton rounded="full" className="h-9 w-20" />
    </div>

    {/* Center content */}
    <div className="flex-1 flex items-center justify-center px-6">
      <div className="w-full max-w-xl">
        <Skeleton className="h-4 w-20 mb-3" />
        <Skeleton className="h-10 w-4/5 mb-3" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6 mb-8" />

        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} rounded="xl" className="h-14 w-full" />
          ))}
        </div>
      </div>
    </div>

    {/* Footer */}
    <div className="flex items-center justify-between px-6 py-4 border-t border-stone-200 dark:border-stone-800">
      <Skeleton rounded="full" className="h-11 w-24" />
      <Skeleton rounded="full" className="h-11 w-28" />
    </div>
  </div>
);

export default ListingEditLoading;

import React from 'react';
import Skeleton from '@/components/ui/Skeleton';

const ListingNewLoading = () => (
  <div className="min-h-screen flex flex-col">
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="h-1 bg-stone-100 dark:bg-stone-800">
        <Skeleton rounded="none" className="h-full w-1/6" />
      </div>
    </div>

    <Skeleton rounded="full" className="fixed top-6 right-6 z-50 h-10 w-10" />

    <div className="flex-1 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-xl">
        <Skeleton className="h-3 w-24 mb-3" />
        <Skeleton className="h-9 w-4/5 mb-3" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6 mb-8" />
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-stone-200/60 dark:border-stone-800 p-4 flex flex-col items-center"
            >
              <Skeleton rounded="xl" className="h-10 w-10 mb-3" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-stone-900 border-t border-stone-100 dark:border-stone-800 px-6 py-4">
      <div className="max-w-xl mx-auto flex items-center justify-between">
        <Skeleton className="h-3.5 w-16" />
        <Skeleton rounded="full" className="h-11 w-32" />
      </div>
    </div>
  </div>
);

export default ListingNewLoading;

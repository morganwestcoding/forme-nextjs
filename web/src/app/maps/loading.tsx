import React from 'react';
import Skeleton from '@/components/ui/Skeleton';

const MapsLoading = () => (
  <div className="fixed inset-0 bg-stone-100 dark:bg-stone-900">
    {/* Top floating control bar */}
    <div className="absolute top-4 left-4 right-4 z-10 flex items-center gap-2">
      <Skeleton rounded="full" className="h-11 w-11 shrink-0" />
      <Skeleton rounded="full" className="h-11 flex-1 max-w-md" />
      <div className="flex items-center gap-2 ml-auto">
        <Skeleton rounded="full" className="h-11 w-11" />
        <Skeleton rounded="full" className="h-11 w-11" />
      </div>
    </div>

    {/* Floating filter chips */}
    <div className="absolute top-20 left-4 right-4 z-10 flex gap-2 overflow-hidden">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} rounded="full" className="h-9 w-24 shrink-0" />
      ))}
    </div>

    {/* Bottom card preview */}
    <div className="absolute bottom-6 left-4 right-4 z-10 max-w-md mx-auto">
      <div className="rounded-2xl bg-white dark:bg-stone-800 p-4 flex gap-4 shadow-elevation-2">
        <Skeleton rounded="xl" className="h-20 w-20 shrink-0" />
        <div className="flex-1 min-w-0">
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-3 w-40 mb-2" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    </div>
  </div>
);

export default MapsLoading;

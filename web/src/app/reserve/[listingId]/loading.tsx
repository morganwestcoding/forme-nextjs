import React from 'react';
import Skeleton from '@/components/ui/Skeleton';

const ReserveLoading = () => (
  <div className="min-h-screen flex flex-col">
    {/* Progress bar — fixed top, h-1 */}
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="h-1 bg-stone-100 dark:bg-stone-800">
        <Skeleton rounded="none" className="h-full w-1/5" />
      </div>
    </div>

    {/* Exit button — fixed top-6 right-6 */}
    <Skeleton rounded="full" className="fixed top-6 right-6 z-50 h-10 w-10" />

    {/* Main content — flex-1 centered, max-w-xl */}
    <div className="flex-1 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-xl">
        {/* Step label */}
        <Skeleton className="h-3 w-24 mb-3" />
        {/* Title */}
        <Skeleton className="h-9 w-4/5 mb-3" />
        {/* Subtitle */}
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6 mb-8" />

        {/* Options list — 4 selectable rows */}
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 rounded-xl border border-stone-200/60 dark:border-stone-800"
            >
              <Skeleton rounded="lg" className="h-12 w-12 shrink-0" />
              <div className="flex-1 min-w-0">
                <Skeleton className="h-4 w-2/3 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-5 w-14" />
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Bottom navigation bar */}
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-stone-900 border-t border-stone-100 dark:border-stone-800 px-6 py-4 safe-bottom">
      <div className="max-w-xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-3.5 w-10" />
        </div>
        <Skeleton rounded="full" className="h-11 w-32" />
      </div>
    </div>
  </div>
);

export default ReserveLoading;

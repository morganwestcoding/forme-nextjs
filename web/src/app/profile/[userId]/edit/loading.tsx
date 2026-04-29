import React from 'react';
import Skeleton from '@/components/ui/Skeleton';

const ProfileEditLoading = () => (
  <div className="min-h-screen flex flex-col">
    {/* Progress bar — fixed top-0, h-1 */}
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="h-1 bg-stone-100 dark:bg-stone-800">
        <Skeleton rounded="none" className="h-full w-1/3" />
      </div>
    </div>

    {/* Edit step jumper — fixed top-6 pill row (4 steps) */}
    <div className="fixed top-6 left-0 right-0 z-40 pointer-events-none">
      <div className="max-w-5xl mx-auto px-6 h-10 flex items-center overflow-x-hidden">
        <div className="flex items-center justify-center gap-6 min-w-max mx-auto w-fit">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-3 w-5" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Exit button — fixed top-6 right-6 */}
    <Skeleton rounded="full" className="fixed top-6 right-6 z-50 h-10 w-10" />

    {/* Main content — flex-1 centered, max-w-xl */}
    <div className="flex-1 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-xl">
        {/* Step label */}
        <Skeleton className="h-3 w-20 mb-3" />
        {/* Title */}
        <Skeleton className="h-9 w-3/4 mb-3" />
        {/* Subtitle */}
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6 mb-8" />

        {/* Field group — typically a textarea or grid of selectable chips */}
        <div className="flex flex-wrap gap-2 mb-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} rounded="full" className="h-11 w-24" />
          ))}
        </div>
      </div>
    </div>

    {/* Bottom navigation bar — fixed bottom-0, border-t, px-6 py-4 */}
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-stone-900 border-t border-stone-100 dark:border-stone-800 px-6 py-4 safe-bottom">
      <div className="max-w-xl mx-auto flex items-center justify-between">
        {/* Back link */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-3.5 w-10" />
        </div>
        {/* Primary button */}
        <Skeleton rounded="full" className="h-11 w-32" />
      </div>
    </div>
  </div>
);

export default ProfileEditLoading;

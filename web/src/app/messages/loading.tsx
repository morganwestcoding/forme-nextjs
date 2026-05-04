import React from 'react';
import Skeleton, { ContainerSkeleton } from '@/components/ui/Skeleton';

const MessagesLoading = () => (
  <ContainerSkeleton>
    <div className="mt-6 flex flex-col md:flex-row gap-6 h-[calc(100vh-12rem)]">
      {/* Left — conversation list */}
      <div className="w-full md:w-80 shrink-0 border-r border-stone-100 dark:border-stone-800 pr-4">
        <Skeleton className="h-7 w-32 mb-5" />
        <Skeleton rounded="full" className="h-10 w-full mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-2">
              <Skeleton rounded="full" className="h-12 w-12 shrink-0" />
              <div className="flex-1 min-w-0">
                <Skeleton className="h-4 w-28 mb-2" />
                <Skeleton className="h-3 w-40" />
              </div>
              <Skeleton className="h-2 w-2" rounded="full" />
            </div>
          ))}
        </div>
      </div>

      {/* Right — active conversation */}
      <div className="hidden md:flex flex-1 flex-col">
        <div className="flex items-center gap-3 pb-4 border-b border-stone-100 dark:border-stone-800">
          <Skeleton rounded="full" className="h-10 w-10 shrink-0" />
          <div className="flex-1 min-w-0">
            <Skeleton className="h-4 w-32 mb-1.5" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <div className="flex-1 py-6 space-y-4 overflow-hidden">
          {[60, 80, 50, 70, 65].map((w, i) => (
            <div
              key={i}
              className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}
            >
              <Skeleton rounded="2xl" className="h-10" style={{ width: `${w}%`, maxWidth: '60%' }} />
            </div>
          ))}
        </div>
        <Skeleton rounded="full" className="h-12 w-full" />
      </div>
    </div>
  </ContainerSkeleton>
);

export default MessagesLoading;

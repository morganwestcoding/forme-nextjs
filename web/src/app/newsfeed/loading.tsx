import React from 'react';
import Skeleton, {
  ContainerSkeleton,
  PageHeaderSkeleton,
} from '@/components/ui/Skeleton';

const NewsfeedLoading = () => (
  <ContainerSkeleton>
    <PageHeaderSkeleton />

    <div className="max-w-2xl mx-auto mt-8 space-y-8">
      {Array.from({ length: 4 }).map((_, i) => (
        <article
          key={i}
          className="rounded-2xl border border-stone-200/60 dark:border-stone-800 overflow-hidden"
        >
          <div className="flex items-center gap-3 p-4">
            <Skeleton rounded="full" className="h-10 w-10 shrink-0" />
            <div className="flex-1 min-w-0">
              <Skeleton className="h-4 w-32 mb-1.5" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton rounded="full" className="h-7 w-7" />
          </div>
          <Skeleton rounded="none" className="aspect-[4/5] w-full" />
          <div className="p-4">
            <div className="flex gap-3 mb-3">
              <Skeleton rounded="full" className="h-7 w-7" />
              <Skeleton rounded="full" className="h-7 w-7" />
              <Skeleton rounded="full" className="h-7 w-7" />
              <div className="flex-1" />
              <Skeleton rounded="full" className="h-7 w-7" />
            </div>
            <Skeleton className="h-3 w-3/4 mb-2" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </article>
      ))}
    </div>
  </ContainerSkeleton>
);

export default NewsfeedLoading;

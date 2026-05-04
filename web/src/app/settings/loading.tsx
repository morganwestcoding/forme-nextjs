import React from 'react';
import Skeleton, {
  ContainerSkeleton,
  PageHeaderSkeleton,
} from '@/components/ui/Skeleton';

const SettingsLoading = () => (
  <ContainerSkeleton>
    <PageHeaderSkeleton />

    <div className="mt-8 max-w-3xl">
      <Skeleton className="h-8 w-32 mb-2" />
      <Skeleton className="h-4 w-72 mb-8" />

      {Array.from({ length: 4 }).map((_, i) => (
        <section
          key={i}
          className="mb-8 rounded-2xl border border-stone-200/60 dark:border-stone-800 p-6"
        >
          <Skeleton className="h-5 w-40 mb-2" />
          <Skeleton className="h-3 w-72 mb-6" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j}>
                <Skeleton className="h-3 w-24 mb-2" />
                <Skeleton rounded="xl" className="h-11 w-full" />
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <Skeleton rounded="xl" className="h-10 w-24" />
          </div>
        </section>
      ))}
    </div>
  </ContainerSkeleton>
);

export default SettingsLoading;

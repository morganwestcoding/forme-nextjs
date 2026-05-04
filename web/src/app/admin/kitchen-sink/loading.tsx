import React from 'react';
import Skeleton, { ContainerSkeleton } from '@/components/ui/Skeleton';

const KitchenSinkLoading = () => (
  <ContainerSkeleton>
    <div className="mt-8">
      <Skeleton className="h-8 w-48 mb-2" />
      <Skeleton className="h-4 w-72 mb-10" />

      {Array.from({ length: 5 }).map((_, i) => (
        <section key={i} className="mb-12">
          <Skeleton className="h-6 w-40 mb-5" />
          <div className="rounded-2xl border border-stone-200/60 dark:border-stone-800 p-8">
            <div className="flex flex-wrap items-center gap-3">
              {Array.from({ length: 6 }).map((_, j) => (
                <Skeleton key={j} rounded="xl" className="h-10 w-24" />
              ))}
            </div>
          </div>
        </section>
      ))}
    </div>
  </ContainerSkeleton>
);

export default KitchenSinkLoading;

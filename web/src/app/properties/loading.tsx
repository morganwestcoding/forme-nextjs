import React from 'react';
import Skeleton, {
  ContainerSkeleton,
  PageHeaderSkeleton,
} from '@/components/ui/Skeleton';

const PropertiesLoading = () => (
  <ContainerSkeleton>
    <PageHeaderSkeleton />

    <div className="mt-8">
      <Skeleton className="h-8 w-48 mb-2" />
      <Skeleton className="h-4 w-72 mb-8" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl border border-stone-200/60 dark:border-stone-800"
          >
            <Skeleton rounded="xl" className="aspect-[16/10] w-full mb-4" />
            <Skeleton className="h-5 w-40 mb-2" />
            <Skeleton className="h-3 w-32 mb-1.5" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>
    </div>
  </ContainerSkeleton>
);

export default PropertiesLoading;

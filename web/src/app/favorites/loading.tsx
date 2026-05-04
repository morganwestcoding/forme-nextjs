import React from 'react';
import Skeleton, {
  ContainerSkeleton,
  PageHeaderSkeleton,
  ListingCardSkeleton,
} from '@/components/ui/Skeleton';

const FavoritesLoading = () => (
  <ContainerSkeleton>
    <PageHeaderSkeleton />

    <div className="mt-8">
      <Skeleton className="h-8 w-40 mb-2" />
      <Skeleton className="h-4 w-60 mb-8" />

      <div className="flex gap-2 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} rounded="full" className="h-9 w-24" />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <ListingCardSkeleton key={i} />
        ))}
      </div>
    </div>
  </ContainerSkeleton>
);

export default FavoritesLoading;

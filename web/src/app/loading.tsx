import React from 'react';
import Skeleton, {
  ContainerSkeleton,
  PageHeaderSkeleton,
  SectionHeaderSkeleton,
  ListingCardSkeleton,
  ShopCardSkeleton,
  PostCardSquareSkeleton,
} from '@/components/ui/Skeleton';

const DiscoverLoading = () => (
  <ContainerSkeleton>
    <PageHeaderSkeleton />

    {/* Category rail */}
    <div className="flex gap-2 mt-8 mb-10 overflow-hidden">
      {Array.from({ length: 10 }).map((_, i) => (
        <Skeleton key={i} rounded="full" className="h-9 w-24 shrink-0" />
      ))}
    </div>

    {/* Listings section */}
    <SectionHeaderSkeleton />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
      {Array.from({ length: 4 }).map((_, i) => (
        <ListingCardSkeleton key={i} />
      ))}
    </div>

    {/* Shops section */}
    <SectionHeaderSkeleton />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
      {Array.from({ length: 4 }).map((_, i) => (
        <ShopCardSkeleton key={i} />
      ))}
    </div>

    {/* Posts mosaic */}
    <SectionHeaderSkeleton />
    <div className="grid grid-cols-3 md:grid-cols-4 gap-0.5 rounded-xl overflow-hidden">
      {Array.from({ length: 12 }).map((_, i) => (
        <PostCardSquareSkeleton key={i} />
      ))}
    </div>
  </ContainerSkeleton>
);

export default DiscoverLoading;

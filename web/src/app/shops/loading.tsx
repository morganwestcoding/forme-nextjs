import React from 'react';
import Skeleton, {
  ContainerSkeleton,
  PageHeaderSkeleton,
  SectionHeaderSkeleton,
  ShopCardSkeleton,
  ProductCardSkeleton,
} from '@/components/ui/Skeleton';

const ShopsLoading = () => (
  <ContainerSkeleton>
    <PageHeaderSkeleton />

    <div className="flex gap-2 mt-8 mb-10 overflow-hidden">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} rounded="full" className="h-9 w-20 shrink-0" />
      ))}
    </div>

    <SectionHeaderSkeleton />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
      {Array.from({ length: 4 }).map((_, i) => (
        <ShopCardSkeleton key={i} />
      ))}
    </div>

    <SectionHeaderSkeleton />
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {Array.from({ length: 10 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  </ContainerSkeleton>
);

export default ShopsLoading;

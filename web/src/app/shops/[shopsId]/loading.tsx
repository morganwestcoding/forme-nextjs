import React from 'react';
import Skeleton, {
  ContainerSkeleton,
  ProductCardSkeleton,
} from '@/components/ui/Skeleton';

const ShopDetailLoading = () => (
  <ContainerSkeleton>
    <div className="flex gap-6 -mx-6 md:-mx-24 px-6 md:px-24 -mt-2 md:-mt-8">
      {/* Left column — shop card */}
      <div className="w-[320px] flex-shrink-0 hidden md:flex flex-col gap-4 py-10">
        <div className="rounded-2xl overflow-hidden border border-stone-200/40 dark:border-stone-800 shadow-elevation-1 bg-white dark:bg-stone-900">
          <Skeleton rounded="none" className="h-32 w-full" />
          <div className="px-6 pb-6 -mt-10 text-center">
            <Skeleton rounded="2xl" className="h-20 w-20 mx-auto mb-3" />
            <Skeleton className="h-5 w-40 mx-auto mb-2" />
            <Skeleton className="h-3 w-24 mx-auto" />
          </div>
          <div className="px-6 py-5 flex items-center justify-between">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <Skeleton className="h-5 w-8 mb-1" />
                <Skeleton className="h-2.5 w-12" />
              </div>
            ))}
          </div>
          <div className="px-6 py-5">
            <Skeleton className="h-3 w-full mb-2" />
            <Skeleton className="h-3 w-5/6 mb-2" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
      </div>

      {/* Right column — products grid */}
      <div className="flex-1 min-w-0 py-14">
        <div className="md:hidden mb-6 flex items-center gap-4">
          <Skeleton rounded="2xl" className="h-16 w-16 shrink-0" />
          <div className="flex-1 min-w-0">
            <Skeleton className="h-5 w-40 mb-1.5" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>

        <div className="flex items-center gap-2 mb-6 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} rounded="full" className="h-9 w-20 shrink-0" />
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  </ContainerSkeleton>
);

export default ShopDetailLoading;

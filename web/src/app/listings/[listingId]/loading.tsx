import React from 'react';
import Skeleton, {
  ContainerSkeleton,
  CompactCardSkeleton,
  ReviewCardSkeleton,
} from '@/components/ui/Skeleton';

const ListingDetailLoading = () => (
  <ContainerSkeleton>
    <div className="flex gap-6 -mx-6 md:-mx-24 px-6 md:px-24 -mt-2 md:-mt-8">
      {/* Left column — sticky listing card */}
      <div className="w-[320px] flex-shrink-0 hidden md:flex flex-col gap-4 py-10">
        <div className="rounded-2xl overflow-hidden border border-stone-200/40 dark:border-stone-800 shadow-elevation-1 bg-white dark:bg-stone-900">
          <div className="relative pt-8 pb-5 px-6 text-center">
            <Skeleton rounded="full" className="absolute top-3 left-3 h-8 w-8" />
            <Skeleton rounded="full" className="absolute top-3 right-3 h-8 w-8" />
            <Skeleton rounded="2xl" className="h-32 w-32 mx-auto" />
            <Skeleton className="h-5 w-40 mx-auto mt-3 mb-2" />
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
          <div className="px-6 py-5">
            <Skeleton rounded="xl" className="h-12 w-full" />
          </div>
        </div>
      </div>

      {/* Right column — services, team, reviews */}
      <div className="flex-1 min-w-0 py-14">
        <div className="md:hidden mb-6 flex items-center gap-4">
          <Skeleton rounded="2xl" className="h-16 w-16 shrink-0" />
          <div className="flex-1 min-w-0">
            <Skeleton className="h-5 w-40 mb-1.5" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>

        <div className="space-y-12">
          <section>
            <Skeleton className="h-6 w-24 mb-5" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <CompactCardSkeleton key={i} />
              ))}
            </div>
          </section>

          <section>
            <Skeleton className="h-6 w-20 mb-5" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <CompactCardSkeleton key={i} />
              ))}
            </div>
          </section>

          <section>
            <Skeleton className="h-6 w-24 mb-5" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <ReviewCardSkeleton key={i} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  </ContainerSkeleton>
);

export default ListingDetailLoading;

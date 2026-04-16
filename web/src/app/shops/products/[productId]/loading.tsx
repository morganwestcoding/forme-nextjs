import React from 'react';
import Skeleton, {
  ContainerSkeleton,
  ProductCardSkeleton,
} from '@/components/ui/Skeleton';

const ProductDetailLoading = () => (
  <ContainerSkeleton>
    {/* Two-column layout mirrors ProductClient */}
    <div className="flex gap-6 -mx-6 md:-mx-24 px-6 md:px-24 -mt-2 md:-mt-8 md:h-[calc(100vh-2rem)] md:overflow-hidden">
      {/* ===== LEFT COLUMN - Product Card (w-[320px] hidden md:flex) ===== */}
      <div className="w-[320px] flex-shrink-0 hidden md:flex flex-col gap-4 py-10">
        <div className="rounded-2xl overflow-hidden border border-stone-200/40 dark:border-stone-800 shadow-sm bg-white dark:bg-stone-900">
          {/* Hero — pt-8 pb-5 px-6 text-center */}
          <div className="relative pt-8 pb-5 px-6 text-center">
            <Skeleton rounded="full" className="absolute top-3 left-3 h-8 w-8" />
            <Skeleton rounded="full" className="absolute top-3 right-3 h-8 w-8" />

            {/* Product image — w-40 h-40 rounded-2xl (larger than avatars) */}
            <Skeleton rounded="2xl" className="h-40 w-40 mx-auto" />

            <div className="mt-3 flex flex-col items-center">
              {/* Category · Shop meta row */}
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton rounded="full" className="h-1 w-1" />
                <Skeleton className="h-3 w-20" />
              </div>
              {/* Product name */}
              <Skeleton className="h-5 w-48 mt-2" />
              {/* Price row */}
              <div className="flex items-center justify-center gap-2 mt-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-3 w-10" />
              </div>
            </div>
          </div>

          {/* Stats — in stock / likes / reviews */}
          <div className="px-6 py-5">
            <div className="flex items-center justify-between text-center">
              <div className="flex-1 flex flex-col items-center">
                <Skeleton className="h-5 w-8 mb-1" />
                <Skeleton className="h-2.5 w-14" />
              </div>
              <div className="w-px h-10 bg-stone-100 dark:bg-stone-800" />
              <div className="flex-1 flex flex-col items-center">
                <Skeleton className="h-5 w-8 mb-1" />
                <Skeleton className="h-2.5 w-10" />
              </div>
              <div className="w-px h-10 bg-stone-100 dark:bg-stone-800" />
              <div className="flex-1 flex flex-col items-center">
                <Skeleton className="h-5 w-8 mb-1" />
                <Skeleton className="h-2.5 w-12" />
              </div>
            </div>
          </div>

          {/* Description — 4 lines (line-clamp-4) */}
          <div className="px-6 py-5">
            <Skeleton className="h-3 w-full mb-2" />
            <Skeleton className="h-3 w-full mb-2" />
            <Skeleton className="h-3 w-5/6 mb-2" />
            <Skeleton className="h-3 w-3/4" />

            {/* Share row */}
            <div className="flex items-center justify-center gap-4 mt-6 mb-2">
              <div className="flex items-center gap-1.5">
                <Skeleton rounded="sm" className="h-4 w-4" />
                <Skeleton className="h-3 w-10" />
              </div>
            </div>
          </div>

          {/* Action buttons — Buy Now + Add to Cart */}
          <div className="px-6 py-5">
            <div className="flex gap-2.5">
              <Skeleton rounded="xl" className="flex-1 h-12" />
              <Skeleton rounded="xl" className="flex-1 h-12" />
            </div>
          </div>
        </div>
      </div>

      {/* ===== RIGHT COLUMN - Content ===== */}
      <div className="flex-1 min-w-0 md:overflow-y-auto md:py-14">
        {/* Mobile header (md:hidden) */}
        <div className="md:hidden mb-6">
          <div className="flex items-center gap-4">
            <Skeleton rounded="xl" className="h-16 w-16 shrink-0" />
            <div className="flex-1 min-w-0">
              <Skeleton className="h-5 w-40 mb-1.5" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton rounded="full" className="h-8 w-8" />
          </div>
        </div>

        <div className="space-y-12">
          {/* Photos — grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-0.5 rounded-xl, aspect squares */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-4">
                <Skeleton className="h-6 w-20" />
                <Skeleton rounded="full" className="h-6 w-8" />
              </div>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-0.5 overflow-hidden rounded-xl">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} rounded="none" className="aspect-square w-full" />
              ))}
            </div>
          </section>

          {/* Options — label + row of variant pills */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <Skeleton className="h-6 w-24" />
            </div>
            <Skeleton className="h-3 w-12 mb-3" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} rounded="xl" className="h-11 w-16" />
              ))}
            </div>
          </section>

          {/* Quantity — single stepper group (w-12 h-12 x 3) */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <Skeleton className="h-6 w-24" />
            </div>
            <Skeleton rounded="xl" className="h-12 w-36" />
          </section>

          {/* Details — grid-cols-2 gap-4 max-w-lg, 4 label/value pairs */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <Skeleton className="h-6 w-20" />
            </div>
            <div className="grid grid-cols-2 gap-4 max-w-lg">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-2.5 w-20 mb-1.5" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>

            {/* Tag chips */}
            <div className="flex flex-wrap gap-1.5 mt-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} rounded="full" className="h-5 w-14" />
              ))}
            </div>
          </section>

          {/* Sold by — 48x48 logo + info + chevron, max-w-md */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <Skeleton className="h-6 w-20" />
            </div>
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800 w-full max-w-md">
              <Skeleton rounded="xl" className="h-12 w-12 shrink-0" />
              <div className="flex-1 min-w-0">
                <Skeleton className="h-4 w-32 mb-1.5" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-4 w-4" />
            </div>
          </section>

          {/* Related Products — grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-0.5 rounded-xl (10) */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-4">
                <Skeleton className="h-6 w-56" />
                <Skeleton rounded="full" className="h-6 w-8" />
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-0.5 overflow-hidden rounded-xl">
              {Array.from({ length: 10 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  </ContainerSkeleton>
);

export default ProductDetailLoading;

'use client';

import React from 'react';

interface PageSkeletonProps {
  title?: string;
  subtitle?: string;
  showSearch?: boolean;
  showCategoryNav?: boolean;
  cardCount?: number;
  columns?: number;
}

const CardSkeleton = () => (
  <div className="bg-white rounded-xl overflow-hidden animate-pulse">
    <div className="aspect-[4/3] bg-gray-200" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-200 rounded w-1/2" />
      <div className="h-3 bg-gray-200 rounded w-1/4" />
    </div>
  </div>
);

const PageSkeleton: React.FC<PageSkeletonProps> = ({
  title = 'Loading',
  subtitle,
  showSearch = true,
  showCategoryNav = true,
  cardCount = 8,
  columns = 4,
}) => {
  const gridColsClass = columns === 5 ? 'grid-cols-5' : 'grid-cols-4';

  return (
    <div className="min-h-screen">
      {/* Hero Section Skeleton */}
      <div className="-mx-6 md:-mx-24 -mt-2 md:-mt-8">
        <div className="relative px-6 md:px-24 pt-12 pb-8 bg-white">
          <div className="relative z-10 pb-6">
            {/* Title */}
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight tracking-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-gray-500 text-base mt-3 max-w-2xl mx-auto">{subtitle}</p>
              )}
            </div>

            {/* Search Skeleton */}
            {showSearch && (
              <div className="mt-8 max-w-3xl mx-auto">
                <div className="h-12 bg-gray-100 rounded-full animate-pulse" />
              </div>
            )}

            {/* Category Nav Skeleton */}
            {showCategoryNav && (
              <div className="mt-5 -mx-6 md:-mx-24">
                <div className="px-6 md:px-24">
                  <div className="flex gap-4 py-4 overflow-hidden">
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className="h-8 w-20 bg-gray-100 rounded-full animate-pulse flex-shrink-0"
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="relative -mt-[69px] px-6 md:px-24">
        {/* Section Header Skeleton */}
        <div className="flex items-center justify-between py-6">
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="flex gap-2">
            <div className="h-8 w-8 bg-gray-100 rounded-full animate-pulse" />
            <div className="h-8 w-8 bg-gray-100 rounded-full animate-pulse" />
          </div>
        </div>

        {/* Cards Grid Skeleton */}
        <div className={`grid ${gridColsClass} gap-5`}>
          {[...Array(cardCount)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>

        {/* Second Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between py-6">
            <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
            <div className="flex gap-2">
              <div className="h-8 w-8 bg-gray-100 rounded-full animate-pulse" />
              <div className="h-8 w-8 bg-gray-100 rounded-full animate-pulse" />
            </div>
          </div>
          <div className={`grid ${gridColsClass} gap-5 pb-8`}>
            {[...Array(cardCount)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageSkeleton;

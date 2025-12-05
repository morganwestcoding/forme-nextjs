'use client';

import React from 'react';

interface PageSkeletonProps {
  title?: string;
  subtitle?: string;
  showSearch?: boolean;
  showCategoryNav?: boolean;
  cardCount?: number;
}

// Card skeleton with shimmer effect
const CardSkeleton = () => (
  <div className="relative overflow-hidden rounded-xl max-w-[250px] h-[280px] bg-gradient-to-b from-neutral-100 to-neutral-50">
    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    <div className="absolute top-4 right-4">
      <div className="w-5 h-5 rounded-full bg-neutral-200/40" />
    </div>
    <div className="absolute bottom-4 left-4 right-4 space-y-2">
      <div className="h-3 bg-neutral-200/50 rounded w-3/4" />
      <div className="h-2.5 bg-neutral-200/30 rounded w-1/2" />
      <div className="mt-2 h-4 bg-neutral-200/40 rounded-md w-16" />
    </div>
  </div>
);

// Category pill widths matching actual labels
const categoryWidths = [70, 72, 62, 52, 46, 60, 58, 54];

const PageSkeleton: React.FC<PageSkeletonProps> = ({
  title = 'Loading',
  subtitle,
  showSearch = true,
  showCategoryNav = true,
  cardCount = 4,
}) => {
  return (
    <div className="min-h-screen animate-in fade-in duration-200">
      {/* Hero Section */}
      <div className="-mx-6 md:-mx-24 -mt-2 md:-mt-8">
        <div className="relative px-6 md:px-24 pt-12 pb-8 bg-white">
          <div className="relative z-10 pb-6">
            {/* Title */}
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight tracking-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-gray-400 text-base mt-3 max-w-2xl mx-auto">{subtitle}</p>
              )}
            </div>

            {/* Search skeleton - matching MarketSearch exactly */}
            {showSearch && (
              <div className="mt-8 max-w-3xl mx-auto">
                <div className="bg-neutral-100 border border-neutral-200 rounded-2xl overflow-hidden mt-3">
                  <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5">
                    <div className="flex-1 h-[14px] bg-neutral-200/60 rounded ml-2 sm:ml-3" />
                    <div className="w-px h-5 bg-neutral-300" />
                    <div className="p-1.5 sm:p-2">
                      <div className="w-5 h-5 sm:w-[22px] sm:h-[22px] rounded-lg sm:rounded-xl bg-neutral-200/50" />
                    </div>
                    <div className="p-1.5 sm:p-2">
                      <div className="w-5 h-5 sm:w-[22px] sm:h-[22px] rounded-lg sm:rounded-xl bg-neutral-200/50" />
                    </div>
                    <div className="p-1.5 sm:p-2">
                      <div className="w-5 h-5 sm:w-[22px] sm:h-[22px] rounded-lg sm:rounded-xl bg-neutral-200/50" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Category Nav - matching actual styling */}
            {showCategoryNav && (
              <div className="mt-5 -mx-6 md:-mx-24">
                <div className="px-6 md:px-24">
                  <div className="flex items-center sm:justify-center gap-1.5 py-2 sm:py-3 -mx-2 px-2 sm:mx-0 sm:px-0">
                    {categoryWidths.map((width, i) => (
                      <div
                        key={i}
                        style={{ width: `${width}px` }}
                        className="h-[24px] sm:h-[28px] bg-transparent border border-neutral-300 rounded-lg sm:rounded-xl flex-shrink-0"
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="relative -mt-[69px]">
        {/* Section header */}
        <div className="flex items-center justify-between py-6">
          <div className="h-4 w-24 bg-neutral-200/40 rounded" />
          <div className="flex items-center gap-2">
            <div className="h-5 w-10 bg-neutral-100 rounded" />
            <div className="flex gap-1">
              <div className="w-6 h-6 bg-neutral-100 rounded-full" />
              <div className="w-6 h-6 bg-neutral-100 rounded-full" />
            </div>
          </div>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {[...Array(cardCount)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>

        {/* Second section */}
        <div className="mt-10">
          <div className="flex items-center justify-between py-6">
            <div className="h-4 w-32 bg-neutral-200/40 rounded" />
            <div className="flex items-center gap-2">
              <div className="h-5 w-10 bg-neutral-100 rounded" />
              <div className="flex gap-1">
                <div className="w-6 h-6 bg-neutral-100 rounded-full" />
                <div className="w-6 h-6 bg-neutral-100 rounded-full" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 pb-8">
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

'use client';

import React from 'react';

interface PageSkeletonProps {
  title?: string;
  subtitle?: string;
  showSearch?: boolean;
  showCategoryNav?: boolean;
  cardCount?: number;
  sectionCount?: number;
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

// Category pill widths matching actual label widths (Massage, Wellness, Fitness, Nails, Spa, Barber, Beauty, Salon)
const categoryWidths = [72, 74, 60, 50, 40, 58, 56, 52];

const PageSkeleton: React.FC<PageSkeletonProps> = ({
  title = 'Loading',
  subtitle,
  showSearch = true,
  showCategoryNav = true,
  cardCount = 10,
  sectionCount = 4,
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

            {/* Search skeleton - matching ContextualSearch exactly */}
            {showSearch && (
              <div className="mt-8 max-w-3xl mx-auto">
                <div
                  className="border border-neutral-200 rounded-2xl overflow-hidden"
                  style={{
                    background: 'linear-gradient(to right, rgb(245 245 245) 0%, rgb(241 241 241) 100%)'
                  }}
                >
                  <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5">
                    {/* Input placeholder skeleton */}
                    <div className="flex-1 h-[14px] bg-neutral-300/40 rounded ml-2 sm:ml-3" />
                    {/* Divider */}
                    <div className="w-px h-5 bg-neutral-300" />
                    {/* Search icon button */}
                    <div className="p-1.5 sm:p-2">
                      <div className="w-5 h-5 sm:w-[22px] sm:h-[22px] rounded-lg sm:rounded-xl bg-neutral-300/40" />
                    </div>
                    {/* Filter icon button */}
                    <div className="p-1.5 sm:p-2">
                      <div className="w-5 h-5 sm:w-[22px] sm:h-[22px] rounded-lg sm:rounded-xl bg-neutral-300/40" />
                    </div>
                    {/* Create icon button */}
                    <div className="p-1.5 sm:p-2">
                      <div className="w-5 h-5 sm:w-[22px] sm:h-[22px] rounded-lg sm:rounded-xl bg-neutral-300/40" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Category Nav - matching CategoryNav exactly: h-9, rounded-xl, gap-1.5 */}
            {showCategoryNav && (
              <div className="mt-3 -mx-6 md:-mx-24">
                <div className="px-6 md:px-24">
                  <div className="relative flex items-center justify-center py-2 sm:py-3 -mx-2 px-2 sm:mx-0 sm:px-0">
                    <div className="flex items-center justify-center gap-1.5 overflow-x-auto scrollbar-hide pt-1 pb-3 -mb-2">
                      {categoryWidths.map((width, i) => (
                        <div
                          key={i}
                          style={{ width: `${width}px` }}
                          className="h-9 bg-white border border-neutral-300 rounded-xl flex-shrink-0"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="relative -mt-[69px]">
        {[...Array(sectionCount)].map((_, sectionIdx) => (
          <div key={sectionIdx} className={sectionIdx > 0 ? 'mt-10' : ''}>
            {/* Section header */}
            <div className="flex items-center justify-between py-6">
              <div className={`h-4 bg-neutral-200/40 rounded ${sectionIdx % 2 === 0 ? 'w-48' : 'w-56'}`} />
              <div className="flex items-center gap-2">
                <div className="h-5 w-10 bg-neutral-100 rounded" />
                <div className="flex gap-1">
                  <div className="w-6 h-6 bg-neutral-100 rounded-full" />
                  <div className="w-6 h-6 bg-neutral-100 rounded-full" />
                </div>
              </div>
            </div>

            {/* Cards grid */}
            <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 ${sectionIdx === sectionCount - 1 ? 'pb-8' : ''}`}>
              {[...Array(cardCount)].map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PageSkeleton;

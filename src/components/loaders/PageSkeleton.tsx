'use client';

import React from 'react';

interface PageSkeletonProps {
  title?: string;
  subtitle?: string;
  showSearch?: boolean;
  showCategoryNav?: boolean;
  cardCount?: number;
}

// Simple card placeholder - no animation
const CardSkeleton = () => (
  <div className="relative overflow-hidden rounded-xl max-w-[250px] h-[360px] bg-gray-100/80">
    <div
      className="absolute inset-0"
      style={{
        background: 'linear-gradient(to top, rgba(80,80,80,0.15) 0%, transparent 50%)',
      }}
    />
    <div className="absolute top-4 right-4">
      <div className="w-7 h-7 rounded-full bg-white/50" />
    </div>
    <div className="absolute bottom-5 left-5 right-5 space-y-2">
      <div className="h-4 bg-white/60 rounded w-3/4" />
      <div className="h-3 bg-white/40 rounded w-1/2" />
      <div className="h-2.5 bg-white/30 rounded w-1/3" />
      <div className="mt-3 h-6 bg-white/50 rounded-lg w-24" />
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
    <div className="min-h-screen">
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

            {/* Search skeleton - matches MarketSearch: rounded-2xl box */}
            {showSearch && (
              <div className="mt-8 max-w-3xl mx-auto">
                <div className="bg-gray-50 border border-gray-200/80 rounded-2xl overflow-hidden">
                  <div className="flex items-center gap-1.5 px-3 py-2.5">
                    <div className="w-10 h-10 rounded-xl bg-gray-100/80" />
                    <div className="w-10 h-10 rounded-xl bg-gray-100/80" />
                    <div className="w-px h-5 bg-gray-200" />
                    <div className="flex-1 h-5 bg-gray-100/60 rounded mx-2" />
                    <div className="w-10 h-10 rounded-xl bg-gray-100/80" />
                  </div>
                </div>
              </div>
            )}

            {/* Category nav - separate from search, in sticky wrapper */}
            {showCategoryNav && (
              <div className="mt-5 -mx-6 md:-mx-24">
                <div className="px-6 md:px-24">
                  <div className="flex items-center justify-center gap-1.5 py-3">
                    {categoryWidths.map((width, i) => (
                      <div
                        key={i}
                        style={{ width: `${width}px` }}
                        className="h-[32px] bg-gray-100/80 rounded-lg"
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
          <div className="h-5 w-32 bg-gray-200/70 rounded" />
          <div className="flex items-center gap-2">
            <div className="h-6 w-14 bg-gray-100/70 rounded-md" />
            <div className="flex gap-1">
              <div className="h-7 w-7 bg-gray-100/70 rounded-full" />
              <div className="h-7 w-7 bg-gray-100/70 rounded-full" />
            </div>
          </div>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {[...Array(cardCount)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>

        {/* Second section */}
        <div className="mt-10">
          <div className="flex items-center justify-between py-6">
            <div className="h-5 w-40 bg-gray-200/70 rounded" />
            <div className="flex items-center gap-2">
              <div className="h-6 w-14 bg-gray-100/70 rounded-md" />
              <div className="flex gap-1">
                <div className="h-7 w-7 bg-gray-100/70 rounded-full" />
                <div className="h-7 w-7 bg-gray-100/70 rounded-full" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 pb-8">
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

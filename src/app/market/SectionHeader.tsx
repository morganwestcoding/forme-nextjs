'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SectionHeaderProps {
  title: string;                  // e.g., "Featured Storefronts", "Trending Teammates"
  accent?: string;                // brand color hex
  onPrev?: () => void;
  onNext?: () => void;
  onViewAll?: () => void;
  className?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  accent = '#60A5FA',
  onPrev,
  onNext,
  onViewAll,
  className = '',
}) => {
  const hasControls = onPrev || onNext || onViewAll;

  return (
    <div className={`mt-6 mb-4 ${className}`}>
      {/* header row */}
      <div className="flex items-end justify-between">
        {/* LEFT: title with underline */}
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-gray-900">
            {title}
          </h2>
          <div
            className="mt-1 h-[2px] w-14 rounded-full"
            style={{ backgroundColor: accent }}
          />
        </div>

        {/* RIGHT: controls (always render container for consistent spacing) */}
        <div className="flex items-center gap-1.5 ml-4" style={{ minHeight: '36px' }}>
          {hasControls && (
            <>
              {onPrev && (
                <button
                  type="button"
                  aria-label={`Scroll ${title} left`}
                  onClick={onPrev}
                  className="h-9 w-9 rounded-full flex items-center justify-center shadow-sm text-gray-500 hover:text-[#60A5FA] hover:shadow-md transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              
              {onNext && (
                <button
                  type="button"
                  aria-label={`Scroll ${title} right`}
                  onClick={onNext}
                  className="h-9 w-9 rounded-full flex items-center justify-center shadow-sm text-gray-500 hover:text-[#60A5FA] hover:shadow-md transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
              
              {onViewAll && (
                <button
                  type="button"
                  onClick={onViewAll}
                  className="hidden md:inline-flex items-center text-sm text-gray-500 hover:text-[#60A5FA] px-2 py-1 rounded-md hover:bg-gray-50 transition-colors"
                >
                  View all
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SectionHeader;
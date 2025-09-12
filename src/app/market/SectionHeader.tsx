'use client';

import React from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  accent?: string;
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
  const hasNavigation = onPrev || onNext;

  return (
    <div className={`mt-6 mb-4 ${className}`}>
      <div className="flex items-end justify-between">
        {/* LEFT: title with underline (unchanged as requested) */}
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-gray-900">
            {title}
          </h2>
          <div
            className="mt-1 h-[2px] w-14 rounded-full"
            style={{ backgroundColor: accent }}
          />
        </div>

        {/* RIGHT: ghost arrows + view all */}
        <div className="flex items-center gap-1 ml-4">
          {hasNavigation && (
            <>
              <button
                onClick={onPrev}
                disabled={!onPrev}
                className="p-2 text-gray-400 hover:text-gray-700 disabled:text-gray-200 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={onNext}
                disabled={!onNext}
                className="p-2 text-gray-400 hover:text-gray-700 disabled:text-gray-200 disabled:cursor-not-allowed transition-colors"
                aria-label="Next"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}
          {onViewAll && (
            <button
              onClick={onViewAll}
              className="ml-2 text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1 group"
            >
              View all

            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SectionHeader;
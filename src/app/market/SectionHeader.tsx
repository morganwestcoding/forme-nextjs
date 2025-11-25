'use client';

import React from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  onPrev?: () => void;
  onNext?: () => void;
  onViewAll?: () => void;
  viewAllLabel?: string;  // Custom label for view all button
  className?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  onPrev,
  onNext,
  onViewAll,
  viewAllLabel = 'View all',  // Default to "View all"
  className = '',
}) => {
  const hasNavigation = onPrev || onNext;

  return (
    <div className={`mt-8 mb-4 ${className}`}>
      <div className="flex items-center justify-between">
        {/* LEFT: title */}
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
          {title}
        </h2>

        {/* RIGHT: view all */}
        <div className="flex items-center gap-1 ml-4">
          {onViewAll && (
            <button
              onClick={onViewAll}
              className="p-1 text-sm text-gray-600/90 hover:text-gray-700 transition-colors inline-flex items-center gap-1"
              aria-label={viewAllLabel}
            >
              {viewAllLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SectionHeader;
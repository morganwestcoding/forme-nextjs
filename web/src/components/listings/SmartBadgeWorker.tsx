'use client';

import React from 'react';
import { SafeEmployee } from '@/app/types';

interface SmartBadgeWorkerProps {
  employee: SafeEmployee & {
    rating?: number;
    isTrending?: boolean;
    followerCount?: number;
  };
  listingTitle: string;
  rating?: number;
  followerCount?: number;
  onRatingClick?: () => void;
  onTimeClick?: (e?: React.MouseEvent) => void;
}

const SmartBadgeWorker: React.FC<SmartBadgeWorkerProps> = ({
  employee,
  rating = (employee as any)?.rating ?? 5.0,
  onRatingClick,
  onTimeClick,
}) => {
  const handleRatingClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRatingClick?.();
  };

  const handleBookNowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onTimeClick?.(e);
  };

  return (
    <div className="flex items-baseline gap-2 text-[12px] text-white/90">
      <button
        onClick={handleRatingClick}
        className="font-semibold tabular-nums hover:text-white transition-colors"
        type="button"
        aria-label={`Rating ${Number(rating).toFixed(1)} stars`}
      >
        {Number(rating).toFixed(1)}
      </button>
      <span className="text-white/40">/</span>
      <button
        onClick={handleBookNowClick}
        className="text-white/70 hover:text-white transition-colors"
        type="button"
        aria-label="Reserve"
      >
        Reserve
      </button>
    </div>
  );
};

export default SmartBadgeWorker;

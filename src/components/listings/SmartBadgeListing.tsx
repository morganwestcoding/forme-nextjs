'use client';

import React from 'react';

interface SmartBadgeListingProps {
  rating?: number;
  followerCount?: number;
  onRatingClick?: () => void;
  onFollowerClick?: () => void;
}

const SmartBadgeListing: React.FC<SmartBadgeListingProps> = ({
  rating = 4.8,
  followerCount = 0,
  onRatingClick,
  onFollowerClick,
}) => {
  /** ----- Visual props (white background optimized) ----- */
  const getRatingTheme = () => {
    if (rating >= 4.5) {
      return {
        bg: 'bg-amber-100/60',
        border: 'border-amber-200/40',
        text: 'text-amber-700',
        dot: 'bg-amber-500',
        hover: 'hover:bg-amber-100/80',
      };
    }
    if (rating >= 4.0) {
      return {
        bg: 'bg-emerald-100/60',
        border: 'border-emerald-200/40',
        text: 'text-emerald-700',
        dot: 'bg-emerald-500',
        hover: 'hover:bg-emerald-100/80',
      };
    }
    return {
      bg: 'bg-blue-100/60',
      border: 'border-blue-200/40',
      text: 'text-blue-700',
      dot: 'bg-blue-500',
      hover: 'hover:bg-blue-100/80',
    };
  };

  const ratingTheme = getRatingTheme();

  const getFollowerTheme = () => {
    if (followerCount >= 1000) {
      return {
        bg: 'bg-violet-100/60',
        border: 'border-violet-200/40',
        text: 'text-violet-700',
        dot: 'bg-violet-500',
        hover: 'hover:bg-violet-100/80',
      };
    }
    if (followerCount >= 100) {
      return {
        bg: 'bg-blue-100/60',
        border: 'border-blue-200/40',
        text: 'text-blue-700',
        dot: 'bg-blue-500',
        hover: 'hover:bg-blue-100/80',
      };
    }
    return {
      bg: 'bg-gray-100/60',
      border: 'border-gray-200/40',
      text: 'text-gray-700',
      dot: 'bg-gray-500',
      hover: 'hover:bg-gray-100/80',
    };
  };

  const followerTheme = getFollowerTheme();

  const formatFollowerCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const pillBase =
    'backdrop-blur-sm rounded-md py-1.5 text-xs font-medium px-3.5 text-center ' +
    'transition-all duration-200 cursor-pointer hover:scale-105';

  return (
    <div className="flex items-center gap-2">
      {/* Rating pill - smaller width */}
      <button
        type="button"
        aria-label={`Rating ${Number(rating).toFixed(1)} stars`}
        onClick={(e) => { e.stopPropagation(); onRatingClick?.(); }}
        className="group p-0"
      >
        <div
          className={[
            pillBase,
            'w-14',
            ratingTheme.bg,
            `border ${ratingTheme.border}`,
            ratingTheme.text,
            ratingTheme.hover,
          ].join(' ')}
          title={`Rating ${Number(rating).toFixed(1)} stars`}
        >
          <div className="flex items-center justify-center gap-1">
            <span className="tabular-nums font-semibold">{Number(rating).toFixed(1)}</span>
          </div>
        </div>
      </button>

      {/* Followers pill - larger width */}
      <button
        type="button"
        aria-label={`${followerCount} followers`}
        onClick={(e) => { e.stopPropagation(); onFollowerClick?.(); }}
        className="group p-0"
      >
        <div
          className={[
            pillBase,
            'w-16',
            followerTheme.bg,
            `border ${followerTheme.border}`,
            followerTheme.text,
            followerTheme.hover,
          ].join(' ')}
          title={`${followerCount} followers`}
        >
          <span className="tabular-nums font-semibold">{formatFollowerCount(followerCount)}</span>
        </div>
      </button>
    </div>
  );
};

export default SmartBadgeListing;
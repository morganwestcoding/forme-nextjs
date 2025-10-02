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
      {/* Rating pill with sparkle icon */}
      <button
        type="button"
        aria-label={`Rating ${Number(rating).toFixed(1)} stars`}
        onClick={(e) => { e.stopPropagation(); onRatingClick?.(); }}
        className="group p-0"
      >
        <div
          className={[
            pillBase,
            'w-16',
            ratingTheme.bg,
            `border ${ratingTheme.border}`,
            ratingTheme.text,
            ratingTheme.hover,
          ].join(' ')}
          title={`Rating ${Number(rating).toFixed(1)} stars`}
        >
          <div className="flex items-center justify-center gap-1">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              width="14" 
              height="14" 
              fill="none"
              className={`${ratingTheme.text} flex-shrink-0`}
            >
              <path 
                d="M3 12C7.5 12 12 7.5 12 3C12 7.5 16.5 12 21 12C16.5 12 12 16.5 12 21C12 16.5 7.5 12 3 12Z" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinejoin="round"
              />
              <path 
                d="M2 19.5C2.83333 19.5 4.5 17.8333 4.5 17C4.5 17.8333 6.16667 19.5 7 19.5C6.16667 19.5 4.5 21.1667 4.5 22C4.5 21.1667 2.83333 19.5 2 19.5Z" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinejoin="round"
              />
              <path 
                d="M16 5C17 5 19 3 19 2C19 3 21 5 22 5C21 5 19 7 19 8C19 7 17 5 16 5Z" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinejoin="round"
              />
            </svg>
            <span className="tabular-nums font-semibold">{Number(rating).toFixed(1)}</span>
          </div>
        </div>
      </button>

      {/* Followers pill with users icon */}
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
          <div className="flex items-center justify-center gap-1">
            <span className="tabular-nums font-semibold">{formatFollowerCount(followerCount)}</span>
          </div>
        </div>
      </button>
    </div>
  );
};

export default SmartBadgeListing;
'use client';

import React from 'react';
import { SafeEmployee } from '@/app/types';

interface SmartBadgeWorkerProps {
  employee: SafeEmployee;
  listingTitle: string;      // kept for parity (unused)
  rating?: number;           // falls back to employee.rating if present
  followerCount?: number;    // default 847 if absent
  onRatingClick?: () => void;
  onFollowerClick?: () => void;
}

const SmartBadgeWorker: React.FC<SmartBadgeWorkerProps> = ({
  employee,
  listingTitle, // unused
  rating = (employee as any)?.rating ?? 4.7,
  followerCount = (employee as any)?.followerCount ?? 847,
  onRatingClick,
  onFollowerClick,
}) => {
  const isTrending = (employee as any)?.isTrending ?? false;

  // Rating pill theme
  const getRatingTheme = () => {
    if (isTrending) {
      return {
        bg: 'bg-violet-100/60',
        border: 'border-violet-200/40',
        text: 'text-violet-700',
        dot: 'bg-violet-500',
        hover: 'hover:bg-violet-100/80',
      };
    }
    if (rating >= 4.5) {
      return {
        bg: 'bg-amber-100/60',
        border: 'border-amber-200/40',
        text: 'text-amber-700',
        dot: 'bg-amber-500',
        hover: 'hover:bg-amber-100/80',
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

  // Followers pill theme by tier
  const tier = followerCount >= 5000 ? 'green' : followerCount >= 1000 ? 'orange' : 'red';
  const followersTheme =
    tier === 'green'
      ? {
          bg: 'bg-emerald-100/60',
          border: 'border-emerald-200/40',
          text: 'text-emerald-700',
          dot: 'bg-emerald-500',
          hover: 'hover:bg-emerald-100/80',
        }
      : tier === 'orange'
      ? {
          bg: 'bg-orange-100/60',
          border: 'border-orange-200/40',
          text: 'text-orange-700',
          dot: 'bg-orange-500',
          hover: 'hover:bg-orange-100/80',
        }
      : {
          bg: 'bg-rose-100/60',
          border: 'border-rose-200/40',
          text: 'text-rose-700',
          dot: 'bg-rose-500',
          hover: 'hover:bg-rose-100/80',
        };

  // Updated pill styling to match your request
  const pillBase =
    'backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs font-medium w-20 text-center ' +
    'transition-all duration-200 cursor-pointer hover:scale-105';

  const fmtFollowers = (n: number) =>
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000 ? `${(n / 1_000).toFixed(1)}k`
    : String(n);

  return (
    <div className="flex items-center gap-3">
      {/* Rating pill */}
      <button
        type="button"
        aria-label="Rating"
        onClick={(e) => { e.stopPropagation(); onRatingClick?.(); }}
        className="group p-0"
      >
        <div
          className={[
            pillBase,
            ratingTheme.bg,
            `border ${ratingTheme.border}`,
            ratingTheme.text,
            ratingTheme.hover,
          ].join(' ')}
          title={`Rating ${Number(rating).toFixed(1)}`}
        >
          <div className="flex items-center justify-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${ratingTheme.dot}`} />
            <span className="tabular-nums font-semibold">{Number(rating).toFixed(1)}</span>
          </div>
        </div>
      </button>

      {/* Followers pill */}
      <button
        type="button"
        aria-label="Followers"
        onClick={(e) => { e.stopPropagation(); onFollowerClick?.(); }}
        className="group p-0"
      >
        <div
          className={[
            pillBase,
            followersTheme.bg,
            `border ${followersTheme.border}`,
            followersTheme.text,
            followersTheme.hover,
          ].join(' ')}
          title={`${fmtFollowers(followerCount)} followers`}
        >
          <div className="flex items-center justify-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${followersTheme.dot}`} />
            <span className="tabular-nums font-semibold">{fmtFollowers(followerCount)}</span>
          </div>
        </div>
      </button>
    </div>
  );
};

export default SmartBadgeWorker;
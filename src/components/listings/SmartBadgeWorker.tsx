'use client';

import React from 'react';
import { SafeEmployee } from '@/app/types';

interface SmartBadgeWorkerProps {
  employee: SafeEmployee;
  listingTitle: string;
  rating?: number;          // falls back to employee.rating if present
  followerCount?: number;   // default 847 if absent
  onRatingClick?: () => void;
  onFollowerClick?: () => void;
}

/**
 * This is a 1:1 visual clone of your SmartBadgeRating:
 * two compact gradient pills (dot + text), tiny fonts, hover scale,
 * no icons, same spacing and classes. Left = rating, Right = followers.
 */
const SmartBadgeWorker: React.FC<SmartBadgeWorkerProps> = ({
  employee,
  listingTitle, // unused; kept for parity
  rating = (employee as any)?.rating ?? 4.7,
  followerCount = (employee as any)?.followerCount ?? 847,
  onRatingClick,
  onFollowerClick,
}) => {
  /** ----- Rating visual (exact same branching + colors) ----- */
  const isTrending = (employee as any)?.isTrending ?? false;

  const getRatingVisual = () => {
    if (isTrending) {
      return {
        bg: 'bg-gradient-to-r from-purple-500/20 to-violet-500/20',
        border: 'border-purple-400/40',
        shadow: 'shadow-purple-500/20',
        text: 'text-purple-200',
        dot: 'bg-purple-300',
      };
    } else if (rating >= 4.5) {
      return {
        bg: 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20',
        border: 'border-yellow-400/40',
        shadow: 'shadow-yellow-500/20',
        text: 'text-yellow-200',
        dot: 'bg-amber-300',
      };
    } else {
      return {
        bg: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20',
        border: 'border-blue-400/40',
        shadow: 'shadow-blue-500/20',
        text: 'text-blue-200',
        dot: 'bg-cyan-300',
      };
    }
  };
  const ratingV = getRatingVisual();

  /** ----- Followers visual (mirrors the "time pill" style) ----- */
  // Popularity tiers just to vary the color like your time status
  const popTier =
    followerCount >= 5000 ? 'green' : followerCount >= 1000 ? 'orange' : 'red';

  const followersWrap =
    popTier === 'green'
      ? 'bg-gradient-to-r from-lime-500/20 to-green-600/20 border-lime-400/40 shadow-lime-500/20'
      : popTier === 'orange'
      ? 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 border-orange-400/40 shadow-orange-500/20'
      : 'bg-gradient-to-r from-red-500/20 to-rose-500/20 border-red-400/40 shadow-red-500/20';

  const followersText =
    popTier === 'green'
      ? 'text-lime-200'
      : popTier === 'orange'
      ? 'text-orange-200'
      : 'text-rose-200';

  const followersDot =
    popTier === 'green'
      ? 'bg-lime-300'
      : popTier === 'orange'
      ? 'bg-amber-300'
      : 'bg-rose-300';

  const pillBase =
    'border rounded-md px-2 py-1 group-hover:scale-105 transition-all duration-300 shadow-sm inline-flex items-center justify-center gap-1 w-20';

  const fmtFollowers = (n: number) =>
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000 ? `${(n / 1_000).toFixed(1)}k`
    : String(n);

  return (
    <div className="flex items-center gap-2">
      {/* Rating pill — identical structure to SmartBadgeRating */}
      <button
        onClick={(e) => { e.stopPropagation(); onRatingClick?.(); }}
        className="inline-flex rounded-xl hover:bg-white/10 transition-all duration-300 group p-0"
        type="button"
        aria-label="Rating"
      >
        <div className={`${pillBase} ${ratingV.bg} ${ratingV.border} ${ratingV.shadow}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${ratingV.dot}`} />
          <span className={`text-xs ${ratingV.text}`}>{Number(rating).toFixed(1)}</span>
        </div>
      </button>

      {/* Followers pill — same look/spacing as the time pill */}
      <button
        onClick={(e) => { e.stopPropagation(); onFollowerClick?.(); }}
        className="inline-flex rounded-xl hover:bg-white/10 transition-all duration-300 group p-0"
        type="button"
        aria-label="Followers"
      >
        <div className={`${pillBase} ${followersWrap}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${followersDot}`} />
          <span className={`text-xs ${followersText}`}>{fmtFollowers(followerCount)}</span>
        </div>
      </button>
    </div>
  );
};

export default SmartBadgeWorker;

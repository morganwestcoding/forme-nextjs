'use client';

import React, { useCallback } from 'react';
import useFavorite from "@/app/hooks/useFavorite";
import { SafeUser } from "@/app/types";

interface HeartButtonProps {
  listingId: string;
  currentUser?: SafeUser | null;
  variant?: 'default' | 'listingHead' | 'worker';
  favoriteIds?: string[];
}

const HeartButton: React.FC<HeartButtonProps> = ({
  listingId,
  currentUser,
  variant = 'default',
  favoriteIds = []
}) => {
  const { hasFavorited, toggleFavorite } = useFavorite({
    listingId,
    currentUser
  });

  const handleToggle = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    toggleFavorite(e);
  }, [toggleFavorite]);

  /** ----- Worker variant (same styling as default for consistency) ----- */
  if (variant === 'worker') {
    return (
      <div
        onClick={handleToggle}
        className={`
          p-2 rounded-xl border transition-all duration-500 ease-out cursor-pointer active:scale-[0.97]
          ${hasFavorited
            ? 'bg-gradient-to-b from-[#E45358] to-[#D63E43] border-[#D63E43] shadow-sm shadow-[#E45358]/20'
            : 'bg-gradient-to-b from-white/15 to-white/5 border-white/20 hover:border-white/40'
          }
        `}
        aria-label={hasFavorited ? 'Remove from favorites' : 'Add to favorites'}
        role="button"
        title="Save"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="20"
          height="20"
          className="transition-all duration-500 ease-out"
        >
          <path
            d="M19.4626 3.99415C16.7809 2.34923 14.4404 3.01211 13.0344 4.06801C12.4578 4.50096 12.1696 4.71743 12 4.71743C11.8304 4.71743 11.5422 4.50096 10.9656 4.06801C9.55962 3.01211 7.21909 2.34923 4.53744 3.99415C1.01807 6.15294 0.221721 13.2749 8.33953 19.2834C9.88572 20.4278 10.6588 21 12 21C13.3412 21 14.1143 20.4278 15.6605 19.2834C23.7783 13.2749 22.9819 6.15294 19.4626 3.99415Z"
            fill={hasFavorited ? 'white' : 'rgba(255,255,255,0.4)'}
            stroke={hasFavorited ? 'white' : 'rgba(255,255,255,0.5)'}
            strokeWidth="1.5"
          />
        </svg>
      </div>
    );
  }

  /** ----- ListingHead variant ----- */
  if (variant === 'listingHead') {
    return (
      <div
        onClick={handleToggle}
        className={`
          p-2 rounded-xl border transition-all duration-500 ease-out cursor-pointer active:scale-[0.97]
          ${hasFavorited
            ? 'bg-gradient-to-b from-[#E45358] to-[#D63E43] border-[#D63E43] shadow-sm shadow-[#E45358]/20'
            : 'bg-gradient-to-b from-white to-gray-50 border-gray-200/60 hover:border-gray-300'
          }
        `}
        aria-label={hasFavorited ? 'Remove from favorites' : 'Add to favorites'}
        role="button"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="20"
          height="20"
          className="transition-all duration-500 ease-out"
        >
          <path
            d="M19.4626 3.99415C16.7809 2.34923 14.4404 3.01211 13.0344 4.06801C12.4578 4.50096 12.1696 4.71743 12 4.71743C11.8304 4.71743 11.5422 4.50096 10.9656 4.06801C9.55962 3.01211 7.21909 2.34923 4.53744 3.99415C1.01807 6.15294 0.221721 13.2749 8.33953 19.2834C9.88572 20.4278 10.6588 21 12 21C13.3412 21 14.1143 20.4278 15.6605 19.2834C23.7783 13.2749 22.9819 6.15294 19.4626 3.99415Z"
            fill={hasFavorited ? 'white' : '#9ca3af'}
            stroke={hasFavorited ? 'white' : '#9ca3af'}
            strokeWidth="1.5"
          />
        </svg>
      </div>
    );
  }

  /** ----- Default variant (simplified like ListingCard heart) ----- */
  return (
    <div
      onClick={handleToggle}
      className={`
        p-2 rounded-xl border transition-all duration-500 ease-out cursor-pointer active:scale-[0.97]
        ${hasFavorited
          ? 'bg-gradient-to-b from-[#E45358] to-[#D63E43] border-[#D63E43] shadow-sm shadow-[#E45358]/20'
          : 'bg-gradient-to-b from-white/15 to-white/5 border-white/20 hover:border-white/40'
        }
      `}
      aria-label={hasFavorited ? 'Remove from favorites' : 'Add to favorites'}
      role="button"
      title="Save"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="20"
        height="20"
        className="transition-all duration-500 ease-out"
      >
        <path
          d="M19.4626 3.99415C16.7809 2.34923 14.4404 3.01211 13.0344 4.06801C12.4578 4.50096 12.1696 4.71743 12 4.71743C11.8304 4.71743 11.5422 4.50096 10.9656 4.06801C9.55962 3.01211 7.21909 2.34923 4.53744 3.99415C1.01807 6.15294 0.221721 13.2749 8.33953 19.2834C9.88572 20.4278 10.6588 21 12 21C13.3412 21 14.1143 20.4278 15.6605 19.2834C23.7783 13.2749 22.9819 6.15294 19.4626 3.99415Z"
          fill={hasFavorited ? 'white' : 'rgba(255,255,255,0.4)'}
          stroke={hasFavorited ? 'white' : 'rgba(255,255,255,0.5)'}
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
};

export default HeartButton;
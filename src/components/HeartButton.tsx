'use client';

import React, { useCallback } from 'react';
import useFavorite from "@/app/hooks/useFavorite";
import { SafeUser } from "@/app/types";

interface HeartButtonProps {
  listingId: string;
  currentUser?: SafeUser | null;
  variant?: 'default' | 'listingHead';
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

  /** ----- ListingHead variant ----- */
  if (variant === 'listingHead') {
    return (
      <div
        onClick={handleToggle}
        className="
          relative inline-flex items-center justify-center
          rounded-full transition hover:scale-105 cursor-pointer
          drop-shadow-sm
        "
        aria-label={hasFavorited ? 'Remove from favorites' : 'Add to favorites'}
        role="button"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="26"
          height="26"
          className={`transition-colors duration-300 ${hasFavorited ? 'text-[#ed353b]' : 'text-neutral-400'}`}
        >
          <path
            d="M19.4626 3.99415C16.7809 2.34923 14.4404 3.01211 13.0344 4.06801C12.4578 4.50096 12.1696 4.71743 12 4.71743C11.8304 4.71743 11.5422 4.50096 10.9656 4.06801C9.55962 3.01211 7.21909 2.34923 4.53744 3.99415C1.01807 6.15294 0.221721 13.2749 8.33953 19.2834C9.88572 20.4278 10.6588 21 12 21C13.3412 21 14.1143 20.4278 15.6605 19.2834C23.7783 13.2749 22.9819 6.15294 19.4626 3.99415Z"
            stroke="#ffffff"          // ✅ fixed white stroke
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="currentColor"
          />
        </svg>
      </div>
    );
  }

  /** ----- Default variant ----- */
  return (
    <div
      onClick={handleToggle}
      className="
        p-3 rounded-full bg-white/80 backdrop-blur-sm 
        hover:bg-white hover:scale-110 transition-all duration-300 
        shadow-lg cursor-pointer
      "
      aria-label={hasFavorited ? 'Remove from favorites' : 'Add to favorites'}
      role="button"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="18"
        height="18"
        className={`transition-colors duration-300 ${hasFavorited ? 'text-[#E45358]' : 'text-black/50'}`}
      >
        <path
          d="M19.4626 3.99415C16.7809 2.34923 14.4404 3.01211 13.0344 4.06801C12.4578 4.50096 12.1696 4.71743 12 4.71743C11.8304 4.71743 11.5422 4.50096 10.9656 4.06801C9.55962 3.01211 7.21909 2.34923 4.53744 3.99415C1.01807 6.15294 0.221721 13.2749 8.33953 19.2834C9.88572 20.4278 10.6588 21 12 21C13.3412 21 14.1143 20.4278 15.6605 19.2834C23.7783 13.2749 22.9819 6.15294 19.4626 3.99415Z"
          stroke="#ffffff"          // ✅ fixed white stroke
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="currentColor"
        />
      </svg>
    </div>
  );
};

export default HeartButton;

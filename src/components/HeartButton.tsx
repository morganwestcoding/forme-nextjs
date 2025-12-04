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

  const handleToggle = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    e.stopPropagation();
    toggleFavorite(e as unknown as React.MouseEvent<HTMLDivElement>);
  }, [toggleFavorite]);

  /** ----- Worker variant (same styling as default for consistency) ----- */
  if (variant === 'worker') {
    return (
      <svg
        onClick={handleToggle}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="24"
        height="24"
        className="transition-all duration-500 ease-out cursor-pointer active:scale-[0.97]"
        aria-label={hasFavorited ? 'Remove from favorites' : 'Add to favorites'}
        role="button"
      >
        <title>Save</title>
        <defs>
          <linearGradient id="heartGradientWorker" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E45358" />
            <stop offset="100%" stopColor="#D63E43" />
          </linearGradient>
        </defs>
        <path
          d="M19.4626 3.99415C16.7809 2.34923 14.4404 3.01211 13.0344 4.06801C12.4578 4.50096 12.1696 4.71743 12 4.71743C11.8304 4.71743 11.5422 4.50096 10.9656 4.06801C9.55962 3.01211 7.21909 2.34923 4.53744 3.99415C1.01807 6.15294 0.221721 13.2749 8.33953 19.2834C9.88572 20.4278 10.6588 21 12 21C13.3412 21 14.1143 20.4278 15.6605 19.2834C23.7783 13.2749 22.9819 6.15294 19.4626 3.99415Z"
          fill={hasFavorited ? 'url(#heartGradientWorker)' : 'rgba(255,255,255,0.4)'}
          stroke={hasFavorited ? '#D63E43' : 'rgba(255,255,255,0.5)'}
          strokeWidth="1.5"
        />
      </svg>
    );
  }

  /** ----- ListingHead variant ----- */
  if (variant === 'listingHead') {
    return (
      <svg
        onClick={handleToggle}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="24"
        height="24"
        className="transition-all duration-500 ease-out cursor-pointer active:scale-[0.97]"
        aria-label={hasFavorited ? 'Remove from favorites' : 'Add to favorites'}
        role="button"
      >
        <defs>
          <linearGradient id="heartGradientListing" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E45358" />
            <stop offset="100%" stopColor="#D63E43" />
          </linearGradient>
        </defs>
        <path
          d="M19.4626 3.99415C16.7809 2.34923 14.4404 3.01211 13.0344 4.06801C12.4578 4.50096 12.1696 4.71743 12 4.71743C11.8304 4.71743 11.5422 4.50096 10.9656 4.06801C9.55962 3.01211 7.21909 2.34923 4.53744 3.99415C1.01807 6.15294 0.221721 13.2749 8.33953 19.2834C9.88572 20.4278 10.6588 21 12 21C13.3412 21 14.1143 20.4278 15.6605 19.2834C23.7783 13.2749 22.9819 6.15294 19.4626 3.99415Z"
          fill={hasFavorited ? 'url(#heartGradientListing)' : '#9ca3af'}
          stroke={hasFavorited ? '#D63E43' : '#9ca3af'}
          strokeWidth="1.5"
        />
      </svg>
    );
  }

  /** ----- Default variant (simplified like ListingCard heart) ----- */
  return (
    <svg
      onClick={handleToggle}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      className="transition-all duration-500 ease-out cursor-pointer active:scale-[0.97]"
      aria-label={hasFavorited ? 'Remove from favorites' : 'Add to favorites'}
      role="button"
    >
      <title>Save</title>
      <defs>
        <linearGradient id="heartGradientDefault" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#E45358" />
          <stop offset="100%" stopColor="#D63E43" />
        </linearGradient>
      </defs>
      <path
        d="M19.4626 3.99415C16.7809 2.34923 14.4404 3.01211 13.0344 4.06801C12.4578 4.50096 12.1696 4.71743 12 4.71743C11.8304 4.71743 11.5422 4.50096 10.9656 4.06801C9.55962 3.01211 7.21909 2.34923 4.53744 3.99415C1.01807 6.15294 0.221721 13.2749 8.33953 19.2834C9.88572 20.4278 10.6588 21 12 21C13.3412 21 14.1143 20.4278 15.6605 19.2834C23.7783 13.2749 22.9819 6.15294 19.4626 3.99415Z"
        fill={hasFavorited ? 'url(#heartGradientDefault)' : 'rgba(255,255,255,0.4)'}
        stroke={hasFavorited ? '#D63E43' : 'rgba(255,255,255,0.5)'}
        strokeWidth="1.5"
      />
    </svg>
  );
};

export default HeartButton;

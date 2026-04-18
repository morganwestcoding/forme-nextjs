'use client';

import React, { useCallback } from 'react';
import useFavorite from "@/app/hooks/useFavorite";
import { SafeUser } from "@/app/types";

interface HeartButtonProps {
  listingId: string;
  currentUser?: SafeUser | null;
  variant?: 'default' | 'listingHead' | 'worker' | 'card';
  favoriteIds?: string[];
}

const HeartButton: React.FC<HeartButtonProps> = ({
  listingId,
  currentUser,
  variant = 'default',
}) => {
  const { hasFavorited, toggleFavorite } = useFavorite({
    listingId,
    currentUser
  });

  const handleToggle = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    e.stopPropagation();
    toggleFavorite(e as unknown as React.MouseEvent<HTMLDivElement>);
  }, [toggleFavorite]);

  /*
   * Two contexts:
   *  - "on-light" (card, listingHead) — dark fill/stroke for contrast on white
   *  - "on-dark"  (default, worker)   — light fill/stroke for contrast on images/dark bg
   */
  const onLight = variant === 'card' || variant === 'listingHead';

  const activeFill   = onLight ? '#292524' : 'rgba(255,255,255,0.9)';   // stone-900 / white
  const activeStroke  = onLight ? '#292524' : 'rgba(255,255,255,0.9)';
  const inactiveFill  = 'none';
  const inactiveStroke = onLight ? '#a8a29e' : 'rgba(255,255,255,0.6)'; // stone-400 / white-60

  const size = variant === 'worker' ? 24 : 20;

  return (
    <svg
      onClick={handleToggle}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className="transition-all duration-500 ease-out cursor-pointer active:scale-[0.92] hover:scale-110"
      aria-label={hasFavorited ? 'Remove from favorites' : 'Add to favorites'}
      role="button"
    >
      <title>Save</title>
      <path
        d="M10.4107 19.9677C7.58942 17.858 2 13.0348 2 8.69444C2 5.82563 4.10526 3.5 7 3.5C8.5 3.5 10 4 12 6C14 4 15.5 3.5 17 3.5C19.8947 3.5 22 5.82563 22 8.69444C22 13.0348 16.4106 17.858 13.5893 19.9677C12.6399 20.6776 11.3601 20.6776 10.4107 19.9677Z"
        fill={hasFavorited ? activeFill : inactiveFill}
        stroke={hasFavorited ? activeStroke : inactiveStroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default HeartButton;

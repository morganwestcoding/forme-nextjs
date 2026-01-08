'use client';

import React, { useCallback } from 'react';
import useFavorite from "@/app/hooks/useFavorite";
import { SafeUser } from "@/app/types";
import { useTheme } from '@/app/context/ThemeContext';

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
}) => {
  const { hasFavorited, toggleFavorite } = useFavorite({
    listingId,
    currentUser
  });
  const { accentColor } = useTheme();

  // Calculate a slightly darker shade for the gradient (same as VerificationBadge)
  const getDarkerShade = (hex: string): string => {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = -20;
    const R = Math.max(0, Math.min(255, (num >> 16) + Math.round(2.55 * amt)));
    const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + Math.round(2.55 * amt)));
    const B = Math.max(0, Math.min(255, (num & 0x0000FF) + Math.round(2.55 * amt)));
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
  };

  const darkerColor = getDarkerShade(accentColor);

  // Generate unique gradient IDs to avoid conflicts
  const gradientId = `heartGrad-${React.useId().replace(/:/g, '')}`;

  const handleToggle = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    e.stopPropagation();
    toggleFavorite(e as unknown as React.MouseEvent<HTMLDivElement>);
  }, [toggleFavorite]);

  /** ----- Worker variant ----- */
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
          <linearGradient id={`${gradientId}-worker`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={accentColor} />
            <stop offset="100%" stopColor={darkerColor} />
          </linearGradient>
        </defs>
        <path
          d="M10.4107 19.9677C7.58942 17.858 2 13.0348 2 8.69444C2 5.82563 4.10526 3.5 7 3.5C8.5 3.5 10 4 12 6C14 4 15.5 3.5 17 3.5C19.8947 3.5 22 5.82563 22 8.69444C22 13.0348 16.4106 17.858 13.5893 19.9677C12.6399 20.6776 11.3601 20.6776 10.4107 19.9677Z"
          fill={hasFavorited ? `url(#${gradientId}-worker)` : 'rgba(255,255,255,0.4)'}
          stroke={hasFavorited ? darkerColor : 'rgba(255,255,255,0.5)'}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
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
          <linearGradient id={`${gradientId}-listing`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={accentColor} />
            <stop offset="100%" stopColor={darkerColor} />
          </linearGradient>
        </defs>
        <path
          d="M10.4107 19.9677C7.58942 17.858 2 13.0348 2 8.69444C2 5.82563 4.10526 3.5 7 3.5C8.5 3.5 10 4 12 6C14 4 15.5 3.5 17 3.5C19.8947 3.5 22 5.82563 22 8.69444C22 13.0348 16.4106 17.858 13.5893 19.9677C12.6399 20.6776 11.3601 20.6776 10.4107 19.9677Z"
          fill={hasFavorited ? `url(#${gradientId}-listing)` : '#9ca3af'}
          stroke={hasFavorited ? darkerColor : '#9ca3af'}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  /** ----- Default variant ----- */
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
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={accentColor} />
          <stop offset="100%" stopColor={darkerColor} />
        </linearGradient>
      </defs>
      <path
        d="M10.4107 19.9677C7.58942 17.858 2 13.0348 2 8.69444C2 5.82563 4.10526 3.5 7 3.5C8.5 3.5 10 4 12 6C14 4 15.5 3.5 17 3.5C19.8947 3.5 22 5.82563 22 8.69444C22 13.0348 16.4106 17.858 13.5893 19.9677C12.6399 20.6776 11.3601 20.6776 10.4107 19.9677Z"
        fill={hasFavorited ? `url(#${gradientId})` : 'rgba(255,255,255,0.4)'}
        stroke={hasFavorited ? darkerColor : 'rgba(255,255,255,0.5)'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default HeartButton;

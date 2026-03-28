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

const FILL_COLOR = '#292524'; // stone-900 — solid dark fill when active

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
        <path
          d="M10.4107 19.9677C7.58942 17.858 2 13.0348 2 8.69444C2 5.82563 4.10526 3.5 7 3.5C8.5 3.5 10 4 12 6C14 4 15.5 3.5 17 3.5C19.8947 3.5 22 5.82563 22 8.69444C22 13.0348 16.4106 17.858 13.5893 19.9677C12.6399 20.6776 11.3601 20.6776 10.4107 19.9677Z"
          fill={hasFavorited ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)'}
          stroke={hasFavorited ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)'}
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
        width="20"
        height="20"
        className="transition-all duration-300 ease-out cursor-pointer active:scale-[0.92] hover:scale-110"
        aria-label={hasFavorited ? 'Remove from favorites' : 'Add to favorites'}
        role="button"
      >
        <path
          d="M10.4107 19.9677C7.58942 17.858 2 13.0348 2 8.69444C2 5.82563 4.10526 3.5 7 3.5C8.5 3.5 10 4 12 6C14 4 15.5 3.5 17 3.5C19.8947 3.5 22 5.82563 22 8.69444C22 13.0348 16.4106 17.858 13.5893 19.9677C12.6399 20.6776 11.3601 20.6776 10.4107 19.9677Z"
          fill={hasFavorited ? '#e11d48' : 'none'}
          stroke={hasFavorited ? '#e11d48' : '#d4d4d4'}
          strokeWidth="1.5"
        />
      </svg>
    );
  }

  /** ----- Card variant (visible on white backgrounds) ----- */
  if (variant === 'card') {
    return (
      <svg
        onClick={handleToggle}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="20"
        height="20"
        className="transition-all duration-500 ease-out cursor-pointer active:scale-[0.97]"
        aria-label={hasFavorited ? 'Remove from favorites' : 'Add to favorites'}
        role="button"
      >
        <path
          d="M10.4107 19.9677C7.58942 17.858 2 13.0348 2 8.69444C2 5.82563 4.10526 3.5 7 3.5C8.5 3.5 10 4 12 6C14 4 15.5 3.5 17 3.5C19.8947 3.5 22 5.82563 22 8.69444C22 13.0348 16.4106 17.858 13.5893 19.9677C12.6399 20.6776 11.3601 20.6776 10.4107 19.9677Z"
          fill={hasFavorited ? FILL_COLOR : 'none'}
          stroke={hasFavorited ? FILL_COLOR : '#78716c'}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  /** ----- Default variant (on dark/image backgrounds) ----- */
  return (
    <svg
      onClick={handleToggle}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="20"
      height="20"
      className="transition-all duration-500 ease-out cursor-pointer active:scale-[0.97]"
      aria-label={hasFavorited ? 'Remove from favorites' : 'Add to favorites'}
      role="button"
    >
      <title>Save</title>
      <path
        d="M10.4107 19.9677C7.58942 17.858 2 13.0348 2 8.69444C2 5.82563 4.10526 3.5 7 3.5C8.5 3.5 10 4 12 6C14 4 15.5 3.5 17 3.5C19.8947 3.5 22 5.82563 22 8.69444C22 13.0348 16.4106 17.858 13.5893 19.9677C12.6399 20.6776 11.3601 20.6776 10.4107 19.9677Z"
        fill={hasFavorited ? 'rgba(255,255,255,0.9)' : 'none'}
        stroke={hasFavorited ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.8)'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default HeartButton;

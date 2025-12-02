'use client';

import React from 'react';
import { SafeEmployee } from '@/app/types';

interface SafeStoreHours {
  dayOfWeek: string;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

interface SmartBadgeWorkerProps {
  employee: SafeEmployee & {
    rating?: number;
    isTrending?: boolean;
    followerCount?: number;
    storeHours?: SafeStoreHours[];
  };
  listingTitle: string;
  rating?: number;
  followerCount?: number;
  onRatingClick?: () => void;
  onTimeClick?: (e?: React.MouseEvent) => void;
  storeHours?: SafeStoreHours[];
  isVerified?: boolean; // Add this to determine when to show blue shadow
}

const SmartBadgeWorker: React.FC<SmartBadgeWorkerProps> = ({
  employee,
  rating = (employee as any)?.rating ?? 4.7,
  onRatingClick,
  onTimeClick,
}) => {

  // Handle clicks
  const handleRatingClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRatingClick?.();
  };

  const handleBookNowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onTimeClick?.(e); // Pass the event to the callback
  };

  return (
    <div className="flex items-center gap-2">
      {/* Rating */}
      <button
        onClick={handleRatingClick}
        className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-white/90 hover:text-white transition-colors"
        type="button"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="12" height="12" className="text-amber-400">
          <path d="M13.7276 3.44418L15.4874 6.99288C15.7274 7.48687 16.3673 7.9607 16.9073 8.05143L20.0969 8.58575C22.1367 8.92853 22.6167 10.4206 21.1468 11.8925L18.6671 14.3927C18.2471 14.8161 18.0172 15.6327 18.1471 16.2175L18.8571 19.3125C19.417 21.7623 18.1271 22.71 15.9774 21.4296L12.9877 19.6452C12.4478 19.3226 11.5579 19.3226 11.0079 19.6452L8.01827 21.4296C5.8785 22.71 4.57865 21.7522 5.13859 19.3125L5.84851 16.2175C5.97849 15.6327 5.74852 14.8161 5.32856 14.3927L2.84884 11.8925C1.389 10.4206 1.85895 8.92853 3.89872 8.58575L7.08837 8.05143C7.61831 7.9607 8.25824 7.48687 8.49821 6.99288L10.258 3.44418C11.2179 1.51861 12.7777 1.51861 13.7276 3.44418Z" fill="currentColor" />
        </svg>
        <span>{Number(rating).toFixed(1)}</span>
      </button>

      <span className="w-px h-4 bg-white/30" />

      {/* Book */}
      <button
        onClick={handleBookNowClick}
        className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-white/90 hover:text-white transition-colors"
        type="button"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
          <path d="M8.62814 12.6736H8.16918C6.68545 12.6736 5.94358 12.6736 5.62736 12.1844C5.31114 11.6953 5.61244 11.0138 6.21504 9.65083L8.02668 5.55323C8.57457 4.314 8.84852 3.69438 9.37997 3.34719C9.91142 3 10.5859 3 11.935 3H14.0244C15.6632 3 16.4826 3 16.7916 3.53535C17.1007 4.0707 16.6942 4.78588 15.8811 6.21623L14.8092 8.10188C14.405 8.81295 14.2029 9.16849 14.2057 9.45952C14.2094 9.83775 14.4105 10.1862 14.7354 10.377C14.9854 10.5239 15.3927 10.5239 16.2074 10.5239C17.2373 10.5239 17.7523 10.5239 18.0205 10.7022C18.3689 10.9338 18.5513 11.3482 18.4874 11.7632C18.4382 12.0826 18.0918 12.4656 17.399 13.2317L11.8639 19.3523C10.7767 20.5545 10.2331 21.1556 9.86807 20.9654C9.50303 20.7751 9.67833 19.9822 10.0289 18.3962L10.7157 15.2896C10.9826 14.082 11.1161 13.4782 10.7951 13.0759C10.4741 12.6736 9.85877 12.6736 8.62814 12.6736Z" />
        </svg>
        <span>Reserve</span>
      </button>
    </div>
  );
};

export default SmartBadgeWorker;
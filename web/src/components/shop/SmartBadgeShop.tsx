'use client';

import React from 'react';

interface SmartBadgeShopProps {
  rating?: number;
  isTrending?: boolean;
  followerCount?: number;
  onRatingClick?: () => void;
  onFollowerClick?: () => void;
}

const SmartBadgeShop: React.FC<SmartBadgeShopProps> = ({
  rating = 5.0,
  onRatingClick,
  onFollowerClick
}) => {
  const handleRatingClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRatingClick?.();
  };

  const handleShopClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFollowerClick?.();
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

      {/* Shop */}
      <button
        onClick={handleShopClick}
        className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-white/90 hover:text-white transition-colors"
        type="button"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
          <path d="M3.06164 15.1933L3.42688 13.1219C3.85856 10.6736 4.0744 9.44952 4.92914 8.72476C5.78389 8 7.01171 8 9.46734 8H14.5327C16.9883 8 18.2161 8 19.0709 8.72476C19.9256 9.44952 20.1414 10.6736 20.5731 13.1219L20.9384 15.1933C21.5357 18.5811 21.8344 20.275 20.9147 21.3875C19.995 22.5 18.2959 22.5 14.8979 22.5H9.1021C5.70406 22.5 4.00504 22.5 3.08533 21.3875C2.16562 20.275 2.4643 18.5811 3.06164 15.1933Z" />
          <path d="M7.5 8L7.66782 5.98618C7.85558 3.73306 9.73907 2 12 2C14.2609 2 16.1444 3.73306 16.3322 5.98618L16.5 8" strokeLinecap="round" />
          <path d="M15 11C14.87 12.4131 13.5657 13.5 12 13.5C10.4343 13.5 9.13002 12.4131 9 11" strokeLinecap="round" />
        </svg>
        <span>Shop</span>
      </button>
    </div>
  );
};

export default SmartBadgeShop;

import React from 'react';

interface SmartBadgePriceProps {
  price?: number;
  rating?: number;
  showPrice?: boolean; // Toggle between price and rating display
  onPriceClick?: () => void;
  onRatingClick?: () => void;
  onBookNowClick?: (e: React.MouseEvent) => void;
  isVerified?: boolean;
  variant?: 'light' | 'dark'; // Support for different backgrounds
}

const SmartBadgePrice: React.FC<SmartBadgePriceProps> = ({
  price,
  rating = 4.7,
  showPrice = false, // Default to showing rating
  onPriceClick,
  onRatingClick,
  onBookNowClick,
  isVerified = true,
  variant = 'light'
}) => {

  // Handle clicks
  const handleLeftClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (showPrice) {
      onPriceClick?.();
    } else {
      onRatingClick?.();
    }
  };

  const handleBookNowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBookNowClick?.(e);
  };

  const formatPrice = (n: number) =>
    Number.isInteger(n) ? `${n}` : `${n.toFixed(2)}`;

  // Styling based on variant - matching MarketSearch button styles
  const containerClasses = variant === 'dark'
    ? "group/rating backdrop-blur-md bg-white/10 hover:bg-blue-400/10 border border-white/40 hover:border-blue-400/60 rounded-lg px-3 py-2 transition-all duration-200"
    : "group/rating bg-gradient-to-br from-white via-white to-gray-50 border border-gray-400 rounded-lg px-3 py-2 hover:!bg-gray-100 hover:bg-none hover:border-gray-500 transition-all duration-500 ease-out";

  const textClasses = variant === 'dark'
    ? "flex items-center text-white text-xs"
    : "flex items-center text-gray-600/90 text-xs";

  const buttonHoverClasses = variant === 'dark'
    ? "group-hover/rating:text-[#60A5FA] transition-colors duration-200 flex items-center gap-1"
    : "group-hover/rating:text-gray-700 transition-colors duration-200 flex items-center gap-1";

  const iconClasses = variant === 'dark'
    ? "text-white"
    : "text-gray-600/90 group-hover/rating:text-gray-700 transition-colors duration-200";

  const bookButtonClasses = variant === 'dark'
    ? "backdrop-blur-md bg-white/10 hover:bg-blue-400/10 border border-white/40 hover:border-blue-400/60 text-white hover:text-[#60A5FA] rounded-lg px-3.5 py-2 transition-all duration-200 text-xs"
    : "bg-gradient-to-br from-white via-white to-gray-50 border border-gray-400 text-gray-600/90 hover:!bg-gray-100 hover:bg-none hover:border-gray-500 hover:text-gray-700 rounded-lg px-3.5 py-2 transition-all duration-500 ease-out text-xs";

  return (
    <div className="flex items-center gap-2">
      {/* Left container - Price or Rating */}
      <div className={containerClasses}>
        <div className={textClasses}>
          <button
            onClick={handleLeftClick}
            className={buttonHoverClasses}
            type="button"
          >
            {showPrice ? (
              // Price display with dollar icon
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="12" height="12" className={iconClasses} fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"></circle>
                  <path d="M15 9.5C15 8.11929 13.8807 7 12.5 7C11.1193 7 10 8.11929 10 9.5C10 10.8807 11.1193 12 12.5 12C13.8807 12 15 13.1193 15 14.5C15 15.8807 13.8807 17 12.5 17C11.1193 17 10 15.8807 10 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path>
                  <path d="M12.5 7V5.5M12.5 18.5V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path>
                </svg>
                {formatPrice(price || 0)}
              </>
            ) : (
              // Rating display with star icon
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="12" height="12" color="currentColor" fill="none">
                  <path d="M13.7276 3.44418L15.4874 6.99288C15.7274 7.48687 16.3673 7.9607 16.9073 8.05143L20.0969 8.58575C22.1367 8.92853 22.6167 10.4206 21.1468 11.8925L18.6671 14.3927C18.2471 14.8161 18.0172 15.6327 18.1471 16.2175L18.8571 19.3125C19.417 21.7623 18.1271 22.71 15.9774 21.4296L12.9877 19.6452C12.4478 19.3226 11.5579 19.3226 11.0079 19.6452L8.01827 21.4296C5.8785 22.71 4.57865 21.7522 5.13859 19.3125L5.84851 16.2175C5.97849 15.6327 5.74852 14.8161 5.32856 14.3927L2.84884 11.8925C1.389 10.4206 1.85895 8.92853 3.89872 8.58575L7.08837 8.05143C7.61831 7.9607 8.25824 7.48687 8.49821 6.99288L10.258 3.44418C11.2179 1.51861 12.7777 1.51861 13.7276 3.44418Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {Number(rating).toFixed(1)}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Book Now button - separate styled button */}
      <button
        onClick={handleBookNowClick}
        className={bookButtonClasses}
        type="button"
      >
        Reserve
      </button>
    </div>
  );
};

export default SmartBadgePrice;
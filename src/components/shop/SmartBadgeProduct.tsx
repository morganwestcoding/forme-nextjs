import React from 'react';
import { Award, TrendingUp, Star } from 'lucide-react';

interface SmartBadgeProductProps {
  rating?: number;
  price: number;
  compareAtPrice?: number | null;
  isFeatured?: boolean;
  isOnSale?: boolean;
  onRatingClick?: () => void;
  onPriceClick?: () => void;
}

const SmartBadgeProduct: React.FC<SmartBadgeProductProps> = ({
  rating = 4.9,
  price,
  compareAtPrice,
  isFeatured = false,
  isOnSale = false,
  onRatingClick,
  onPriceClick
}) => {
  // Smart badge logic for rating
  const getBadgeProps = () => {
    if (isFeatured) {
      return {
        bgColor: 'bg-gradient-to-r from-purple-500/20 to-violet-500/20',
        borderColor: 'border-purple-400/40',
        textColor: 'text-purple-200',
        glowColor: 'shadow-purple-500/20',
        label: 'Featured',
        icon: <TrendingUp className="w-3 h-3" />
      };
    } else if (rating >= 4.5) {
      return {
        bgColor: 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20',
        borderColor: 'border-yellow-400/40',
        textColor: 'text-yellow-200',
        glowColor: 'shadow-yellow-500/20',
        label: 'Top Rated',
        icon: <Award className="w-3 h-3" />
      };
    } else {
      return {
        bgColor: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20',
        borderColor: 'border-blue-400/40',
        textColor: 'text-blue-200',
        glowColor: 'shadow-blue-500/20',
        label: 'Rating',
        icon: <Star className="w-3 h-3" />
      };
    }
  };

  const badgeProps = getBadgeProps();

  // Price badge styling
  const getPriceBadgeProps = () => {
    if (isOnSale) {
      return {
        bgColor: 'bg-gradient-to-r from-red-500/20 to-rose-500/20',
        borderColor: 'border-red-400/40',
        textColor: 'text-red-200',
        glowColor: 'shadow-red-500/20',
        label: 'Sale Price'
      };
    } else {
      return {
        bgColor: 'bg-gradient-to-r from-emerald-500/20 to-green-500/20',
        borderColor: 'border-emerald-400/40',
        textColor: 'text-emerald-200',
        glowColor: 'shadow-emerald-500/20',
        label: 'Price'
      };
    }
  };

  const priceBadgeProps = getPriceBadgeProps();

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 border border-white/30 shadow-xl">
      <div className="flex items-center">
        {/* Rating Section - LEFT */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onRatingClick?.();
          }}
          className="flex-1 flex flex-col items-center py-3.5  hover:bg-white/10 transition-all duration-300 group rounded-l-xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-l-xl"></div>
          <div className={`border rounded-lg px-3 py-1.5 mb-2 group-hover:scale-110 transition-all duration-300 ${badgeProps.bgColor} ${badgeProps.borderColor} ${badgeProps.glowColor} shadow-sm w-24 flex justify-center`}>
            <div className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="12" height="12" className={badgeProps.textColor} fill="none">
                <path d="M18.5202 6.22967C18.8121 7.89634 17.5004 9 17.5004 9C17.5004 9 15.8969 8.437 15.605 6.77033C15.3131 5.10366 16.6248 4 16.6248 4C16.6248 4 18.2284 4.56301 18.5202 6.22967Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                <path d="M20.9271 13.5887C19.5822 14.7178 17.937 14.0892 17.937 14.0892C17.937 14.0892 17.6366 12.3314 18.9815 11.2023C20.3264 10.0732 21.9716 10.7019 21.9716 10.7019C21.9716 10.7019 22.272 12.4596 20.9271 13.5887Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                <path d="M16.7336 19.8262C15.2336 19.2506 15.0001 17.6366 15.0001 17.6366C15.0001 17.6366 16.2666 16.5982 17.7666 17.1738C19.2666 17.7494 19.5001 19.3634 19.5001 19.3634C19.5001 19.3634 18.2336 20.4018 16.7336 19.8262Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                <path d="M15.0001 17.6366C16.4052 16.4358 18.0007 14.0564 18.0007 11.7273C18.0007 10.7628 17.8458 9.84221 17.5645 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                <path d="M5.47999 6.22967C5.18811 7.89634 6.4998 9 6.4998 9C6.4998 9 8.10337 8.437 8.39525 6.77033C8.68713 5.10366 7.37544 4 7.37544 4C7.37544 4 5.77187 4.56301 5.47999 6.22967Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                <path d="M3.07316 13.5887C4.41805 14.7178 6.06329 14.0892 6.06329 14.0892C6.06329 14.0892 6.36364 12.3314 5.01876 11.2023C3.67387 10.0732 2.02863 10.7019 2.02863 10.7019C2.02863 10.7019 1.72828 12.4596 3.07316 13.5887Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                <path d="M7.26663 19.8262C8.76663 19.2506 9.00012 17.6366 9.00012 17.6366C9.00012 17.6366 7.73361 16.5982 6.23361 17.1738C4.73361 17.7494 4.50012 19.3634 4.50012 19.3634C4.50012 19.3634 5.76663 20.4018 7.26663 19.8262Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                <path d="M9.00012 17.6366C7.59501 16.4358 5.99957 14.0564 5.99957 11.7273C5.99957 10.7628 6.15445 9.84221 6.43571 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
              <span className={`text-sm ${badgeProps.textColor}`}>{rating}</span>
            </div>
          </div>
          <div className="text-xs text-white/80 font-medium tracking-wide">{badgeProps.label}</div>
        </button>

        {/* Price Section - RIGHT */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onPriceClick?.();
          }}
          className="flex-1 flex flex-col items-center  py-3.5 hover:bg-white/10 transition-all duration-300 group rounded-r-xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-r-xl"></div>
          <div className={`border rounded-lg px-3 py-1.5 mb-2 group-hover:scale-110 transition-all duration-300 shadow-sm w-24 flex justify-center ${priceBadgeProps.bgColor} ${priceBadgeProps.borderColor} ${priceBadgeProps.glowColor}`}>
            <div className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="12" height="12" className={priceBadgeProps.textColor} fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"></circle>
                <path d="M15 9.5C15 8.11929 13.8807 7 12.5 7C11.1193 7 10 8.11929 10 9.5C10 10.8807 11.1193 12 12.5 12C13.8807 12 15 13.1193 15 14.5C15 15.8807 13.8807 17 12.5 17C11.1193 17 10 15.8807 10 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path>
                <path d="M12.5 7V5.5M12.5 18.5V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path>
              </svg>
              <span className={`text-sm ${priceBadgeProps.textColor}`}>
                {isOnSale && compareAtPrice ? (
                  <span className="flex items-center gap-1">
                    <span className="line-through text-xs opacity-70">${compareAtPrice.toFixed(2)}</span>
                    <span>${price.toFixed(2)}</span>
                  </span>
                ) : (
                  `$${price.toFixed(2)}`
                )}
              </span>
            </div>
          </div>
          <div className="text-xs text-white/80 font-medium tracking-wide">
            {priceBadgeProps.label}
          </div>
        </button>
      </div>
    </div>
  );
};

export default SmartBadgeProduct;
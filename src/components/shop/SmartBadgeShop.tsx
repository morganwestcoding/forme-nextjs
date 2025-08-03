import React from 'react';
import { Award, TrendingUp, Star, Users } from 'lucide-react';

interface SmartBadgeShopProps {
  rating?: number;
  isTrending?: boolean;
  followerCount?: number;
  onRatingClick?: () => void;
  onFollowerClick?: () => void;
}

const SmartBadgeShop: React.FC<SmartBadgeShopProps> = ({
  rating = 4.7,
  isTrending = false,
  followerCount = 0,
  onRatingClick,
  onFollowerClick
}) => {
  // Smart badge logic for rating
  const getBadgeProps = () => {
    if (isTrending) {
      return {
        bgColor: 'bg-gradient-to-r from-purple-500/20 to-violet-500/20',
        borderColor: 'border-purple-400/40',
        textColor: 'text-purple-200',
        glowColor: 'shadow-purple-500/20',
        label: 'Trending',
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

  // Format follower count (e.g., 1.2K, 1.5M)
  const formatFollowerCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

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

        {/* Followers Section - RIGHT */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onFollowerClick?.();
          }}
          className="flex-1 flex flex-col items-center  py-3.5 hover:bg-white/10 transition-all duration-300 group rounded-r-xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-r-xl"></div>
          <div className="border rounded-lg px-3 py-1.5 mb-2 group-hover:scale-110 transition-all duration-300 shadow-sm w-24 flex justify-center bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-400/40 shadow-blue-500/20">
            <div className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="12" height="12" className="text-blue-200" fill="none">
                <path d="M10.4107 19.9677C7.58942 17.858 2 13.0348 2 8.69444C2 5.82563 4.10526 3.5 7 3.5C8.5 3.5 10 4 12 6C14 4 15.5 3.5 17 3.5C19.8947 3.5 22 5.82563 22 8.69444C22 13.0348 16.4106 17.858 13.5893 19.9677C12.6399 20.6776 11.3601 20.6776 10.4107 19.9677Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
              <span className="text-sm text-blue-200">
                {formatFollowerCount(followerCount)}
              </span>
            </div>
          </div>
          <div className="text-xs text-white/80 font-medium tracking-wide">
            Followers
          </div>
        </button>
      </div>
    </div>
  );
};

export default SmartBadgeShop;
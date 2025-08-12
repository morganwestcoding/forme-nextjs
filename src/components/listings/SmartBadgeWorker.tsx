'use client';

import React from 'react';

interface SafeEmployee {
  id: string;
  fullName: string;
  profileImage?: string;
}

interface SmartBadgeWorkerProps {
  employee: SafeEmployee;
  listingTitle: string;
  rating?: number;
  followerCount?: number;
  onRatingClick?: () => void;
  onFollowerClick?: () => void;
}

/** Helpers */
const getInitials = (fullName?: string) => {
  if (!fullName) return 'U';
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    const a = parts[0][0]?.toUpperCase() ?? 'U';
    const b = parts[0][1]?.toUpperCase() ?? '';
    return (a + b).slice(0, 2);
  }
  const first = parts[0][0]?.toUpperCase() ?? '';
  const last = parts[parts.length - 1][0]?.toUpperCase() ?? '';
  return (first + last) || 'U';
};

const stringToColor = (seed: string, s = 70, l = 45) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    // eslint-disable-next-line no-bitwise
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, ${s}%, ${l}%)`;
};

const SmartBadgeWorker: React.FC<SmartBadgeWorkerProps> = ({
  employee,
  listingTitle,
  rating = 4.8,
  followerCount = 847,
  onRatingClick,
  onFollowerClick,
}) => {
  const getRatingProps = () => {
    if (rating >= 4.8) {
      return {
        bgColor: 'bg-gradient-to-r from-indigo-500/20 to-violet-500/20',
        borderColor: 'border-indigo-400/40',
        textColor: 'text-indigo-200',
        glowColor: 'shadow-indigo-500/20',
        message: `${rating}`
      };
    } else if (rating >= 4.5) {
      return {
        bgColor: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20',
        borderColor: 'border-blue-400/40',
        textColor: 'text-blue-200',
        glowColor: 'shadow-blue-500/20',
        message: `${rating}`
      };
    } else if (rating >= 4.0) {
      return {
        bgColor: 'bg-gradient-to-r from-gray-500/20 to-slate-500/20',
        borderColor: 'border-gray-400/40',
        textColor: 'text-gray-200',
        glowColor: 'shadow-gray-500/20',
        message: `${rating}`
      };
    } else {
      return {
        bgColor: 'bg-gradient-to-r from-indigo-500/20 to-violet-500/20',
        borderColor: 'border-indigo-400/40',
        textColor: 'text-indigo-200',
        glowColor: 'shadow-indigo-500/20',
        message: 'New'
      };
    }
  };

  const formatFollowerCount = (count: number): string => {
    if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
    if (count >= 1_000) return `${(count / 1_000).toFixed(1)}k`;
    return count.toString();
  };

  const ratingProps = getRatingProps();

  // Initials avatar bits
  const initials = getInitials(employee.fullName);
  const avatarBg = stringToColor(`${employee.id}${employee.fullName}`);

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-1 border border-white/30 shadow-xl">
      {/* Profile Section */}
      <div className="flex items-center gap-3 mb-3 px-3 pt-3">
        {/* REPLACED profile <Image/> with initials circle */}
        <div className="relative w-16 h-16 flex-shrink-0">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-white font-semibold shadow-lg border-2 border-white/50"
            style={{ backgroundColor: avatarBg }}
            aria-label="Employee initials"
            title={employee.fullName}
          >
            {initials}
          </div>
        </div>

        {/* Name and title */}
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h1 className="text-lg font-medium text-white drop-shadow-lg">
              {employee.fullName}
            </h1>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="#60A5FA" className="text-white">
              <path d="M18.9905 19H19M18.9905 19C18.3678 19.6175 17.2393 19.4637 16.4479 19.4637C15.4765 19.4637 15.0087 19.6537 14.3154 20.347C13.7251 20.9374 12.9337 22 12 22C11.0663 22 10.2749 20.9374 9.68457 20.347C8.99128 19.6537 8.52349 19.4637 7.55206 19.4637C6.76068 19.4637 5.63218 19.6175 5.00949 19C4.38181 18.3776 4.53628 17.2444 4.53628 16.4479C4.53628 15.4414 4.31616 14.9786 3.59938 14.2618C2.53314 13.1956 2.00002 12.6624 2 12C2.00001 11.3375 2.53312 10.8044 3.59935 9.73817C4.2392 9.09832 4.53628 8.46428 4.53628 7.55206C4.53628 6.76065 4.38249 5.63214 5 5.00944C5.62243 4.38178 6.7556 4.53626 7.55208 4.53626C8.46427 4.53626 9.09832 4.2392 9.73815 3.59937C10.8044 2.53312 11.3375 2 12 2C12.6625 2 13.1956 2.53312 14.2618 3.59937C14.9015 4.23907 15.5355 4.53626 16.4479 4.53626C17.2393 4.53626 18.3679 4.38247 18.9906 5C19.6182 5.62243 19.4637 6.75559 19.4637 7.55206C19.4637 8.55858 19.6839 9.02137 20.4006 9.73817C21.4669 10.8044 22 11.3375 22 12C22 12.6624 21.4669 13.1956 20.4006 14.2618C19.6838 14.9786 19.4637 15.4414 19.4637 16.4479C19.4637 17.2444 19.6182 18.3776 18.9905 19Z" stroke="currentColor" strokeWidth="1.5" />
              <path d="M9 12.8929L10.8 14.5L15 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="text-xs text-white/80 font-light drop-shadow-md">
            Specialist at {listingTitle}
          </p>
        </div>
      </div>

      {/* Badge Section */}
      <div className="flex items-center p-1">
        {/* Rating Section - LEFT */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRatingClick?.();
          }}
          className="flex-1 flex flex-col items-center py-3.5 hover:bg-white/10 transition-all duration-300 group rounded-l-xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-l-xl"></div>
          <div className={`border rounded-lg px-3 py-1.5 mb-2 group-hover:scale-110 transition-all duration-300 ${ratingProps.bgColor} ${ratingProps.borderColor}  shadow-sm w-24 flex justify-center`}>
            <div className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="12" height="12" className={ratingProps.textColor} fill="none">
                <path d="M18.5202 6.22967C18.8121 7.89634 17.5004 9 17.5004 9C17.5004 9 15.8969 8.437 15.605 6.77033C15.3131 5.10366 16.6248 4 16.6248 4C16.6248 4 18.2284 4.56301 18.5202 6.22967Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                <path d="M20.9271 13.5887C19.5822 14.7178 17.937 14.0892 17.937 14.0892C17.937 14.0892 17.6366 12.3314 18.9815 11.2023C20.3264 10.0732 21.9716 10.7019 21.9716 10.7019C21.9716 10.7019 22.272 12.4596 20.9271 13.5887Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                <path d="M16.7336 19.8262C15.2336 19.2506 15.0001 17.6366 15.0001 17.6366C15.0001 17.6366 16.2666 16.5982 17.7666 17.1738C19.2666 17.7494 19.5001 19.3634 19.5001 19.3634C19.5001 19.3634 18.2336 20.4018 16.7336 19.8262Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                <path d="M15.0001 17.6366C16.4052 16.4358 18.0007 14.0564 18.0007 11.7273C18.0007 10.7628 17.8458 9.84221 17.5645 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                <path d="M5.47999 6.22967C5.18811 7.89634 6.4998 9 6.4998 9C6.4998 9 8.10337 8.437 8.39525 6.77033C8.68713 5.10366 7.37544 4 7.37544 4C7.37544 4 5.77187 4.56301 5.47999 6.22967Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                <path d="M3.07316 13.5887C4.41805 14.7178 6.06329 14.0892 6.06329 14.0892C6.06329 14.0892 6.36364 12.3314 5.01876 11.2023C3.67387 10.0732 2.02863 10.7019 2.02863 10.7019C2.02863 10.7019 1.72828 12.4596 3.07316 13.5887Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                <path d="M7.26663 19.8262C8.76663 19.2506 9.00012 17.6366 9.00012 17.6366C9.00012 17.6366 7.73361 16.5982 6.23361 17.1738C4.73361 17.7494 4.50012 19.3634 4.50012 19.3634C4.50012 19.3634 5.76663 20.4018 7.26663 19.8262Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                <path d="M9.00012 17.6366C7.59501 16.4358 5.99957 14.0564 5.99957 11.7273C5.99957 10.7628 6.15445 9.84221 6.43571 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
              <span className={`text-sm ${ratingProps.textColor}`}>{ratingProps.message}</span>
            </div>
          </div>
          <div className="text-xs text-white/80 font-medium tracking-wide">Rating</div>
        </button>

        {/* Followers Section - RIGHT */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFollowerClick?.();
          }}
          className="flex-1 flex flex-col items-center py-3.5 hover:bg-white/10 transition-all duration-300 group rounded-r-xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-r-xl"></div>
          <div className="bg-gradient-to-r from-rose-500/20 to-pink-500/20 border border-rose-400/40 shadow-rose-500/20 shadow-sm rounded-lg px-3 py-1.5 mb-2 group-hover:scale-110 transition-all duration-300 w-24 flex justify-center">
            <div className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="12" height="12" className="text-rose-200" fill="none">
                <path d="M16 4C18.175 4.01211 19.3529 4.10856 20.1213 4.87694C21 5.75562 21 7.16983 21 9.99826V15.9983C21 18.8267 21 20.2409 20.1213 21.1196C19.2426 21.9983 17.8284 21.9983 15 21.9983H9C6.17157 21.9983 4.75736 21.9983 3.87868 21.1196C3 20.2409 3 18.8267 3 15.9983V9.99826C3 7.16983 3 5.75562 3.87868 4.87694C4.64706 4.10856 5.82497 4.01211 8 4" stroke="currentColor" strokeWidth="1.5"></path>
                <path d="M8 3.5A1.5 1.5 0 0 1 9.5 2H14.5A1.5 1.5 0 0 1 16 3.5V4.5A1.5 1.5 0 0 1 14.5 6H9.5A1.5 1.5 0 0 1 8 4.5V3.5Z" stroke="currentColor" strokeWidth="1.5"></path>
                <path d="M12 11H16M12 16H16M8 11H8.00635M8 16H8.00635" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path>
              </svg>
              <span className="text-sm text-rose-200">{formatFollowerCount(followerCount)}</span>
            </div>
          </div>
          <div className="text-xs text-white/80 font-medium tracking-wide">Followers</div>
        </button>
      </div>
    </div>
  );
};

export default SmartBadgeWorker;

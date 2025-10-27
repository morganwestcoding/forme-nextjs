'use client';

import React, { useState, useEffect } from 'react';
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
  onTimeClick?: () => void;
  storeHours?: SafeStoreHours[];
  isVerified?: boolean; // Add this to determine when to show blue shadow
}

const SmartBadgeWorker: React.FC<SmartBadgeWorkerProps> = ({
  employee,
  listingTitle,
  rating = (employee as any)?.rating ?? 4.7,
  followerCount = (employee as any)?.followerCount ?? 847,
  onRatingClick,
  onTimeClick,
  storeHours = (employee as any)?.storeHours ?? [
    { dayOfWeek: 'Monday', openTime: '09:00', closeTime: '21:00', isClosed: false },
    { dayOfWeek: 'Tuesday', openTime: '09:00', closeTime: '21:00', isClosed: false },
    { dayOfWeek: 'Wednesday', openTime: '09:00', closeTime: '21:00', isClosed: false },
    { dayOfWeek: 'Thursday', openTime: '09:00', closeTime: '21:00', isClosed: false },
    { dayOfWeek: 'Friday', openTime: '09:00', closeTime: '22:00', isClosed: false },
    { dayOfWeek: 'Saturday', openTime: '08:00', closeTime: '22:00', isClosed: false },
    { dayOfWeek: 'Sunday', openTime: '10:00', closeTime: '20:00', isClosed: false }
  ],
  isVerified = true // Default to true for demo - you'd pass this from your data
}) => {
  const [, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((v) => v + 1), 60_000);
    return () => clearInterval(t);
  }, []);

  const isTrending = (employee as any)?.isTrending ?? false;

  /** ----- Time status logic (unchanged) ----- */
  const getTimeStatus = () => {
    const now = new Date();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = dayNames[now.getDay()];
    const hhmm = now.toTimeString().slice(0, 5); // HH:MM

    const today = storeHours.find((h: SafeStoreHours) => h.dayOfWeek.toLowerCase() === dayOfWeek.toLowerCase());

    const to24 = (timeStr: string) => {
      if (/[ap]m/i.test(timeStr)) {
        const [timePart] = timeStr.split(/\s+/);
        const [hh, mm] = timePart.split(':');
        const h = parseInt(hh, 10);
        const isPM = /pm/i.test(timeStr);
        const h24 = isPM ? (h === 12 ? 12 : h + 12) : (h === 12 ? 0 : h);
        return `${String(h24).padStart(2, '0')}:${mm}`;
      }
      return timeStr;
    };

    const inRange = (curr: string, open: string, close: string) => {
      const c = to24(curr), o = to24(open), cl = to24(close);
      return c >= o && c < cl;
    };

    if (!today || today.isClosed) return { message: 'Closed', color: 'red' as const };

    const { openTime, closeTime } = today;
    const open = openTime, close = closeTime;

    const toMin = (t: string) => {
      const [H, M] = to24(t).split(':');
      return parseInt(H, 10) * 60 + parseInt(M, 10);
    };

    const currMin = toMin(hhmm);
    if (inRange(hhmm, open, close)) {
      const minsLeft = toMin(close) - currMin;
      if (minsLeft <= 30) return { message: 'Closing', color: 'orange' as const };
      if (minsLeft <= 120) return { message: 'Closing', color: 'green' as const };
      return { message: 'Open', color: 'green' as const };
    }
    if (currMin < toMin(open)) return { message: 'Soon', color: 'orange' as const };
    return { message: 'Closed', color: 'red' as const };
  };

  // Handle clicks
  const handleRatingClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRatingClick?.();
  };

  const handleBookNowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onTimeClick?.(); // Reuse the existing callback for book now action
  };

  return (
    <div className="flex items-center gap-2">
      {/* Rating container - keep existing styling */}
      <div className="border border-gray-300 rounded-lg px-3 py-2 bg-gray-50">
        <div 
          className="flex items-center  text-xs"
        >
          <button 
            onClick={handleRatingClick}
            className="hover:text-gray-900 text-gray-500 transition-colors duration-200 flex items-center gap-1" 
            type="button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" color="currentColor" fill="none">
    <path d="M11.6686 5.21225C11.8066 4.92946 12.1934 4.92947 12.3314 5.21225L13.1449 6.87978C13.1989 6.99046 13.3003 7.06749 13.4178 7.08703L15.1862 7.38122C15.4859 7.43108 15.6054 7.81473 15.391 8.0392L14.125 9.36513C14.0412 9.45297 14.0025 9.57736 14.021 9.69991L14.3 11.5504C14.3473 11.8638 14.0345 12.101 13.7638 11.957L12.1688 11.1083C12.0628 11.0518 11.9372 11.0518 11.8312 11.1083L10.2362 11.957C9.96554 12.101 9.65271 11.8638 9.69996 11.5504L9.979 9.69991C9.99748 9.57736 9.95882 9.45297 9.87495 9.36513L8.60896 8.0392C8.39464 7.81473 8.51408 7.43108 8.8138 7.38122L10.5822 7.08703C10.6997 7.06749 10.8011 6.99046 10.8551 6.87978L11.6686 5.21225Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M19 9C19 12.866 15.866 16 12 16C8.13401 16 5 12.866 5 9C5 5.13401 8.13401 2 12 2C15.866 2 19 5.13401 19 9Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M13 16.3424L14.6264 20.6513C14.9541 21.5195 15.118 21.9536 15.403 22C15.6887 21.9578 16.0387 21.4804 16.3808 20.6172C16.6258 19.9991 16.7482 19.6901 17.0005 19.5235C17.0779 19.4724 17.1625 19.432 17.252 19.4035C17.5436 19.3108 17.879 19.4015 18.5497 19.5828C19.2669 19.7767 19.7651 19.7226 19.9618 19.5828C20.0197 19.5417 19.9618 19.5797 19.9618 19.5797C20.0776 19.3743 19.9213 19.0539 19.6088 18.4131L17.4561 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M11 16.3421L9.3736 20.6503C9.0459 21.5183 8.72171 21.9536 8.43671 22C8.15097 21.9578 7.97992 21.5263 7.63781 20.6632C7.39287 20.0453 7.25175 19.6893 6.99948 19.5226C6.92213 19.4715 6.83745 19.4312 6.74803 19.4027C6.45638 19.31 6.12101 19.4007 5.45027 19.582C4.73308 19.7758 4.2349 19.7186 4.03815 19.5788C3.92237 19.3735 4.07866 19.0531 4.39123 18.4124L6.54387 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
            {Number(rating).toFixed(1)}
          </button>
        </div>
      </div>

      {/* Book Now button - separate styled button */}
      <button 
        onClick={handleBookNowClick}
        className="border border-gray-300 text-gray-500 rounded-lg px-3 py-2 bg-gray-50 hover:bg-[#60A5FA] transition-colors duration-200 text-xs"
        type="button"
      >
        Reserve
      </button>
    </div>
  );
};

export default SmartBadgeWorker;
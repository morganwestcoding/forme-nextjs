'use client';

import React, { useState, useEffect } from 'react';

interface SafeStoreHours {
  dayOfWeek: string;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

interface SmartBadgeListingProps {
  rating?: number;
  storeHours?: SafeStoreHours[];
  onRatingClick?: () => void;
  onTimeClick?: () => void;
}

const SmartBadgeListing: React.FC<SmartBadgeListingProps> = ({
  rating = 4.8,
  storeHours = [
    { dayOfWeek: 'Monday', openTime: '09:00', closeTime: '21:00', isClosed: false },
    { dayOfWeek: 'Tuesday', openTime: '09:00', closeTime: '21:00', isClosed: false },
    { dayOfWeek: 'Wednesday', openTime: '09:00', closeTime: '21:00', isClosed: false },
    { dayOfWeek: 'Thursday', openTime: '09:00', closeTime: '21:00', isClosed: false },
    { dayOfWeek: 'Friday', openTime: '09:00', closeTime: '22:00', isClosed: false },
    { dayOfWeek: 'Saturday', openTime: '08:00', closeTime: '22:00', isClosed: false },
    { dayOfWeek: 'Sunday', openTime: '10:00', closeTime: '20:00', isClosed: false }
  ],
  onRatingClick,
  onTimeClick,
}) => {
  const [, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((v) => v + 1), 60_000);
    return () => clearInterval(t);
  }, []);

  /** ----- Time status logic ----- */
  const getTimeStatus = () => {
    const now = new Date();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = dayNames[now.getDay()];
    const hhmm = now.toTimeString().slice(0, 5);

    const today = storeHours.find(h => h.dayOfWeek.toLowerCase() === dayOfWeek.toLowerCase());

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

    const toMin = (t: string) => {
      const [H, M] = to24(t).split(':');
      return parseInt(H, 10) * 60 + parseInt(M, 10);
    };

    const currMin = toMin(hhmm);
    if (inRange(hhmm, openTime, closeTime)) {
      const minsLeft = toMin(closeTime) - currMin;
      if (minsLeft <= 30) return { message: 'Closing Soon', color: 'orange' as const };
      if (minsLeft <= 120) return { message: 'Closing Soon', color: 'green' as const };
      return { message: 'Open', color: 'green' as const };
    }
    if (currMin < toMin(openTime)) return { message: 'Opening Soon', color: 'orange' as const };
    return { message: 'Closed', color: 'red' as const };
  };

  const timeStatus = getTimeStatus();

  /** ----- Visual props ----- */
  const getRatingTheme = () => {
    if (rating >= 4.5) {
      return {
        bg: 'bg-amber-100/60',
        border: 'border-amber-200/40',
        text: 'text-amber-700',
        hover: 'hover:bg-amber-100/80',
      };
    }
    if (rating >= 4.0) {
      return {
        bg: 'bg-emerald-100/60',
        border: 'border-emerald-200/40',
        text: 'text-emerald-700',
        hover: 'hover:bg-emerald-100/80',
      };
    }
    return {
      bg: 'bg-blue-100/60',
      border: 'border-blue-200/40',
      text: 'text-blue-700',
      hover: 'hover:bg-blue-100/80',
    };
  };

  const ratingTheme = getRatingTheme();

  const getTimeTheme = () => {
    if (timeStatus.color === 'green') {
      return {
        bg: 'bg-emerald-100/60',
        border: 'border-emerald-200/40',
        text: 'text-emerald-700',
        hover: 'hover:bg-emerald-100/80',
      };
    }
    if (timeStatus.color === 'orange') {
      return {
        bg: 'bg-orange-100/60',
        border: 'border-orange-200/40',
        text: 'text-orange-700',
        hover: 'hover:bg-orange-100/80',
      };
    }
    return {
      bg: 'bg-rose-100/60',
      border: 'border-rose-200/40',
      text: 'text-rose-700',
      hover: 'hover:bg-rose-100/80',
    };
  };

  const timeTheme = getTimeTheme();

  const pillBase =
    'backdrop-blur-sm rounded-md py-1.5 text-xs font-medium px-3.5 text-center ' +
    'transition-all duration-200 cursor-pointer hover:scale-105';

  return (
    <div className="flex items-center gap-2">
      {/* Rating pill with sparkle icon */}
      <button
        type="button"
        aria-label={`Rating ${Number(rating).toFixed(1)} stars`}
        onClick={(e) => { e.stopPropagation(); onRatingClick?.(); }}
        className="group p-0"
      >
        <div
          className={[
            pillBase,
            'w-16',
            ratingTheme.bg,
            `border ${ratingTheme.border}`,
            ratingTheme.text,
            ratingTheme.hover,
          ].join(' ')}
          title={`Rating ${Number(rating).toFixed(1)} stars`}
        >
          <div className="flex items-center justify-center gap-1">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              width="16" 
              height="16" 
              fill="none"
              className={`${ratingTheme.text} flex-shrink-0`}
            >
              <path 
                d="M3 12C7.5 12 12 7.5 12 3C12 7.5 16.5 12 21 12C16.5 12 12 16.5 12 21C12 16.5 7.5 12 3 12Z" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinejoin="round"
              />
              <path 
                d="M2 19.5C2.83333 19.5 4.5 17.8333 4.5 17C4.5 17.8333 6.16667 19.5 7 19.5C6.16667 19.5 4.5 21.1667 4.5 22C4.5 21.1667 2.83333 19.5 2 19.5Z" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinejoin="round"
              />
              <path 
                d="M16 5C17 5 19 3 19 2C19 3 21 5 22 5C21 5 19 7 19 8C19 7 17 5 16 5Z" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinejoin="round"
              />
            </svg>
            <span className="tabular-nums font-semibold">{Number(rating).toFixed(1)}</span>
          </div>
        </div>
      </button>

      {/* Time status pill */}
      <button
        type="button"
        aria-label="Time status"
        onClick={(e) => { e.stopPropagation(); onTimeClick?.(); }}
        className="group p-0"
      >
        <div
          className={[
            pillBase,
            'min-w-20',
            timeTheme.bg,
            `border ${timeTheme.border}`,
            timeTheme.text,
            timeTheme.hover,
          ].join(' ')}
          title={`Status: ${timeStatus.message}`}
        >
          <span className="tabular-nums font-semibold">{timeStatus.message}</span>
        </div>
      </button>
    </div>
  );
};

export default SmartBadgeListing;
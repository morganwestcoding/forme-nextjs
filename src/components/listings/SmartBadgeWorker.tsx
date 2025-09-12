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
  ]
}) => {
  const [, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((v) => v + 1), 60_000);
    return () => clearInterval(t);
  }, []);

  const isTrending = (employee as any)?.isTrending ?? false;

  /** ----- Time status logic (copied from SmartBadgeRating) ----- */
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

  const timeStatus = getTimeStatus();

  /** ----- Visual props (white background optimized) ----- */
  const getRatingTheme = () => {
    if (isTrending) {
      return {
        bg: 'bg-violet-100/60',
        border: 'border-violet-200/40',
        text: 'text-violet-700',
        dot: 'bg-violet-500',
        hover: 'hover:bg-violet-100/80',
      };
    }
    if (rating >= 4.5) {
      return {
        bg: 'bg-amber-100/60',
        border: 'border-amber-200/40',
        text: 'text-amber-700',
        dot: 'bg-amber-500',
        hover: 'hover:bg-amber-100/80',
      };
    }
    return {
      bg: 'bg-blue-100/60',
      border: 'border-blue-200/40',
      text: 'text-blue-700',
      dot: 'bg-blue-500',
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
        dot: 'bg-emerald-500',
        hover: 'hover:bg-emerald-100/80',
      };
    }
    if (timeStatus.color === 'orange') {
      return {
        bg: 'bg-orange-100/60',
        border: 'border-orange-200/40',
        text: 'text-orange-700',
        dot: 'bg-orange-500',
        hover: 'hover:bg-orange-100/80',
      };
    }
    return {
      bg: 'bg-rose-100/60',
      border: 'border-rose-200/40',
      text: 'text-rose-700',
      dot: 'bg-rose-500',
      hover: 'hover:bg-rose-100/80',
    };
  };

  const timeTheme = getTimeTheme();

  const pillBase =
    'backdrop-blur-sm rounded-md py-1.5 text-xs font-medium px-3.5 text-center ' +
    'transition-all duration-200 cursor-pointer hover:scale-105';

  return (
    <div className="flex items-center gap-2">
      {/* Rating pill - smaller width */}
      <button
        type="button"
        aria-label="Rating"
        onClick={(e) => { e.stopPropagation(); onRatingClick?.(); }}
        className="group p-0"
      >
        <div
          className={[
            pillBase,
            'w-14',
            ratingTheme.bg,
            `border ${ratingTheme.border}`,
            ratingTheme.text,
            ratingTheme.hover,
          ].join(' ')}
          title={`Rating ${Number(rating).toFixed(1)}`}
        >
          <div className="flex items-center justify-center gap-1">
            <span className="tabular-nums font-semibold">{Number(rating).toFixed(1)}</span>
          </div>
        </div>
      </button>

      {/* Time status pill - larger width */}
      <button
        type="button"
        aria-label="Time status"
        onClick={(e) => { e.stopPropagation(); onTimeClick?.(); }}
        className="group p-0"
      >
        <div
          className={[
            pillBase,
            'w-20',
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

export default SmartBadgeWorker;
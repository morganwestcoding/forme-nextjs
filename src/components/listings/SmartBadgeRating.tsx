'use client';

import React, { useState, useEffect } from 'react';

interface SafeStoreHours {
  dayOfWeek: string;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

interface SmartBadgeRatingProps {
  rating?: number;
  isTrending?: boolean;
  onRatingClick?: () => void;
  onTimeClick?: () => void;
  storeHours?: SafeStoreHours[];
  isVerified?: boolean;
}

const SmartBadgeRating: React.FC<SmartBadgeRatingProps> = ({
  rating = 4.7,
  isTrending = false,
  onRatingClick,
  onTimeClick,
  storeHours = [
    { dayOfWeek: 'Monday', openTime: '09:00', closeTime: '21:00', isClosed: false },
    { dayOfWeek: 'Tuesday', openTime: '09:00', closeTime: '21:00', isClosed: false },
    { dayOfWeek: 'Wednesday', openTime: '09:00', closeTime: '21:00', isClosed: false },
    { dayOfWeek: 'Thursday', openTime: '09:00', closeTime: '21:00', isClosed: false },
    { dayOfWeek: 'Friday', openTime: '09:00', closeTime: '22:00', isClosed: false },
    { dayOfWeek: 'Saturday', openTime: '08:00', closeTime: '22:00', isClosed: false },
    { dayOfWeek: 'Sunday', openTime: '10:00', closeTime: '20:00', isClosed: false }
  ],
  isVerified = true
}) => {
  const [, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick((v) => v + 1), 60_000);
    return () => clearInterval(t);
  }, []);

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
    const open = openTime, close = closeTime;

    const toMin = (t: string) => {
      const [H, M] = to24(t).split(':');
      return parseInt(H, 10) * 60 + parseInt(M, 10);
    };

    const currMin = toMin(hhmm);
    if (inRange(hhmm, open, close)) {
      const minsLeft = toMin(close) - currMin;
      if (minsLeft <= 120) return { message: 'Closing', color: 'orange' as const };
      return { message: 'Open', color: 'green' as const };
    }
    if (currMin < toMin(open)) return { message: 'Soon', color: 'orange' as const };
    return { message: 'Closed', color: 'red' as const };
  };

  const timeStatus = getTimeStatus();

  const getStatusColor = (color: string) => {
    switch (color) {
      case 'green': return 'text-emerald-400';
      case 'orange': return 'text-amber-400';
      case 'red': return 'text-rose-400';
      default: return 'text-white/70';
    }
  };

  const getStatusBackground = (color: string) => {
    switch (color) {
      case 'green': return 'bg-gray-50/10 hover:bg-emerald-400/10';
      case 'orange': return 'bg-gray-50/10 hover:bg-amber-400/10';
      case 'red': return 'bg-gray-50/10 hover:bg-rose-400/10';
      default: return 'bg-gray-50/10 hover:bg-white/10';
    }
  };

  const getStatusBorder = (color: string) => {
    switch (color) {
      case 'green': return 'border border-white/40 hover:border-emerald-400/50';
      case 'orange': return 'border border-white/40 hover:border-amber-400/50';
      case 'red': return 'border border-white/40 hover:border-rose-400/50';
      default: return 'border border-white/40';
    }
  };

  const handleRatingClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRatingClick?.();
  };

  const handleTimeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onTimeClick?.();
  };

  return (
    <div className="flex items-center gap-2">
      {/* Rating Button */}
      <button
        onClick={handleRatingClick}
        className="group/rating rounded-lg px-3 py-2 backdrop-blur-sm bg-gray-50/10 hover:bg-blue-400/10 border border-white/40 hover:border-blue-400/60 transition-all duration-200"
        type="button"
      >
        <div className="flex items-center text-white group-hover/rating:text-[#60A5FA] text-xs gap-1 transition-all duration-200">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="12" height="12" color="currentColor" fill="none" className="flex-shrink-0">
            <path d="M13.7276 3.44418L15.4874 6.99288C15.7274 7.48687 16.3673 7.9607 16.9073 8.05143L20.0969 8.58575C22.1367 8.92853 22.6167 10.4206 21.1468 11.8925L18.6671 14.3927C18.2471 14.8161 18.0172 15.6327 18.1471 16.2175L18.8571 19.3125C19.417 21.7623 18.1271 22.71 15.9774 21.4296L12.9877 19.6452C12.4478 19.3226 11.5579 19.3226 11.0079 19.6452L8.01827 21.4296C5.8785 22.71 4.57865 21.7522 5.13859 19.3125L5.84851 16.2175C5.97849 15.6327 5.74852 14.8161 5.32856 14.3927L2.84884 11.8925C1.389 10.4206 1.85895 8.92853 3.89872 8.58575L7.08837 8.05143C7.61831 7.9607 8.25824 7.48687 8.49821 6.99288L10.258 3.44418C11.2179 1.51861 12.7777 1.51861 13.7276 3.44418Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <span>{rating}</span>
        </div>
      </button>

      {/* Time Status Button */}
      <button
        onClick={handleTimeClick}
        className={`rounded-lg py-2 px-3 backdrop-blur-sm transition-all duration-200 ${getStatusBackground(timeStatus.color)} ${getStatusBorder(timeStatus.color)}`}
        type="button"
      >
        <div className="flex items-center justify-center">
          <span className={`text-xs ${getStatusColor(timeStatus.color)} hover:brightness-110 transition-all duration-200`}>
            {timeStatus.message}
          </span>
        </div>
      </button>
    </div>
  );
};

export default SmartBadgeRating;
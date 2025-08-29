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
  ]
}) => {
  const [, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((v) => v + 1), 60_000);
    return () => clearInterval(t);
  }, []);

  /** ----- Time status (unchanged logic) ----- */
  const getTimeStatus = () => {
    const now = new Date();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = dayNames[now.getDay()];
    const hhmm = now.toTimeString().slice(0, 5); // HH:MM

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
      if (minsLeft <= 30) return { message: 'Closing', color: 'orange' as const };
      if (minsLeft <= 120) return { message: 'Closing', color: 'green' as const };
      return { message: 'Open', color: 'green' as const };
    }
    if (currMin < toMin(open)) return { message: 'Soon', color: 'orange' as const };
    return { message: 'Closed', color: 'red' as const };
  };

  const timeStatus = getTimeStatus();

  /** ----- Visual props (same gradients, just no icons) ----- */
  const getRatingVisual = () => {
    if (isTrending) {
      return {
        bg: 'bg-gradient-to-r from-purple-500/20 to-violet-500/20',
        border: 'border-purple-400/40',
        shadow: 'shadow-purple-500/20',
        text: 'text-purple-200',
        dot: 'bg-purple-300',
      };
    } else if (rating >= 4.5) {
      return {
        bg: 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20',
        border: 'border-yellow-400/40',
        shadow: 'shadow-yellow-500/20',
        text: 'text-yellow-200',
        dot: 'bg-amber-300',
      };
    } else {
      return {
        bg: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20',
        border: 'border-blue-400/40',
        shadow: 'shadow-blue-500/20',
        text: 'text-blue-200',
        dot: 'bg-cyan-300',
      };
    }
  };

  const ratingV = getRatingVisual();

  const timeWrap =
    timeStatus.color === 'green'
      ? 'bg-gradient-to-r from-lime-500/20 to-green-600/20 border-lime-400/40 shadow-lime-500/20'
      : timeStatus.color === 'orange'
      ? 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 border-orange-400/40 shadow-orange-500/20'
      : 'bg-gradient-to-r from-red-500/20 to-rose-500/20 border-red-400/40 shadow-red-500/20';

  const timeText =
    timeStatus.color === 'green'
      ? 'text-lime-200'
      : timeStatus.color === 'orange'
      ? 'text-orange-200'
      : 'text-red-200';

  const timeDot =
    timeStatus.color === 'green'
      ? 'bg-lime-300'
      : timeStatus.color === 'orange'
      ? 'bg-amber-300'
      : 'bg-rose-300';

  const pillBase =
    'border rounded-md px-2 py-1 group-hover:scale-105 transition-all duration-300 shadow-sm ' +
    'inline-flex items-center justify-center gap-1 w-20';

  return (
    <div className="flex items-center gap-2">
      {/* Rating pill — circle + number (no icon) */}
      <button
        onClick={(e) => { e.stopPropagation(); onRatingClick?.(); }}
        className="inline-flex rounded-xl hover:bg-white/10 transition-all duration-300 group p-0"
        type="button"
        aria-label="Rating"
      >
        <div className={`${pillBase} ${ratingV.bg} ${ratingV.border} ${ratingV.shadow}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${ratingV.dot}`} />
          <span className={`text-xs ${ratingV.text}`}>{rating}</span>
        </div>
      </button>

      {/* Time pill — circle + status (no icon) */}
      <button
        onClick={(e) => { e.stopPropagation(); onTimeClick?.(); }}
        className="inline-flex rounded-xl hover:bg-white/10 transition-all duration-300 group p-0"
        type="button"
        aria-label="Time status"
      >
        <div className={`${pillBase} ${timeWrap}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${timeDot}`} />
          <span className={`text-xs ${timeText}`}>{timeStatus.message}</span>
        </div>
      </button>
    </div>
  );
};

export default SmartBadgeRating;

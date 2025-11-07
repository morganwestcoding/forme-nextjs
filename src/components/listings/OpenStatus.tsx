'use client';

import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { SafeStoreHours } from '@/app/types';

interface OpenStatusProps {
  storeHours: SafeStoreHours[];
  className?: string;
}

const OpenStatus: React.FC<OpenStatusProps> = ({ storeHours, className = '' }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [displayText, setDisplayText] = useState<string>('');

  useEffect(() => {
    const checkOpenStatus = () => {
      const now = new Date();
      const dayOfWeek = format(now, 'EEEE');
      const currentTime = format(now, 'HH:mm');

      const todayHours = storeHours.find(hours => hours.dayOfWeek.toLowerCase() === dayOfWeek.toLowerCase());

      if (!todayHours || todayHours.isClosed) {
        setIsOpen(false);
        setDisplayText(findNextOpenTime(dayOfWeek));
        return;
      }

      const openTime = formatTime(todayHours.openTime);
      const closeTime = formatTime(todayHours.closeTime);
      const isCurrentlyOpen = isTimeInRange(currentTime, todayHours.openTime, todayHours.closeTime);
      
      setIsOpen(isCurrentlyOpen);
      setDisplayText(isCurrentlyOpen ? `${openTime} - ${closeTime}` : findNextOpenTime(dayOfWeek));
    };

    const findNextOpenTime = (currentDayOfWeek: string): string => {
      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      let currentIndex = daysOfWeek.findIndex(day => day.toLowerCase() === currentDayOfWeek.toLowerCase());
      
      for (let i = 0; i < 7; i++) {
        const nextIndex = (currentIndex + i) % 7;
        const nextDay = daysOfWeek[nextIndex];
        const nextDayHours = storeHours.find(hours => hours.dayOfWeek.toLowerCase() === nextDay.toLowerCase());
        
        if (nextDayHours && !nextDayHours.isClosed) {
          const openTime = formatTime(nextDayHours.openTime);
          if (i === 0) return `Opens today at ${openTime}`;
          if (i === 1) return `Opens tomorrow at ${openTime}`;
          return `Opens ${nextDay} at ${openTime}`;
        }
      }
      return 'Hours not available';
    };

    const formatTime = (time: string): string => {
      if (time.includes('AM') || time.includes('PM') || time.includes('am') || time.includes('pm')) {
        return time;
      }
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours, 10);
      const period = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${period}`;
    };

    const isTimeInRange = (currentTime: string, openTime: string, closeTime: string): boolean => {
      const extractTime = (timeStr: string) => {
        if (timeStr.includes('AM') || timeStr.includes('PM') || timeStr.includes('am') || timeStr.includes('pm')) {
          const [timePart] = timeStr.split(/\s+/);
          const [hours, minutes] = timePart.split(':');
          let hour24 = parseInt(hours, 10);
          
          if (timeStr.includes('PM') || timeStr.includes('pm')) {
            if (hour24 !== 12) hour24 += 12;
          } else if (hour24 === 12) {
            hour24 = 0;
          }
          return `${hour24.toString().padStart(2, '0')}:${minutes}`;
        }
        return timeStr;
      };
      
      const current = extractTime(currentTime);
      const open = extractTime(openTime);
      const close = extractTime(closeTime);
      
      return current >= open && current < close;
    };

    checkOpenStatus();
    const interval = setInterval(checkOpenStatus, 60000);
    return () => clearInterval(interval);
  }, [storeHours]);

  if (!storeHours || storeHours.length === 0) return null;

  return (
    <div
      className={`w-[22px] h-[22px] rounded-full border border-white drop-shadow-sm ${
        isOpen ? 'bg-emerald-500' : 'bg-rose-400'
      } ${className}`}
      title={displayText}
    />
  );
};

export default OpenStatus;
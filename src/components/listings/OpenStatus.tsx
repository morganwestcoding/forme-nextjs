'use client';

import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { SafeStoreHours } from '@/app/types';

interface OpenStatusProps {
  storeHours: SafeStoreHours[];
}

const OpenStatus: React.FC<OpenStatusProps> = ({ storeHours }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [currentHours, setCurrentHours] = useState<string>('');
  const [nextOpenHours, setNextOpenHours] = useState<string>('');
  const [currentDay, setCurrentDay] = useState<string>('');

  useEffect(() => {
    const checkOpenStatus = () => {
      // Get current date and time
      const now = new Date();
      const dayOfWeek = format(now, 'EEEE'); // e.g., 'Monday', 'Tuesday', etc.
      const currentTime = format(now, 'HH:mm'); // 24-hour format

      // Find today's store hours
      const todayHours = storeHours.find(hours => hours.dayOfWeek.toLowerCase() === dayOfWeek.toLowerCase());
      setCurrentDay(dayOfWeek);

      if (!todayHours) {
        setIsOpen(false);
        findNextOpenDay(dayOfWeek);
        return;
      }

      if (todayHours.isClosed) {
        setIsOpen(false);
        findNextOpenDay(dayOfWeek);
        return;
      }

      // Format hours for display
      const formattedOpenTime = formatTime(todayHours.openTime);
      const formattedCloseTime = formatTime(todayHours.closeTime);
      setCurrentHours(`${formattedOpenTime} - ${formattedCloseTime}`);

      // Check if current time is within open hours
      const isCurrentlyOpen = isTimeInRange(currentTime, todayHours.openTime, todayHours.closeTime);
      setIsOpen(isCurrentlyOpen);

      if (!isCurrentlyOpen) {
        findNextOpenDay(dayOfWeek);
      }
    };

    const findNextOpenDay = (currentDayOfWeek: string) => {
      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      let currentIndex = daysOfWeek.findIndex(day => day.toLowerCase() === currentDayOfWeek.toLowerCase());
      
      // Check the next 7 days (including today if we're before opening time)
      for (let i = 0; i < 7; i++) {
        const nextIndex = (currentIndex + i) % 7;
        const nextDay = daysOfWeek[nextIndex];
        const nextDayHours = storeHours.find(hours => hours.dayOfWeek.toLowerCase() === nextDay.toLowerCase());
        
        if (nextDayHours && !nextDayHours.isClosed) {
          const formattedOpenTime = formatTime(nextDayHours.openTime);
          const formattedCloseTime = formatTime(nextDayHours.closeTime);
          
          if (i === 0) {
            // Today, but we're after closing or before opening
            setNextOpenHours(`Opens today at ${formattedOpenTime}`);
          } else if (i === 1) {
            // Tomorrow
            setNextOpenHours(`Opens tomorrow at ${formattedOpenTime}`);
          } else {
            // Another day
            setNextOpenHours(`Opens ${nextDay} at ${formattedOpenTime}`);
          }
          break;
        }
      }
    };

    // Format time from 24-hour to 12-hour format
    const formatTime = (time: string): string => {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours, 10);
      const period = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${period}`;
    };

    // Check if current time is within open and close times
    const isTimeInRange = (currentTime: string, openTime: string, closeTime: string): boolean => {
      return currentTime >= openTime && currentTime < closeTime;
    };

    checkOpenStatus();
    
    // Update every minute
    const interval = setInterval(checkOpenStatus, 60000);
    return () => clearInterval(interval);
  }, [storeHours]);

  if (!storeHours || storeHours.length === 0) {
    return (
      <div className="flex items-center text-sm">
        <div className="w-2 h-2 rounded-full bg-gray-400 mr-2"></div>
        <span className="text-gray-500">Hours not available</span>
      </div>
    );
  }

  return (
    <div className="flex items-center mt-1 text-sm">
      {isOpen ? (
        <>
          <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
          <span className="text-green-600 font-medium">Open now</span>
          <span className="text-gray-500 ml-1">· {currentHours}</span>
        </>
      ) : (
        <>
          <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
          <span className="text-gray-600 font-medium">Closed</span>
          <span className="text-gray-500 ml-1">· {nextOpenHours}</span>
        </>
      )}
    </div>
  );
};

export default OpenStatus;
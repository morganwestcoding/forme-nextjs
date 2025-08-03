import React, { useState, useEffect } from 'react';

interface SafeStoreHours {
  dayOfWeek: string;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

interface SmartBadgePriceProps {
  price: number;
  onPriceClick?: () => void;
  onTimeClick?: () => void;
  storeHours?: SafeStoreHours[];
}

const SmartBadgePrice: React.FC<SmartBadgePriceProps> = ({
  price,
  onPriceClick,
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
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const getTimeStatus = () => {
    const now = new Date();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = dayNames[now.getDay()];
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

    // Find today's store hours
    const todayHours = storeHours.find(hours => 
      hours.dayOfWeek.toLowerCase() === dayOfWeek.toLowerCase()
    );

    // Format time - check if AM/PM already exists
    const formatTime = (time: string): string => {
      if (time.includes('AM') || time.includes('PM') || time.includes('am') || time.includes('pm')) {
        return time; // Time already has AM/PM formatting
      }
      
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours, 10);
      const period = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${period}`;
    };

    // Check if current time is within open and close times
    const isTimeInRange = (currentTime: string, openTime: string, closeTime: string): boolean => {
      // Extract hours and minutes as numbers for comparison
      const extractTime = (timeStr: string) => {
        // Handle cases where the time already includes AM/PM
        if (timeStr.includes('AM') || timeStr.includes('PM') || timeStr.includes('am') || timeStr.includes('pm')) {
          const [timePart] = timeStr.split(/\s+/); // Split by whitespace to get just the time part
          const [hours, minutes] = timePart.split(':');
          const hour = parseInt(hours, 10);
          let hour24 = hour;
          
          // Convert to 24-hour format if needed
          if (timeStr.includes('PM') || timeStr.includes('pm')) {
            if (hour !== 12) hour24 = hour + 12;
          } else if (hour === 12) {
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

    if (!todayHours || todayHours.isClosed) {
      return {
        message: 'Closed',
        color: 'red',
        timeRange: 'Closed'
      };
    }

    // Format hours for display
    const formattedOpenTime = formatTime(todayHours.openTime);
    const formattedCloseTime = formatTime(todayHours.closeTime);
    const timeRange = `${formattedOpenTime} - ${formattedCloseTime}`;

    // Check if currently open
    const isCurrentlyOpen = isTimeInRange(currentTime, todayHours.openTime, todayHours.closeTime);

    if (isCurrentlyOpen) {
      // Calculate time until close
      const extractTimeMinutes = (timeStr: string) => {
        let time24;
        if (timeStr.includes('AM') || timeStr.includes('PM') || timeStr.includes('am') || timeStr.includes('pm')) {
          const [timePart] = timeStr.split(/\s+/);
          const [hours, minutes] = timePart.split(':');
          const hour = parseInt(hours, 10);
          let hour24 = hour;
          
          if (timeStr.includes('PM') || timeStr.includes('pm')) {
            if (hour !== 12) hour24 = hour + 12;
          } else if (hour === 12) {
            hour24 = 0;
          }
          
          time24 = `${hour24.toString().padStart(2, '0')}:${minutes}`;
        } else {
          time24 = timeStr;
        }
        
        const [hours, minutes] = time24.split(':');
        return parseInt(hours) * 60 + parseInt(minutes);
      };

      const currentMinutes = extractTimeMinutes(currentTime);
      const closeMinutes = extractTimeMinutes(todayHours.closeTime);
      const minutesUntilClose = closeMinutes - currentMinutes;

      if (minutesUntilClose <= 30) {
        return {
          message: `Closing`,
          color: 'orange',
          timeRange
        };
      } else if (minutesUntilClose <= 120) { // Less than 2 hours
        const hoursUntilClose = Math.floor(minutesUntilClose / 60);
        const remainingMinutes = minutesUntilClose % 60;
        return {
          message: `Closing`,
          color: 'green',
          timeRange
        };
      } else {
        return {
          message: 'Open',
          color: 'green',
          timeRange
        };
      }
    } else {
      // Not currently open - check if we haven't opened yet today
      const extractTimeMinutes = (timeStr: string) => {
        let time24;
        if (timeStr.includes('AM') || timeStr.includes('PM') || timeStr.includes('am') || timeStr.includes('pm')) {
          const [timePart] = timeStr.split(/\s+/);
          const [hours, minutes] = timePart.split(':');
          const hour = parseInt(hours, 10);
          let hour24 = hour;
          
          if (timeStr.includes('PM') || timeStr.includes('pm')) {
            if (hour !== 12) hour24 = hour + 12;
          } else if (hour === 12) {
            hour24 = 0;
          }
          
          time24 = `${hour24.toString().padStart(2, '0')}:${minutes}`;
        } else {
          time24 = timeStr;
        }
        
        const [hours, minutes] = time24.split(':');
        return parseInt(hours) * 60 + parseInt(minutes);
      };

      const currentMinutes = extractTimeMinutes(currentTime);
      const openMinutes = extractTimeMinutes(todayHours.openTime);

      if (currentMinutes < openMinutes) {
        // Haven't opened yet today - show "Soon" instead of countdown
        return {
          message: 'Soon',
          color: 'orange',
          timeRange
        };
      } else {
        // Already closed for the day
        return {
          message: 'Closed',
          color: 'red',
          timeRange
        };
      }
    }
  };

  const timeStatus = getTimeStatus();

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-2 border border-white/30 shadow-xl">
      <div className="flex items-center">
        {/* Price Section - LEFT */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onPriceClick?.();
          }}
          className="flex-1 flex flex-col items-center py-3.5  hover:bg-white/10 transition-all duration-300 group rounded-l-xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-l-xl"></div>
          <div className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-400/40 shadow-emerald-500/20 shadow-sm rounded-lg px-3 py-1.5 mb-2 group-hover:scale-110 transition-all duration-300 w-24 flex justify-center">
            <div className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="12" height="12" className="text-emerald-200" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"></circle>
                <path d="M15 9.5C15 8.11929 13.8807 7 12.5 7C11.1193 7 10 8.11929 10 9.5C10 10.8807 11.1193 12 12.5 12C13.8807 12 15 13.1193 15 14.5C15 15.8807 13.8807 17 12.5 17C11.1193 17 10 15.8807 10 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path>
                <path d="M12.5 7V5.5M12.5 18.5V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path>
              </svg>
              <span className="text-sm text-emerald-200">${price}</span>
            </div>
          </div>
          <div className="text-xs text-white/80 font-medium tracking-wide">Price</div>
        </button>

        {/* Time Section - RIGHT */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onTimeClick?.();
          }}
          className="flex-1 flex flex-col items-center  py-3.5 hover:bg-white/10 transition-all duration-300 group rounded-r-xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-r-xl"></div>
          <div className={`border rounded-lg px-3 py-1.5 mb-2 group-hover:scale-110 transition-all duration-300 shadow-sm w-24 flex justify-center ${
            timeStatus.color === 'green' ? 'bg-gradient-to-r from-teal-500/20 to-cyan-500/20 border-teal-400/40 shadow-teal-500/20' :
            timeStatus.color === 'orange' ? 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 border-orange-400/40 shadow-orange-500/20' :
            'bg-gradient-to-r from-red-500/20 to-rose-500/20 border-red-400/40 shadow-red-500/20'
          }`}>
            <div className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="12" height="12" className={`${
                timeStatus.color === 'green' ? 'text-teal-200' :
                timeStatus.color === 'orange' ? 'text-orange-200' :
                'text-red-200'
              }`} fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"></circle>
                <path d="M12 8V12L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
              <span className={`text-sm  ${
                timeStatus.color === 'green' ? 'text-teal-200' :
                timeStatus.color === 'orange' ? 'text-orange-200' :
                'text-red-200'
              }`}>
                {timeStatus.message}
              </span>
            </div>
          </div>
          <div className="text-xs text-white/80 font-medium tracking-wide">
            {timeStatus.timeRange}
          </div>
        </button>
      </div>
    </div>
  );
};

export default SmartBadgePrice;
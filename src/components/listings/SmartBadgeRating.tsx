import React, { useState, useEffect } from 'react';
import { Award, TrendingUp, Star } from 'lucide-react';

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

  return (
    <div>
      <div className="flex items-center">
        {/* Rating Section - LEFT */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onRatingClick?.();
          }}
          className="flex-1 flex flex-col items-center py-3  hover:bg-white/10 transition-all duration-300 group rounded-l-xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-l-xl"></div>
          <div className={`border rounded-lg px-3 py-1.5 group-hover:scale-110 transition-all duration-300 ${badgeProps.bgColor} ${badgeProps.borderColor} ${badgeProps.glowColor} shadow-sm w-28 flex justify-center`}>
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
          
        </button>

        {/* Time Section - RIGHT */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onTimeClick?.();
          }}
          className="flex-1 flex flex-col items-center  py-3 hover:bg-white/10 transition-all duration-300 group rounded-r-xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-r-xl"></div>
          <div className={`border rounded-lg px-3 py-1.5 group-hover:scale-110 transition-all duration-300 shadow-sm w-28 flex justify-center ${
            timeStatus.color === 'green' ? 'bg-gradient-to-r from-lime-500/20 to-green-600/20 border-lime-400/40 shadow-lime-500/20' :
            timeStatus.color === 'orange' ? 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 border-orange-400/40 shadow-orange-500/20' :
            'bg-gradient-to-r from-red-500/20 to-rose-500/20 border-red-400/40 shadow-red-500/20'
          }`}>
            <div className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="12" height="12" className={`${
                timeStatus.color === 'green' ? 'text-lime-200' :
                timeStatus.color === 'orange' ? 'text-orange-200' :
                'text-red-200'
              }`} fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"></circle>
                <path d="M12 8V12L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
              <span className={`text-sm ${
                timeStatus.color === 'green' ? 'text-lime-200' :
                timeStatus.color === 'orange' ? 'text-orange-200' :
                'text-red-200'
              }`}>
                {timeStatus.message}
              </span>
            </div>
          </div>
          <div className="text-xs text-white/80 font-medium tracking-wide">
     
          </div>
        </button>
      </div>
    </div>
  );
};

export default SmartBadgeRating;
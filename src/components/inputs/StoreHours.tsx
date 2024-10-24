// components/inputs/StoreHours.tsx
'use client';

import { useState } from 'react';

interface StoreHoursProps {
  onChange: (hours: StoreHourType[]) => void;
}

export type StoreHourType = {
  dayOfWeek: string;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
};

const DAYS_OF_WEEK = [
  { short: 'MN', full: 'Monday' },
  { short: 'TU', full: 'Tuesday' },
  { short: 'WD', full: 'Wednesday' },
  { short: 'TH', full: 'Thursday' },
  { short: 'FR', full: 'Friday' },
  { short: 'SA', full: 'Saturday' },
  { short: 'SU', full: 'Sunday' },
];

const HOURS = Array.from({ length: 12 }, (_, i) => {
  const hour = (i + 1).toString();
  return [
    `${hour}:00 AM`,
    `${hour}:30 AM`,
    `${hour}:00 PM`,
    `${hour}:30 PM`,
  ];
}).flat();

const StoreHours: React.FC<StoreHoursProps> = ({ onChange }) => {
  const [sameEveryDay, setSameEveryDay] = useState(false);
  const [hours, setHours] = useState<StoreHourType[]>(
    DAYS_OF_WEEK.map(day => ({
      dayOfWeek: day.full,
      openTime: '8:00 AM',
      closeTime: '8:00 PM',
      isClosed: false
    }))
  );

  const handleTimeChange = (index: number, type: 'openTime' | 'closeTime', value: string) => {
    const newHours = [...hours];
    newHours[index][type] = value;
    
    if (sameEveryDay) {
      newHours.forEach(hour => {
        hour[type] = value;
      });
    }
    
    setHours(newHours);
    onChange(newHours);
  };

  const handleClosedToggle = (index: number) => {
    const newHours = [...hours];
    newHours[index].isClosed = !newHours[index].isClosed;
    
    if (sameEveryDay) {
      newHours.forEach(hour => {
        hour.isClosed = newHours[index].isClosed;
      });
    }
    
    setHours(newHours);
    onChange(newHours);
  };

  const toggleSameEveryDay = () => {
    setSameEveryDay(!sameEveryDay);
    if (!sameEveryDay) {
      const firstHour = hours[0];
      const newHours = hours.map(hour => ({
        ...hour,
        openTime: firstHour.openTime,
        closeTime: firstHour.closeTime,
        isClosed: firstHour.isClosed
      }));
      setHours(newHours);
      onChange(newHours);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 p-3 border rounded-lg">
        <label className="flex items-center gap-2 text-sm">
          <span>Same every day</span>
          <button
            type="button"
            onClick={toggleSameEveryDay}
            className={`
              w-7 h-7 rounded-full relative transition-colors duration-200 ease-in-out
              ${sameEveryDay ? 'bg-blue-500' : 'bg-gray-200'}
            `}
          >
            <span
              className={`
                absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out
                ${sameEveryDay ? 'transform translate-x-7' : ''}
              `}
            />
          </button>
        </label>
      </div>

      <div className="space-y-4">
        {hours.map((hour, index) => (
          <div key={DAYS_OF_WEEK[index].full} className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
              {DAYS_OF_WEEK[index].short}
            </div>
            
            <select
              value={hour.openTime}
              onChange={(e) => handleTimeChange(index, 'openTime', e.target.value)}
              className="p-2 border rounded"
              disabled={hour.isClosed || (sameEveryDay && index !== 0)}
            >
              {HOURS.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
            
            <span>—</span>
            
            <select
              value={hour.closeTime}
              onChange={(e) => handleTimeChange(index, 'closeTime', e.target.value)}
              className="p-2 border rounded"
              disabled={hour.isClosed || (sameEveryDay && index !== 0)}
            >
              {HOURS.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => handleClosedToggle(index)}
              className={`
                px-3 py-1 rounded text-sm
                ${hour.isClosed ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}
              `}
            >
              {hour.isClosed ? 'Closed' : 'Open'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StoreHours;
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
      <div className="flex items-center justify-between p-3 border rounded-lg">
        <span className="text-sm font-medium">Same every day</span>
        <div className="relative inline-block w-12 select-none">
          <input
            type="checkbox"
            name="toggle"
            id="toggle"
            className="hidden"
            checked={sameEveryDay}
            onChange={toggleSameEveryDay}
          />
          <label
            htmlFor="toggle"
            className={`
              block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer
              ${sameEveryDay ? 'bg-blue-500' : 'bg-gray-300'}
            `}
          >
            <span
              className={`
                block w-4 h-4 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out
                ${sameEveryDay ? 'translate-x-7' : 'translate-x-1'} mt-1
              `}
            />
          </label>
        </div>
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
              className="p-2 border rounded text-black bg-white"
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
              className="p-2 border rounded text-black bg-white"
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
                ${(sameEveryDay && index !== 0) ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              disabled={sameEveryDay && index !== 0}
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
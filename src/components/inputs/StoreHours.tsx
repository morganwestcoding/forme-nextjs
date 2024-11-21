'use client';

import { useState } from 'react';
import Select, { StylesConfig } from 'react-select';

interface StoreHoursProps {
  onChange: (hours: StoreHourType[]) => void;
}

export type StoreHourType = {
  dayOfWeek: string;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
};

interface TimeOption {
  label: string;
  value: string;
}

const DAYS_OF_WEEK = [
  { short: 'MN', full: 'Monday' },
  { short: 'TU', full: 'Tuesday' },
  { short: 'WD', full: 'Wednesday' },
  { short: 'TH', full: 'Thursday' },
  { short: 'FR', full: 'Friday' },
  { short: 'SA', full: 'Saturday' },
  { short: 'SU', full: 'Sunday' },
];

const HOURS: TimeOption[] = Array.from({ length: 12 }, (_, i) => {
  const hour = (i + 1).toString();
  return [
    { label: `${hour}:00 AM`, value: `${hour}:00 AM` },
    { label: `${hour}:30 AM`, value: `${hour}:30 AM` },
    { label: `${hour}:00 PM`, value: `${hour}:00 PM` },
    { label: `${hour}:30 PM`, value: `${hour}:30 PM` },
  ];
}).flat();

const customStyles: StylesConfig<TimeOption, false> = {
  menu: (styles) => ({
    ...styles,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    backdropFilter: 'blur(8px)',
    borderRadius: '0.5rem',
    padding: '0.5rem',
    maxHeight: '250px',
  }),
  menuList: (styles) => ({
    ...styles,
    backgroundColor: 'transparent',
    padding: '0',
    maxHeight: '220px',
    overflowY: 'auto',
    '&::-webkit-scrollbar': {
      width: '6px',
    },
    '&::-webkit-scrollbar-track': {
      background: 'transparent',
    },
    '&::-webkit-scrollbar-thumb': {
      background: 'rgba(255, 255, 255, 0.3)',
      borderRadius: '3px',
    },
    '&::-webkit-scrollbar-thumb:hover': {
      background: 'rgba(255, 255, 255, 0.5)',
    },
  }),
  option: (styles, { isFocused }) => ({
    ...styles,
    backgroundColor: isFocused ? 'rgba(128, 128, 128, 0.5)' : 'transparent',
    color: 'white',
    cursor: 'pointer',
    padding: '0.75rem',
    borderRadius: '0.375rem',
    '&:hover': {
      backgroundColor: 'rgba(128, 128, 128, 0.5)',
    }
  }),
  control: (styles, { isDisabled }) => ({
    ...styles,
    backgroundColor: 'transparent',
    borderColor: 'white',
    color: 'white',
    boxShadow: 'none',
    minHeight: '60px',
    height: '60px',
    opacity: isDisabled ? 0.5 : 1,
    '&:hover': {
      borderColor: 'white',
    },
    borderRadius: '0.4rem',
  }),
  singleValue: (styles) => ({
    ...styles,
    color: 'white',
    marginLeft: '0.5rem',
  }),
  input: (styles) => ({
    ...styles,
    color: 'white',
    marginLeft: '0.5rem',
  }),
  placeholder: (styles) => ({
    ...styles,
    color: 'white',
    marginLeft: '0.5rem',
  }),
  valueContainer: (styles) => ({
    ...styles,
    height: '58px',
    padding: '0 8px 0 0.5rem',
  }),
};

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

  const handleTimeChange = (index: number, type: 'openTime' | 'closeTime', selectedOption: TimeOption | null) => {
    if (!selectedOption) return;
    
    const newHours = [...hours];
    newHours[index][type] = selectedOption.value;
    
    if (sameEveryDay) {
      newHours.forEach(hour => {
        hour[type] = selectedOption.value;
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

  const renderHourRow = (hour: StoreHourType, index: number) => (
    <div key={DAYS_OF_WEEK[index].full} className="flex items-center gap-4">
      <div 
        className="
          min-w-[60px]
          h-[60px]
          rounded-full
          border
          border-white
          bg-transparent
          flex
          items-center
          justify-center
          text-white
          font-light
          text-sm
        "
      >
        {DAYS_OF_WEEK[index].short}
      </div>
      
      <Select<TimeOption>
        value={{ label: hour.openTime, value: hour.openTime }}
        onChange={(option) => handleTimeChange(index, 'openTime', option)}
        options={HOURS}
        isDisabled={hour.isClosed || (sameEveryDay && index !== 0)}
        styles={customStyles}
        className="w-1/3 text-sm"
      />
      
      <span className="text-white text-sm">—</span>
      
      <Select<TimeOption>
        value={{ label: hour.closeTime, value: hour.closeTime }}
        onChange={(option) => handleTimeChange(index, 'closeTime', option)}
        options={HOURS}
        isDisabled={hour.isClosed || (sameEveryDay && index !== 0)}
        styles={customStyles}
        className="w-1/3 text-sm"
      />

      <button
        type="button"
        onClick={() => handleClosedToggle(index)}
        disabled={sameEveryDay && index !== 0}
        className={`
          h-[60px]
          px-4
          rounded-md
          border
          text-sm
          font-light
          transition-colors
          duration-200
          disabled:opacity-50
          disabled:cursor-not-allowed
          ${hour.isClosed 
            ? 'border-red-500 text-red-500 hover:bg-red-500 hover:bg-opacity-10' 
            : 'border-white text-white hover:bg-white hover:bg-opacity-10'
          }
        `}
      >
        {hour.isClosed ? 'Closed' : 'Open'}
      </button>
    </div>
  );

  return (
    <div className="flex flex-col gap-4 w-[900px]">
      <div 
        className="
          flex 
          items-center 
          justify-between 
          p-4 
          border 
          border-white 
          rounded-md 
          bg-transparent
          h-[60px]
        "
      >
        <span className="text-sm font-light text-white">Same hours every day</span>
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
              block 
              overflow-hidden 
              h-6 
              rounded-full 
              cursor-pointer
              transition-colors
              duration-200
              ${sameEveryDay ? 'bg-[#b1dafe]' : 'bg-gray-600'}
            `}
          >
            <span
              className={`
                block 
                w-4 
                h-4 
                rounded-full 
                bg-white 
                shadow 
                transform 
                transition-transform 
                duration-200 
                ease-in-out
                mt-1
                ${sameEveryDay ? 'translate-x-7' : 'translate-x-1'}
              `}
            />
          </label>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Weekdays (Mon-Thu) */}
        <div className="flex-1 space-y-4">
          {hours.slice(0, 4).map((hour, index) => renderHourRow(hour, index))}
        </div>

        {/* Weekend (Fri-Sun) */}
        <div className="flex-1 space-y-4">
          {hours.slice(4).map((hour, index) => renderHourRow(hour, index + 4))}
        </div>
      </div>
    </div>
  );
};

export default StoreHours;
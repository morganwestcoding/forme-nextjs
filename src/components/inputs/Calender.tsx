'use client';

import React, { useState } from 'react';
import { format, addDays, startOfWeek, isSameDay, isAfter, isBefore } from 'date-fns';

interface CalendarProps {
  value: Date;
  onChange: (date: Date) => void;
  disabledDates?: Date[];
}

const Calendar: React.FC<CalendarProps> = ({
  value,
  onChange,
  disabledDates = []
}) => {
  const [currentDate, setCurrentDate] = useState(value);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const startDate = startOfWeek(currentDate);

  const renderDays = () => {
    return daysOfWeek.map((day, index) => {
      const date = addDays(startDate, index);
      const isSelected = isSameDay(date, value);
      const isDisabled = disabledDates.some(disabledDate => isSameDay(disabledDate, date)) || isBefore(date, new Date());

      return (
        <div
          key={day}
          className={`flex flex-col items-center p-2 cursor-pointer rounded-lg ${
            isSelected ? 'bg-[#b1dafe] text-white' : ''
          } ${isDisabled ? ' cursor-not-allowed' : 'hover:bg-gray-100'}`}
          onClick={() => !isDisabled && onChange(date)}
        >
          <div className="text-sm">{day}</div>
          <div className="text-sm font-bold">{format(date, 'd')}</div>
        </div>
      );
    });
  };

  const goToPreviousWeek = () => {
    setCurrentDate(prevDate => addDays(prevDate, -7));
  };

  const goToNextWeek = () => {
    setCurrentDate(prevDate => addDays(prevDate, 7));
  };

  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
      <div className="flex justify-between items-center p-4 bg-gray-50">
        <button onClick={goToPreviousWeek} className="text-gray-600 text-sm hover:text-gray-800">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="#000000" fill="none">
    <path d="M15 6C15 6 9.00001 10.4189 9 12C8.99999 13.5812 15 18 15 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
</svg> Prev
        </button>
        <div className=" font-bold">
          {format(currentDate, 'MMMM yyyy')}
        </div>
        <button onClick={goToNextWeek} className=" text-sm text-gray-600 hover:text-gray-800">
          Next <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="#000000" fill="none">
    <path d="M9.00005 6C9.00005 6 15 10.4189 15 12C15 13.5812 9 18 9 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
</svg>
        </button>
      </div>
      <div className="flex justify-between p-4">
        {renderDays()}
      </div>
    </div>
  );
};

export default Calendar;
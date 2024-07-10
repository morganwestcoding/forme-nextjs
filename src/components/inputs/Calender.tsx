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
          className={`flex flex-col items-center p-2 cursor-pointer ${
            isSelected ? 'bg-black text-white' : ''
          } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
          onClick={() => !isDisabled && onChange(date)}
        >
          <div className="text-sm">{day}</div>
          <div className="text-lg font-bold">{format(date, 'd')}</div>
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
        <button onClick={goToPreviousWeek} className="text-gray-600 hover:text-gray-800">
          &lt; Prev
        </button>
        <div className="text-lg font-bold">
          {format(currentDate, 'MMMM yyyy')}
        </div>
        <button onClick={goToNextWeek} className="text-gray-600 hover:text-gray-800">
          Next &gt;
        </button>
      </div>
      <div className="flex justify-between p-4">
        {renderDays()}
      </div>
    </div>
  );
};

export default Calendar;
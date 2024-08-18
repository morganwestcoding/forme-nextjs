'use client';

import React, { useState } from 'react';
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth } from 'date-fns';
import PersonTime from '../listings/PersonTime'; // Make sure to import the PersonTime component

interface CalendarProps {
  value: Date;
  onChange: (date: Date) => void;
  disabledDates?: Date[];
  onTimeChange: (time: string) => void; // Add this prop
}

const Calendar: React.FC<CalendarProps> = ({
  value,
  onChange,
  disabledDates = [],
  onTimeChange // Add this prop
}) => {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(value));

  const daysOfWeek = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  const renderDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const dateRange = eachDayOfInterval({ start: monthStart, end: monthEnd });

    return dateRange.map((date, index) => {
      const isSelected = isSameDay(date, value);
      const isDisabled = disabledDates.some(disabledDate => isSameDay(disabledDate, date));
      const isCurrentMonth = isSameMonth(date, currentMonth);

      return (
        <div
          key={index}
          className={`flex justify-center items-center p-2 cursor-pointer rounded-lg ${
            isSelected ? 'bg-black text-white' : ''
          } ${!isCurrentMonth ? 'text-gray-300' : ''} ${isDisabled ? 'cursor-not-allowed' : 'hover:bg-gray-100'}`}
          onClick={() => !isDisabled && onChange(date)}
        >
          <div className="text-sm">{format(date, 'd')}</div>
        </div>
      );
    });
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(prevMonth => addMonths(prevMonth, -1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prevMonth => addMonths(prevMonth, 1));
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden w-full max-w-4xl mx-auto border">
      <div className="flex justify-between items-center p-4 pb-2 md:p-6 md:pb-3">
        <button onClick={goToPreviousMonth} className="p-2 rounded-lg border bg-white">
          {'<'}
        </button>
        <div className="text-lg md:text-lg font-semibold">
          {format(currentMonth, 'MMMM yyyy')}
        </div>
        <button onClick={goToNextMonth} className="p-2 rounded-lg border bg-white">
          {'>'}
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 px-4 pt-2 pb-2 md:px-6 md:pt-3 md:pb-3">
        {daysOfWeek.map(day => (
          <div key={day} className="text-center text-gray-400 text-sm md:text-base mb-1">
            {day}
          </div>
        ))}
        {renderDays()}
      </div>
    </div>
  );
};

export default Calendar;
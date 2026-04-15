'use client';

import React, { useState } from 'react';
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, isBefore, startOfDay } from 'date-fns';
import PersonTime from '../listings/PersonTime'; // Make sure to import the PersonTime component

interface CalendarProps {
  value: Date;
  onChange: (date: Date) => void;
  disabledDates?: Date[];
  onTimeChange?: (time: string) => void; 
}

const Calendar: React.FC<CalendarProps> = ({
  value,
  onChange,
  disabledDates = [],
  onTimeChange 
}) => {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(value));
  const today = startOfDay(new Date()); // Get today's date at start of day

  const daysOfWeek = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  const renderDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const dateRange = eachDayOfInterval({ start: monthStart, end: monthEnd });

    return dateRange.map((date, index) => {
      const isSelected = isSameDay(date, value);
      const isDisabled = disabledDates.some(disabledDate => isSameDay(disabledDate, date));
      const isPastDate = isBefore(startOfDay(date), today);
      const isCurrentMonth = isSameMonth(date, currentMonth);
      const isClickDisabled = isDisabled || isPastDate;

      return (
        <div
          key={index}
          className={`flex justify-center items-center p-2 rounded-xl transition-all duration-200 ${
            isSelected 
              ? 'bg-stone-500 text-white shadow-md' 
              : isClickDisabled
                ? 'cursor-not-allowed text-stone-300 bg-stone-50 dark:bg-stone-900'
                : 'cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800 dark:bg-stone-900 hover:text-stone-600 dark:text-stone-300'
          } ${!isCurrentMonth ? 'text-stone-200' : ''}`}
          onClick={() => !isClickDisabled && onChange(date)}
        >
          <div className={`text-sm font-medium ${
            isPastDate && isCurrentMonth ? 'line-through' : ''
          }`}>
            {format(date, 'd')}
          </div>
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

  // Check if we can go to previous month (don't allow going to months that are entirely in the past)
  const canGoToPreviousMonth = () => {
    const previousMonth = addMonths(currentMonth, -1);
    const endOfPreviousMonth = endOfMonth(previousMonth);
    return !isBefore(startOfDay(endOfPreviousMonth), today);
  };

  return (
    <div className="bg-white dark:bg-stone-900 rounded-xl shadow-sm overflow-hidden w-full mx-auto border border-stone-200 dark:border-stone-800">
      <div className="flex justify-between items-center p-4 pb-2 bg-stone-50 dark:bg-stone-900 border-b border-stone-100 dark:border-stone-800">
        <button 
          onClick={goToPreviousMonth} 
          disabled={!canGoToPreviousMonth()}
          className={`p-2 rounded-xl transition-all duration-200 ${
            canGoToPreviousMonth() 
              ? 'hover:bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-200 cursor-pointer' 
              : 'text-stone-300 cursor-not-allowed'
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="text-lg font-semibold text-stone-900 dark:text-stone-100">
          {format(currentMonth, 'MMMM yyyy')}
        </div>
        <button 
          onClick={goToNextMonth} 
          className="p-2 rounded-xl hover:bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-200 transition-all duration-200"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {daysOfWeek.map(day => (
            <div key={day} className="text-center text-stone-500 dark:text-stone-400 dark:text-stone-500 text-sm font-medium py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {renderDays()}
        </div>
      </div>
      
      {/* Helper text */}
      <div className="px-4 pb-4">
        <p className="text-xs text-stone-500 dark:text-stone-400 dark:text-stone-500 text-center">
          Past dates are disabled and cannot be selected
        </p>
      </div>
    </div>
  );
};

export default Calendar;
'use client';

import { format } from 'date-fns';
import TypeformHeading from '@/components/registration/TypeformHeading';

interface TimeStepProps {
  timeOptions: string[];
  selectedTime: string;
  onTimeChange: (time: string) => void;
  isTimeDisabled: (time: string) => boolean;
  isToday: boolean;
}

export default function TimeStep({
  timeOptions,
  selectedTime,
  onTimeChange,
  isTimeDisabled,
  isToday,
}: TimeStepProps) {
  return (
    <div>
      <TypeformHeading
        question="Pick a time"
        subtitle="Choose your preferred time slot"
      />

      <div className="grid grid-cols-3 gap-3">
        {timeOptions.map(t => {
          const isDisabled = isTimeDisabled(t);
          const isSelected = selectedTime === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => !isDisabled && onTimeChange(t)}
              disabled={isDisabled}
              className={`aspect-square p-3 rounded-xl border-2 transition-all duration-200 flex items-center justify-center ${
                isDisabled
                  ? 'border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed'
                  : isSelected
                    ? 'border-gray-900 bg-gray-50 text-gray-900 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700 hover:shadow-md cursor-pointer'
              }`}
            >
              <span className={`font-medium text-sm ${isDisabled ? 'line-through' : ''}`}>
                {format(new Date(`2021-01-01T${t}`), 'hh:mm a')}
              </span>
            </button>
          );
        })}
      </div>

      {isToday && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mt-6">
          <p className="text-sm text-amber-700 text-center">
            <span className="font-medium">Today&apos;s booking:</span> Times shown with 1 hour advance notice required
          </p>
        </div>
      )}
    </div>
  );
}

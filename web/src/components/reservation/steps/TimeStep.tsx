'use client';

import { motion } from 'framer-motion';
import { format } from 'date-fns';
import TypeformHeading from '@/components/registration/TypeformHeading';
import { itemVariants } from '@/components/registration/TypeformStep';

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
        {timeOptions.map((t, index) => {
          const isDisabled = isTimeDisabled(t);
          const isSelected = selectedTime === t;
          return (
            <motion.button
              key={t}
              type="button"
              onClick={() => !isDisabled && onTimeChange(t)}
              disabled={isDisabled}
              variants={itemVariants}
              whileTap={isDisabled ? undefined : { scale: 0.97 }}
              className={`
                p-4 rounded-xl border text-center transition-all duration-200
                ${isDisabled
                  ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                  : isSelected
                    ? 'border-gray-300 bg-gray-100 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 cursor-pointer'
                }
              `}
            >
              <span className={`font-medium text-sm ${isDisabled ? 'line-through text-gray-300' : 'text-gray-900'}`}>
                {format(new Date(`2021-01-01T${t}`), 'h:mm a')}
              </span>
            </motion.button>
          );
        })}
      </div>

      {isToday && (
        <p className="text-sm text-gray-400 text-center mt-6">
          Times within 1 hour are unavailable for same-day bookings
        </p>
      )}
    </div>
  );
}

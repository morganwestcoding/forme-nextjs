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
                  ? 'border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-stone-300 cursor-not-allowed'
                  : isSelected
                    ? 'border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 shadow-inset-pressed'
                    : 'border-stone-200  bg-white dark:bg-stone-900 hover:border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800  cursor-pointer'
                }
              `}
            >
              <span className={`font-medium text-sm ${isDisabled ? 'line-through text-stone-300' : 'text-stone-900 dark:text-stone-100'}`}>
                {format(new Date(`2021-01-01T${t}`), 'h:mm a')}
              </span>
            </motion.button>
          );
        })}
      </div>

      {isToday && (
        <p className="text-sm text-stone-400 dark:text-stone-500 text-center mt-6">
          Times within 1 hour are unavailable for same-day bookings
        </p>
      )}
    </div>
  );
}

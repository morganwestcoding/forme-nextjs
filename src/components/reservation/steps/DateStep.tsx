'use client';

import TypeformHeading from '@/components/registration/TypeformHeading';
import Calendar from '@/components/inputs/Calender';

interface DateStepProps {
  date: Date | null;
  onDateChange: (date: Date) => void;
}

export default function DateStep({ date, onDateChange }: DateStepProps) {
  return (
    <div>
      <TypeformHeading
        question="Pick a date"
        subtitle="When would you like to come in?"
      />

      <div className="flex justify-center">
        <Calendar
          value={date || new Date()}
          onChange={onDateChange}
        />
      </div>
    </div>
  );
}

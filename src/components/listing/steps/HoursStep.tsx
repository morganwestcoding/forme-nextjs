'use client';

import TypeformHeading from '@/components/registration/TypeformHeading';
import StoreHours, { StoreHourType } from '@/components/inputs/StoreHours';

interface HoursStepProps {
  storeHours: StoreHourType[];
  onHoursChange: (hours: StoreHourType[]) => void;
}

export default function HoursStep({ onHoursChange }: HoursStepProps) {
  return (
    <div>
      <TypeformHeading
        question="What are your business hours?"
        subtitle="Let customers know when you're open"
      />

      <StoreHours onChange={onHoursChange} />
    </div>
  );
}

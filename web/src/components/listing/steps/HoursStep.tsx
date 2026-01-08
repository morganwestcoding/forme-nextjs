'use client';

import { motion } from 'framer-motion';
import TypeformHeading from '@/components/registration/TypeformHeading';
import { itemVariants } from '@/components/registration/TypeformStep';
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

      <motion.div variants={itemVariants}>
        <StoreHours onChange={onHoursChange} />
      </motion.div>
    </div>
  );
}

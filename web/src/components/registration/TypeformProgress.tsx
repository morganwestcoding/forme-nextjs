'use client';

import { motion } from 'framer-motion';

interface TypeformProgressProps {
  currentStep: number;
  totalSteps: number;
}

export default function TypeformProgress({ currentStep, totalSteps }: TypeformProgressProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="h-1 bg-stone-100 dark:bg-stone-800">
        <motion.div
          className="h-full bg-stone-900"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      </div>
    </div>
  );
}

'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface TypeformStepProps {
  children: ReactNode;
  direction: 1 | -1;
}

const variants = {
  enter: (direction: number) => ({
    y: direction > 0 ? 20 : -20,
    opacity: 0,
  }),
  center: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1] as const,
    }
  },
  exit: (direction: number) => ({
    y: direction > 0 ? -20 : 20,
    opacity: 0,
    transition: { duration: 0.15, ease: [0.4, 0, 1, 1] as const }
  }),
};

// Export child variants for use in step components - no animation, appears with parent
export const itemVariants = {
  enter: { opacity: 1, y: 0 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 1, y: 0 }
};

export default function TypeformStep({ children, direction }: TypeformStepProps) {
  return (
    <motion.div
      custom={direction}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
    >
      {children}
    </motion.div>
  );
}

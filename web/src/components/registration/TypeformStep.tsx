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
      y: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
      opacity: { duration: 0.25 },
      staggerChildren: 0,
      delayChildren: 0.05,
    }
  },
  exit: (direction: number) => ({
    y: direction > 0 ? -20 : 20,
    opacity: 0,
    transition: { duration: 0.15, ease: "easeIn" }
  }),
};

// Export child variants for use in step components
export const itemVariants = {
  enter: { opacity: 0, y: 12 },
  center: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }
  },
  exit: { opacity: 0, y: -8, transition: { duration: 0.1 } }
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

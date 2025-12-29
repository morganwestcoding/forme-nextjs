'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface TypeformStepProps {
  children: ReactNode;
  direction: 1 | -1;
}

const variants = {
  enter: (direction: number) => ({
    y: direction > 0 ? 40 : -40,
    opacity: 0,
  }),
  center: {
    y: 0,
    opacity: 1,
    transition: {
      y: { type: "spring", stiffness: 300, damping: 30 },
      opacity: { duration: 0.2 }
    }
  },
  exit: (direction: number) => ({
    y: direction > 0 ? -40 : 40,
    opacity: 0,
    transition: { duration: 0.15 }
  }),
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

'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CelebrationProps {
  onComplete: () => void;
  userName?: string;
}

// Generate random confetti particles
function generateParticles(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,          // random horizontal start %
    delay: Math.random() * 0.6,       // stagger
    duration: 1.5 + Math.random() * 2, // fall speed
    size: 6 + Math.random() * 8,
    rotation: Math.random() * 360,
    color: [
      '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6',
      '#EC4899', '#F97316', '#14B8A6', '#6366F1',
    ][i % 8],
  }));
}

export default function Celebration({ onComplete, userName }: CelebrationProps) {
  const [particles] = useState(() => generateParticles(60));
  const [phase, setPhase] = useState<'celebrate' | 'fadeOut'>('celebrate');

  useEffect(() => {
    // Show celebration for 2.5s, then fade out for 0.8s
    const celebrateTimer = setTimeout(() => setPhase('fadeOut'), 2500);
    const completeTimer = setTimeout(() => onComplete(), 3300);
    return () => {
      clearTimeout(celebrateTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === 'fadeOut' ? 0 : 1 }}
        transition={{ duration: phase === 'fadeOut' ? 0.8 : 0.3 }}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-white" />

        {/* Confetti particles */}
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-sm"
            style={{
              left: `${p.x}%`,
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              top: -20,
            }}
            initial={{ y: -20, opacity: 1, rotate: 0, scale: 1 }}
            animate={{
              y: typeof window !== 'undefined' ? window.innerHeight + 40 : 900,
              opacity: [1, 1, 0.8, 0],
              rotate: p.rotation + 360 * (Math.random() > 0.5 ? 1 : -1),
              scale: [1, 1.2, 0.8],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              ease: [0.25, 0.1, 0.25, 1],
            }}
          />
        ))}

        {/* Center message */}
        <motion.div
          className="relative z-10 text-center px-6"
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <motion.div
            className="text-5xl mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.3, 1] }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            🎉
          </motion.div>
          <h1 className="text-3xl font-bold text-stone-900 tracking-tight">
            Welcome to ForMe{userName ? `, ${userName}` : ''}!
          </h1>
          <p className="text-stone-500 mt-2 text-base">
            You&apos;re all set. Let&apos;s get started.
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

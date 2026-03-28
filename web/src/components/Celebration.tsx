'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CelebrationProps {
  onComplete: () => void;
  userName?: string;
}

const CONFETTI_COLORS = ['#1c1917', '#a8a29e', '#d6d3d1', '#78716c', '#e7e5e4', '#57534e'];

function generateParticles(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.8,
    duration: 2 + Math.random() * 2.5,
    size: 4 + Math.random() * 6,
    rotation: Math.random() * 720 - 360,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    shape: Math.random() > 0.5 ? 'rect' : 'circle',
    drift: (Math.random() - 0.5) * 120,
  }));
}

export default function Celebration({ onComplete, userName }: CelebrationProps) {
  const [particles] = useState(() => generateParticles(80));
  const [phase, setPhase] = useState<'enter' | 'show' | 'exit'>('enter');

  const handleComplete = useCallback(() => {
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    const enterTimer = setTimeout(() => setPhase('show'), 100);
    const exitTimer = setTimeout(() => setPhase('exit'), 3500);
    const completeTimer = setTimeout(handleComplete, 4500);
    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [handleComplete]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === 'exit' ? 0 : 1 }}
        transition={{ duration: phase === 'exit' ? 0.8 : 0.4 }}
      >
        {/* Background */}
        <motion.div
          className="absolute inset-0 bg-stone-950"
          initial={{ opacity: 1 }}
          animate={{
            opacity: phase === 'show' ? 1 : 1,
            background: phase === 'show'
              ? 'radial-gradient(ellipse at center, #292524 0%, #0c0a09 100%)'
              : '#0c0a09',
          }}
          transition={{ duration: 1.2 }}
        />

        {/* Subtle glow */}
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(168,162,158,0.08) 0%, transparent 70%)',
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: phase === 'show' ? 1.5 : 0, opacity: phase === 'show' ? 1 : 0 }}
          transition={{ duration: 2, ease: 'easeOut' }}
        />

        {/* Confetti */}
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className={p.shape === 'circle' ? 'absolute rounded-full' : 'absolute'}
            style={{
              left: `${p.x}%`,
              width: p.size,
              height: p.shape === 'rect' ? p.size * 2.5 : p.size,
              backgroundColor: p.color,
              top: -20,
            }}
            initial={{ y: -20, opacity: 0, rotate: 0, x: 0 }}
            animate={{
              y: typeof window !== 'undefined' ? window.innerHeight + 40 : 900,
              opacity: [0, 1, 1, 0.6, 0],
              rotate: p.rotation,
              x: p.drift,
            }}
            transition={{
              duration: p.duration,
              delay: 0.6 + p.delay,
              ease: [0.25, 0.1, 0.25, 1],
            }}
          />
        ))}

        {/* Center content */}
        <div className="relative z-10 text-center px-6 max-w-md">
          {/* Checkmark */}
          <motion.div
            className="mx-auto mb-8 w-16 h-16 rounded-full border-2 border-stone-700 flex items-center justify-center"
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: phase !== 'enter' ? 1 : 0,
              opacity: phase !== 'enter' ? 1 : 0,
            }}
            transition={{ duration: 0.5, delay: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <motion.svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.4, delay: 0.6 }}
            >
              <motion.path
                d="M5 13l4 4L19 7"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: phase !== 'enter' ? 1 : 0 }}
                transition={{ duration: 0.4, delay: 0.7, ease: 'easeOut' }}
              />
            </motion.svg>
          </motion.div>

          {/* Welcome text */}
          <motion.h1
            className="text-[28px] font-semibold text-white tracking-tight"
            initial={{ opacity: 0, y: 16 }}
            animate={{
              opacity: phase !== 'enter' ? 1 : 0,
              y: phase !== 'enter' ? 0 : 16,
            }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            Welcome{userName ? `, ${userName}` : ''}
          </motion.h1>

          <motion.p
            className="text-[14px] text-stone-500 mt-2"
            initial={{ opacity: 0, y: 12 }}
            animate={{
              opacity: phase !== 'enter' ? 1 : 0,
              y: phase !== 'enter' ? 0 : 12,
            }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            Your account is ready. Let&apos;s get started.
          </motion.p>

          {/* Subtle divider */}
          <motion.div
            className="mx-auto mt-6 h-px bg-stone-800"
            initial={{ width: 0 }}
            animate={{ width: phase !== 'enter' ? 120 : 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
          />

          <motion.p
            className="text-[12px] text-stone-600 mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase !== 'enter' ? 1 : 0 }}
            transition={{ duration: 0.4, delay: 1.2 }}
          >
            Redirecting you now...
          </motion.p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

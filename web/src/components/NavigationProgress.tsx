'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Slim top-of-page progress bar that animates on route changes.
 * Inspired by YouTube / Linear — purely cosmetic, no actual load %.
 */
export default function NavigationProgress() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Start the bar
    setProgress(0);
    setVisible(true);

    // Quick jump to ~70%
    const t1 = setTimeout(() => setProgress(70), 50);

    // Finish to 100% after a beat
    const t2 = setTimeout(() => setProgress(100), 350);

    // Hide after transition completes
    const t3 = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 600);

    timeoutRef.current = t3;

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [pathname]);

  if (!visible && progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[99999] h-[2px] pointer-events-none"
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.2s ease-out' }}
    >
      <div
        className="h-full bg-stone-400 dark:bg-stone-500"
        style={{
          width: `${progress}%`,
          transition: progress === 0 ? 'none' : 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />
    </div>
  );
}

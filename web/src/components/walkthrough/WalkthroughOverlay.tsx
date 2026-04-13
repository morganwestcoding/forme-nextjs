'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useWalkthrough from '@/app/hooks/useWalkthrough';
import WalkthroughTooltip from './WalkthroughTooltip';

const SPOTLIGHT_PADDING = 14;
const SPOTLIGHT_RADIUS = 12;
const MAX_SPOTLIGHT_HEIGHT = 420;

interface SpotlightRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

// Build spotlight + tooltip rects, optionally capping height
function computeRects(r: DOMRect, fullSpotlight?: boolean) {
  const height = fullSpotlight ? r.height : Math.min(r.height, MAX_SPOTLIGHT_HEIGHT);
  const finalRect = new DOMRect(r.x, r.top, r.width, height);
  const spot: SpotlightRect = {
    x: r.left - SPOTLIGHT_PADDING,
    y: r.top - SPOTLIGHT_PADDING,
    w: r.width + SPOTLIGHT_PADDING * 2,
    h: height + SPOTLIGHT_PADDING * 2,
  };
  return { targetRect: finalRect, spotlight: spot };
}

const WalkthroughOverlay: React.FC = () => {
  const { isActive, currentStep, steps, next, prev, skip } = useWalkthrough();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [spotlight, setSpotlight] = useState<SpotlightRect | null>(null);
  const [showStep, setShowStep] = useState(false);
  const scrollLockedRef = useRef(true);
  const preventScrollRef = useRef<((e: Event) => void) | null>(null);

  const step = steps[currentStep];

  // --- Scroll lock helpers ---
  const lockScroll = useCallback(() => {
    if (scrollLockedRef.current) return;
    scrollLockedRef.current = true;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    if (preventScrollRef.current) {
      window.addEventListener('wheel', preventScrollRef.current, { passive: false });
      window.addEventListener('touchmove', preventScrollRef.current, { passive: false });
    }
  }, []);

  const unlockScroll = useCallback(() => {
    if (!scrollLockedRef.current) return;
    scrollLockedRef.current = false;
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    document.documentElement.style.overflow = '';
    if (preventScrollRef.current) {
      window.removeEventListener('wheel', preventScrollRef.current);
      window.removeEventListener('touchmove', preventScrollRef.current);
    }
  }, []);

  // --- Scroll lock lifecycle ---
  useEffect(() => {
    if (!isActive) return;

    const handler = (e: Event) => {
      if (scrollLockedRef.current) e.preventDefault();
    };
    preventScrollRef.current = handler;

    scrollLockedRef.current = false;
    lockScroll();

    return () => {
      unlockScroll();
      preventScrollRef.current = null;
    };
  }, [isActive, lockScroll, unlockScroll]);

  // --- Step transitions ---
  useEffect(() => {
    if (!isActive || !step) return;

    // 1. Fade out current step
    setShowStep(false);

    // 2. After fade-out, scroll to target and measure
    const t = setTimeout(() => {
      const el = document.querySelector(step.target);
      if (!el) {
        setTargetRect(null);
        setSpotlight(null);
        return;
      }

      const rect = el.getBoundingClientRect();
      // For full spotlight steps, check that the element top is near the viewport top
      // so the whole section is visible. For small elements, just check basic visibility.
      const isWellPositioned = step.fullSpotlight
        ? rect.top >= 0 && rect.top < 80
        : rect.top >= 0 && rect.top < window.innerHeight - 100;

      if (isWellPositioned) {
        const computed = computeRects(el.getBoundingClientRect(), step.fullSpotlight);
        setTargetRect(computed.targetRect);
        setSpotlight(computed.spotlight);
        setShowStep(true);
      } else {
        // Need to scroll — temporarily unlock
        unlockScroll();
        // Full spotlight sections scroll to start so header + content fill the viewport
        const scrollBlock = step.fullSpotlight ? 'start' : 'center';
        el.scrollIntoView({ behavior: 'smooth', block: scrollBlock });

        // Poll until scroll settles
        let lastTop = rect.top;
        let settledCount = 0;
        const poll = setInterval(() => {
          const current = el.getBoundingClientRect();
          if (Math.abs(current.top - lastTop) < 1) {
            settledCount++;
            if (settledCount >= 3) {
              clearInterval(poll);
              const computed = computeRects(el.getBoundingClientRect(), step.fullSpotlight);
              setTargetRect(computed.targetRect);
              setSpotlight(computed.spotlight);
              lockScroll();
              setShowStep(true);
            }
          } else {
            settledCount = 0;
          }
          lastTop = current.top;
        }, 50);

        // Safety: force settle after 1s
        setTimeout(() => {
          clearInterval(poll);
          const computed = computeRects(el.getBoundingClientRect(), step.fullSpotlight);
          setTargetRect(computed.targetRect);
          setSpotlight(computed.spotlight);
          lockScroll();
          setShowStep(true);
        }, 1000);
      }
    }, 200); // wait for fade-out

    return () => clearTimeout(t);
  }, [isActive, currentStep, step, lockScroll, unlockScroll]);

  // Reposition on resize
  useEffect(() => {
    if (!isActive) return;
    const handleResize = () => {
      if (!step) return;
      const el = document.querySelector(step.target);
      if (el) {
        const computed = computeRects(el.getBoundingClientRect(), step.fullSpotlight);
        setTargetRect(computed.targetRect);
        setSpotlight(computed.spotlight);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isActive, step]);

  // Keyboard
  useEffect(() => {
    if (!isActive) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') skip();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isActive, skip, next, prev]);

  if (!isActive || !step) return null;

  return (
    <>
      {/* Backdrop — click to skip */}
      <div
        className="fixed inset-0"
        style={{ zIndex: 9999 }}
        onClick={skip}
      />

      {/* Spotlight + tooltip fade together */}
      <AnimatePresence>
        {showStep && spotlight && targetRect && (
          <>
            <motion.svg
              key={`spotlight-${currentStep}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="fixed inset-0 w-full h-full pointer-events-none"
              style={{ zIndex: 10000 }}
            >
              <defs>
                <mask id="walkthrough-mask">
                  <rect width="100%" height="100%" fill="white" />
                  <rect
                    x={spotlight.x}
                    y={spotlight.y}
                    width={spotlight.w}
                    height={spotlight.h}
                    rx={SPOTLIGHT_RADIUS}
                    ry={SPOTLIGHT_RADIUS}
                    fill="black"
                  />
                </mask>
              </defs>
              <rect
                width="100%"
                height="100%"
                fill="rgba(0, 0, 0, 0.6)"
                mask="url(#walkthrough-mask)"
              />
              <rect
                x={spotlight.x}
                y={spotlight.y}
                width={spotlight.w}
                height={spotlight.h}
                rx={SPOTLIGHT_RADIUS}
                ry={SPOTLIGHT_RADIUS}
                fill="none"
                stroke="rgba(255, 255, 255, 0.15)"
                strokeWidth="1.5"
              />
            </motion.svg>

            <WalkthroughTooltip
              key={`tooltip-${currentStep}`}
              step={step}
              currentStep={currentStep}
              totalSteps={steps.length}
              targetRect={targetRect}
              onNext={next}
              onPrev={prev}
              onSkip={skip}
            />
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default WalkthroughOverlay;

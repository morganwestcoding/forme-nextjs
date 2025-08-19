'use client';

import React from 'react';
import clsx from 'clsx';

type GooeyDotsProps = {
  /** Size of each dot in pixels (default 35) */
  dotSize?: number;
  /** Radius of the travel circle in pixels (default 70) */
  circleSize?: number;
  /** Animation cycle in seconds (default 4) */
  speed?: number;
  /** Optional custom className for spacing/positioning */
  className?: string;
  /** If true, renders a full-screen centered overlay with backdrop */
  backdrop?: boolean;
  /** Elevation for overlay variant (default z-[60] to sit above your sidebar) */
  zIndexClass?: string;
};

const GooeyDots: React.FC<GooeyDotsProps> = ({
  dotSize = 35,
  circleSize = 70,
  speed = 4,
  className,
  backdrop = false,
  zIndexClass = 'z-[60]'
}) => {
  const styleVars: React.CSSProperties = {
    // Exposed as CSS variables for the global CSS to use
    // @ts-expect-error: CSS variables are fine here
    '--gd-dot-size': `${dotSize}px`,
    '--gd-circle-size': `${circleSize}px`,
    '--gd-speed': `${speed}s`,
  };

  const content = (
    <>
      {/* SVG defs for the goo filter (kept local so it doesn't pollute the DOM) */}
      <svg aria-hidden="true" width="0" height="0" className="absolute pointer-events-none">
        <defs>
          <filter id="gd-goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      {/* The actual loader */}
      <div
        className={clsx(
          'gd-dots',
          // If not using backdrop, let parent control positioning (e.g., flex/center)
          !backdrop && 'relative',
          className
        )}
        style={styleVars}
        aria-label="Loading"
        role="status"
      >
        <div className="gd-dot" />
        <div className="gd-dot" />
        <div className="gd-dot" />
        <div className="gd-dot" />
        <div className="gd-dot" />
      </div>
    </>
  );

  if (!backdrop) return content;

  return (
    <div
      className={clsx(
        'fixed inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px]',
        zIndexClass
      )}
      aria-live="polite"
    >
      {content}
    </div>
  );
};

export default GooeyDots;

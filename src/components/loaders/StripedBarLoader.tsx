'use client';

import React from 'react';
import clsx from 'clsx';

type StripedBarLoaderProps = {
  /** Width in px (default 96) */
  width?: number;
  /** Height in px (default 24) */
  height?: number;
  /** Stripe size driver (affects density). Maps to font-size in px (default 15) */
  stripeSizePx?: number;
  /** Animation speed in seconds (default 0.6) */
  speedSec?: number;
  /** Extra classes (e.g., 'text-sky-400') to control color/positioning */
  className?: string;
};

const StripedBarLoader: React.FC<StripedBarLoaderProps> = ({
  width = 96,
  height = 24,
  stripeSizePx = 15,
  speedSec = 0.6,
  className,
}) => {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={clsx('loader', className)}
      style={{
        width,
        height,
        fontSize: `${stripeSizePx}px`,
        animationDuration: `${speedSec}s`,
      }}
    />
  );
};

export default StripedBarLoader;

'use client';

import React from 'react';
import clsx from 'clsx';

type ShadowRollingLoaderProps = {
  /** Tailwind color class (e.g. text-sky-400, text-white) */
  className?: string;
};

const ShadowRollingLoader: React.FC<ShadowRollingLoaderProps> = ({ className }) => {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={clsx('loader', className)}
    />
  );
};

export default ShadowRollingLoader;

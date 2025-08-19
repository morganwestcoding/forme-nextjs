'use client';

import React from 'react';
import { PropagateLoader } from 'react-spinners';

type LoaderProps = {
  /** Loader size (dot size, default 15) */
  size?: number;
  /** Speed multiplier (default 1) */
  speedMultiplier?: number;
};

const PropagateLoaderWrapper: React.FC<LoaderProps> = ({
  size = 15,
  speedMultiplier = 1,
}) => {
  return (
    <div className="flex justify-center items-center">
      <PropagateLoader
        color="#60A5FA"      // 👈 fixed to your requested color
        size={size}
        speedMultiplier={speedMultiplier}
      />
    </div>
  );
};

export default PropagateLoaderWrapper;

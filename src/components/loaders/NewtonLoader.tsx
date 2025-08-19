'use client';

import React from 'react';

const NewtonLoader: React.FC = () => {
  return (
    <>
      {/* Local SVG defs for the goo filter */}
      <svg width="0" height="0" className="absolute pointer-events-none" aria-hidden="true">
        <defs>
          <filter id="nl-goo">
            {/* Adjust stdDeviation for more/less “melt” */}
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="
                1 0 0 0 0
                0 1 0 0 0
                0 0 1 0 0
                0 0 0 18 -7
              "
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      <div className="gooey" role="status" aria-label="Loading">
        <span className="dot" />
        <div className="dots">
          <span />
          <span />
          <span />
        </div>
      </div>
    </>
  );
};

export default NewtonLoader;

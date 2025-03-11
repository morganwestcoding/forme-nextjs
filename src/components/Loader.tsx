'use client';

import React from 'react';

interface LoaderProps {
  size?: 'small' | 'medium' | 'large';
  startColor?: string;
  endColor?: string;
}

const Loader: React.FC<LoaderProps> = ({ 
  size = 'medium',
  startColor = '#fdfdfd',
  endColor = '#dadada'
}) => {
  // Set dimensions based on size prop
  const getBlockSize = () => {
    switch (size) {
      case 'small':
        return '8px';
      case 'large':
        return '24px';
      case 'medium':
      default:
        return '16px';
    }
  };

  const getMargin = () => {
    switch (size) {
      case 'small':
        return '2px';
      case 'large':
        return '8px';
      case 'medium':
      default:
        return '5px';
    }
  };

  const blockSize = getBlockSize();
  const blockMargin = getMargin();
  const duration = '0.88s';
  const delay = 0.065;

  // Calculate container size
  const containerSize = `calc(${blockSize} * 3 + ${blockMargin} * 2)`;

  // Define keyframes as strings
  const keyframesShow = `
    @keyframes show {
      from, 40% { opacity: 0; }
      41%, to { opacity: 1; }
    }
  `;

  const keyframesPulse = `
    @keyframes pulse {
      from, 40% { background-color: ${startColor}; }
      to { background-color: ${endColor}; }
    }
  `;

  // Define block position styles
  const getPosition = (index: number) => {
    const positions = [
      { top: 0, left: 0 }, // 1
      { top: 0, left: `calc(${blockSize} + ${blockMargin})` }, // 2
      { top: 0, left: `calc(${blockSize} * 2 + ${blockMargin} * 2)` }, // 3
      { top: `calc(${blockSize} + ${blockMargin})`, left: 0 }, // 4
      { top: `calc(${blockSize} + ${blockMargin})`, left: `calc(${blockSize} + ${blockMargin})` }, // 5
      { top: `calc(${blockSize} + ${blockMargin})`, left: `calc(${blockSize} * 2 + ${blockMargin} * 2)` }, // 6
      { top: `calc(${blockSize} * 2 + ${blockMargin} * 2)`, left: 0 }, // 7
      { top: `calc(${blockSize} * 2 + ${blockMargin} * 2)`, left: `calc(${blockSize} + ${blockMargin})` }, // 8
      { top: `calc(${blockSize} * 2 + ${blockMargin} * 2)`, left: `calc(${blockSize} * 2 + ${blockMargin} * 2)` } // 9
    ];

    return positions[index];
  };

  // Define animation delays
  const getAnimationDelay = (index: number) => {
    // In the original code: [2, 9, 4, 6, 3, 8, 7, 5, 1]
    const delayMap = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    
    // Apply custom delay to each block based on their index
    const delayMultipliers = [1, 0, 3, 5, 2, 7, 6, 4, 0]; // The 9th one (0-indexed 8) has no delay
    return `${delayMultipliers[index] * delay}s`;
  };

  return (
    <div style={{ position: 'relative', width: containerSize, height: containerSize }}>
      <style>
        {keyframesShow}
        {keyframesPulse}
      </style>
      {[...Array(9)].map((_, index) => {
        const position = getPosition(index);
        const animationDelay = getAnimationDelay(index);

        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              width: blockSize,
              height: blockSize,
              top: position.top,
              left: position.left,
              opacity: 0,
              backgroundColor: startColor,
              animation: `show ${duration} steps(1, end) infinite alternate, pulse ${duration} linear infinite alternate`,
              animationDelay: animationDelay
            }}
          />
        );
      })}
    </div>
  );
};

export default Loader;
'use client';

import React from 'react';

interface LoaderProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

const Loader: React.FC<LoaderProps> = ({ 
  size = 'medium',
  color = '#60A5FA' // Blue color to match your theme
}) => {
  // Set dimensions based on size prop
  const getDimensions = () => {
    switch (size) {
      case 'small':
        return 'w-6 h-6 border-2';
      case 'large':
        return 'w-12 h-12 border-4';
      case 'medium':
      default:
        return 'w-8 h-8 border-3';
    }
  };

  const dimensions = getDimensions();

  return (
    <div className="flex items-center justify-center">
      <div 
        className={`${dimensions} rounded-full animate-spin`}
        style={{ 
          borderColor: `${color} transparent transparent transparent`,
          borderTopColor: color
        }}
      />
    </div>
  );
};

export default Loader;
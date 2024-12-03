'use client';

import React, { useState } from 'react';
import { categories } from '../Categories';
import { Button } from '../ui/button';
import SendRoundedIcon from '@mui/icons-material/SendRounded';

interface PostCategorySelectProps {
  onCategorySelected: (category: string) => void;
  disabled?: boolean; // Add disabled prop
}

const PostCategorySelect: React.FC<PostCategorySelectProps> = ({
  onCategorySelected,
  disabled = false // Default to false if not provided
}) => {
  const [showCategories, setShowCategories] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleCategorySelect = (category: string) => {
    if (disabled) return; // Prevent selection if disabled
    onCategorySelected(category);
    setShowCategories(false);
  };

  return (
    <div className="relative inline-flex items-center">
      <button 
        className={`
          rounded-md 
          bg-[#ffffff] 
          hover:bg-white 
          text-[#4d4d4d] 
          text-xs 
          font-medium 
          p-3.5 
          py-3.5 
          flex 
          items-center
          transition-opacity
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-opacity-90'}
        `}
        onClick={() => !disabled && setShowCategories(!showCategories)}
        onMouseEnter={() => !disabled && setIsHovered(true)}
        onMouseLeave={() => !disabled && setIsHovered(false)}
        disabled={disabled}
      >
        {showCategories && 
          categories.map((category) => (
            <div 
              key={category.label} 
              className={`
                mr-1 
                w-4 
                h-4 
                rounded-full 
                transition-all 
                duration-700 
                ease-in-out 
                ${category.color}
                ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
              `}
              onClick={(e) => {
                e.stopPropagation();
                handleCategorySelect(category.label);
              }}
              title={category.label}
            />
          ))
        }
        <span className={`
          font-light 
          text-[#717171] 
          px-4
          ${disabled ? 'opacity-50' : ''}
        `}>
          {disabled ? 'Submitting...' : 'Submit'}
        </span>
      </button>
    </div>
  );
};

export default PostCategorySelect;
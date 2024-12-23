// components/inputs/PostCategorySelect.tsx
'use client';

import React, { useState } from 'react';
import { categories } from '../Categories';

interface PostCategorySelectProps {
  onCategorySelected: (category: string) => void;
}

const PostCategorySelect: React.FC<PostCategorySelectProps> = ({
  onCategorySelected,
}) => {
  const [showCategories, setShowCategories] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleCategorySelect = (category: string) => {
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
        `}
        onClick={() => setShowCategories(!showCategories)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {showCategories && categories.map((category) => (
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
              cursor-pointer
            `}
            onClick={(e) => {
              e.stopPropagation();
              handleCategorySelect(category.label);
            }}
            title={category.label}
          />
        ))}
        <span className="font-light  px-4">
          Submit
        </span>
      </button>
    </div>
  );
};

export default PostCategorySelect;
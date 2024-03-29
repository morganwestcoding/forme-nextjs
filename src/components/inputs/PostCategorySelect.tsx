'use client';

import React, { useState } from 'react';
import { categories } from '../Categories'; // Adjust the import path as necessary
import { Button } from '../ui/button'; // Adjust the path as necessary
import SendRoundedIcon from '@mui/icons-material/SendRounded';

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
    
    <Button 
      className=' rounded-xl bg-[#ffffff] border-white border hover:bg-white px-2 py-5 text-[#4d4d4d] shadow-sm text-xs font-medium'
      onClick={() => setShowCategories(!showCategories)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {showCategories && 
      categories.map((category, index) => (
        <div 
          key={category.label} 
          className={`mr-1 w-5 h-5 rounded-full cursor-pointer ${category.color}`}
          onClick={() => handleCategorySelect(category.label)}
          title={category.label} // Tooltip to show the label on hover
        />
      ))
    }
     
      <span className='font-light text-[#717171] px-4'>Submit</span>
    </Button>
  </div>
  );
};

export default PostCategorySelect;

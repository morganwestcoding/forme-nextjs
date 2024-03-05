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
      className='drop-shadow-sm rounded-full bg-[#ffffff] hover:border-[#48DBFB] hover:bg-white border border-transparent px-2 p-2 pr-4 text-[#4d4d4d] text-xs font-medium'
      onClick={() => setShowCategories(!showCategories)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {showCategories && 
      categories.map((category, index) => (
        <div 
          key={category.label} 
          className={`mr-1 w-6 h-6 rounded-full cursor-pointer ${category.color}`}
          onClick={() => handleCategorySelect(category.label)}
          title={category.label} // Tooltip to show the label on hover
        />
      ))
    }
      <div className={`flex items-center justify-center ${isHovered ? 'bg-[#48DBFB]' : 'bg-[#b7b7b7]'} rounded-full p-1 cursor-pointer drop-shadow-sm`}>
        <SendRoundedIcon className={`pl-0.5 w-4 h-4 text-[#ffffff]`} />
      </div>
      <span className='ml-2'>Post</span>
    </Button>
  </div>
  );
};

export default PostCategorySelect;

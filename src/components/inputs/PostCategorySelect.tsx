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
  const [showDropdown, setShowDropdown] = useState(false);

  const handleCategorySelect = (category: string) => {
    onCategorySelected(category);
    setShowDropdown(false);
  };

  return (
    <div className="relative inline-block">
      <Button className='drop-shadow-sm rounded-2xl bg-[#ffffff] border-[#48DBFB] border  hover:bg-slate-100 p-5 py-2 -mb-1 text-[#4d4d4d] text-xs font-medium ' onClick={() => setShowDropdown(!showDropdown)}>
      <div className="flex items-center justify-center bg-[#48DBFB] rounded-full p-1 cursor-pointer drop-shadow-sm -ml-1">
          <SendRoundedIcon className="pl-0.5 w-4 h-4 text-[#ffffff]"/>   
          </div>
        <span className='ml-2'>Submit</span>
      </Button>
      {showDropdown && (
    <div className="absolute left-1/2 transform -translate-x-1/2 w-48 text-xs bg-opacity-90 bg-black p-3 rounded-2xl mt-3 z-[100] grid grid-cols-2 gap-x-2 gap-y-2" >
      {categories.map((category, index) => (
        <div 
          key={category.label} 
          className={`flex items-center justify-center font-medium bg-opacity-95 w-20 hover:bg-gray-100 hover:text-black text-white border-white cursor-pointer rounded-2xl ${category.color} py-3 `}
          // This ensures each category is at least 150px wide
          onClick={() => handleCategorySelect(category.label)}
        >
          {category.label}
        </div>
      ))}
    </div>
  )}
    </div>
  );
};

export default PostCategorySelect;

'use client';

import React, { useState } from 'react';
import { categories } from '../Categories'; // Adjust the import path as necessary
import { Button } from '../ui/button'; // Adjust the path as necessary

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
      <Button className='rounded-xl bg-[#ffffff] drop-shadow hover:bg-slate-100 p-5 py-2 -mb-2 text-black' onClick={() => setShowDropdown(!showDropdown)}>
        Submit
      </Button>
      {showDropdown && (
        <div className="absolute left-1/2 transform -translate-x-1/2 text-xs bg-opacity-90 bg-black p-2 rounded-lg mt-3 z-[100]">
          {categories.map((category) => (
            <div 
              key={category.label} 
              className={`flex items-center justify-center p-2 font-medium bg-opacity-95 hover:bg-gray-100 my-2 hover:text-black text-white gap-4 cursor-pointer rounded-lg ${category.color}`}
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

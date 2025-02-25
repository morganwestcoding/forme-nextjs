// components/inputs/PostCategorySelect.tsx
'use client';

import React, { useState } from 'react';
import { categories } from '../Categories';
import { motion, AnimatePresence } from 'framer-motion';

interface PostCategorySelectProps {
  onCategorySelected: (category: string) => void;
  accentColor?: string;
}

const PostCategorySelect: React.FC<PostCategorySelectProps> = ({ 
  onCategorySelected,
  accentColor = '#0CD498'
}) => {
  const [isCategoryOpen, setCategoryOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const toggleCategoryOpen = () => {
    setCategoryOpen(!isCategoryOpen);
  };

  const handleCategorySelect = (category: string) => {
    onCategorySelected(category);
    setCategoryOpen(false);
  };

  // Button variants
  const buttonVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  };

  // Dropdown variants
  const dropdownVariants = {
    hidden: { opacity: 0, scale: 0.95, y: -10 },
    visible: { opacity: 1, scale: 1, y: 0 }
  };

  return (
    <div className="relative">
      <motion.div
        className="relative"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        variants={buttonVariants}
        initial="rest"
        whileHover="hover"
        whileTap="tap"
      >
        <motion.button
          onClick={toggleCategoryOpen}
          className="flex items-center justify-center rounded-full p-3 transition-colors duration-300 bg-white hover:bg-white/95"
          style={{ 
            boxShadow: '0 1px 8px rgba(0,0,0,0.08)'
          }}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            width="19" 
            height="19" 
            style={{ color: isHovering ? accentColor : '#71717A' }}
            fill="none"
          >
            <path d="M2 6C2 3.79086 3.79086 2 6 2H18C20.2091 2 22 3.79086 22 6V18C22 20.2091 20.2091 22 18 22H6C3.79086 22 2 20.2091 2 18V6Z" stroke="currentColor" strokeWidth="1.5" />
            <path d="M7 12H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M7 8H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M7 16H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {isCategoryOpen && (
          <motion.div
            className="absolute right-0 bottom-full mb-2 z-10"
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.2 }}
          >
            <div className="bg-white rounded-lg shadow-lg p-3 w-60">
              <h3 className="text-sm font-semibold mb-2 text-gray-700">Select a category</h3>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((category) => (
                  <motion.div
                    key={category.label}
                    onClick={() => handleCategorySelect(category.label)}
                    className={`${category.color} text-white text-xs p-2 rounded-md cursor-pointer text-center`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {category.label}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PostCategorySelect;
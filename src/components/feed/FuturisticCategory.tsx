'use client'

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import qs from 'query-string';
import { useRouter, useSearchParams } from "next/navigation";
import { categories } from '@/components/Categories';
import { useColorContext } from '@/app/context/ColorContext';

interface CategoryButtonProps {
  onCategoryChange?: (category: string) => void;
  initialCategory?: string;
}

const CircleSpinner = ({ color, isTransitioning, prevColor }: { 
  color: string, 
  isTransitioning: boolean,
  prevColor: string 
}) => {
  const [showNewColor, setShowNewColor] = useState(false);

  useEffect(() => {
    if (isTransitioning) {
      setShowNewColor(false);
      const timer = setTimeout(() => {
        setShowNewColor(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isTransitioning]);

  const getHexColor = (bgColor: string) => {
    const match = bgColor.match(/#[A-Fa-f0-9]{6}/);
    return match ? match[0] : '#60A5FA'; // Changed default color to gray
  };

  const currentColor = getHexColor(color);
  const previousColor = getHexColor(prevColor);

  // Function to lighten a color
  const lightenColor = (color: string, percent: number): string => {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (
      0x1000000 + 
      (R < 255 ? (R < 0 ? 0 : R) : 255) * 0x10000 + 
      (G < 255 ? (G < 0 ? 0 : G) : 255) * 0x100 + 
      (B < 255 ? (B < 0 ? 0 : B) : 255)
    ).toString(16).slice(1);
  };

  // Darker version for background
  const darkerCurrentColor = lightenColor(currentColor, -40);
  const darkerPreviousColor = lightenColor(previousColor, -40);

  return (
    <div className="relative w-7 h-7">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Dark outline ring */}
        <circle
          cx="12"
          cy="12"
          r="10"
          fill="#121212"
        />
        
        {/* Colored background circle (slightly smaller) with pulse */}
        <motion.circle
          cx="12"
          cy="12"
          r="9"
          animate={{ 
            fill: isTransitioning ? darkerPreviousColor : darkerCurrentColor,
            scale: isTransitioning ? 1 : [0.97, 1, 0.97],
            opacity: isTransitioning ? 1 : [0.8, 1, 0.8]
          }}
          transition={{
            fill: {
              duration: 0.8,
              ease: "easeInOut"
            },
            scale: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            },
            opacity: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
        />

        {/* Pulse rings */}
        {[0, 1, 2].map((index) => (
          <motion.circle
            key={index}
            cx="12"
            cy="12"
            r="10"
            fill="none"
            stroke={isTransitioning ? previousColor : currentColor}
            strokeWidth="1"
            initial={{ scale: 1 }}
            animate={{ 
              scale: [1, 1.15, 1],
              opacity: [0.15, 0, 0.15],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: index * 0.6,
              ease: "easeInOut"
            }}
          />
        ))}

        {/* Main circle outline */}
        <motion.circle
          cx="12"
          cy="12"
          r="9"
          fill="none"
          stroke={currentColor}
          strokeWidth="1.5"
          animate={{ 
            opacity: isTransitioning ? 0 : 1,
            stroke: isTransitioning ? previousColor : currentColor
          }}
          transition={{ 
            duration: 0.3
          }}
        />

        {/* Drawing animation */}
        {isTransitioning && (
          <motion.circle
            cx="12"
            cy="12"
            r="9"
            fill="none"
            stroke={currentColor}
            strokeWidth="1.5"
            strokeDasharray="56.55"
            initial={{ strokeDashoffset: 56.55 }}
            animate={{ 
              strokeDashoffset: 0,
              opacity: [1, 1, 0.8, 1]
            }}
            transition={{
              strokeDashoffset: {
                duration: 0.8,
                ease: "easeInOut"
              },
              opacity: {
                duration: 0.4,
                times: [0, 0.8, 0.9, 1],
                ease: "easeInOut"
              }
            }}
          />
        )}

        {/* Inner dot */}
        <motion.circle
          cx="12"
          cy="12"
          r="3"
          animate={{ 
            fill: showNewColor ? currentColor : previousColor
          }}
          transition={{
            duration: 0.3,
            ease: "easeInOut"
          }}
        />
      </svg>
    </div>
  );
};

const CategoryButton: React.FC<CategoryButtonProps> = ({
  onCategoryChange,
  initialCategory = "Default" // Changed from "All" to "Default"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [prevCategory, setPrevCategory] = useState(initialCategory);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const router = useRouter();
  const params = useSearchParams();
  const { updateAccentColor } = useColorContext();
  const defaultColor = 'bg-[#60A5FA]'; // Changed from #0CD498 to a nice gray

  const handleCategorySelect = useCallback((label: string) => {
    const isSameCategory = params?.get('category') === label || (label === 'Default' && !params?.get('category'));
    
    // Update previous category before changing the selected one
    setPrevCategory(selectedCategory);
    
    // Start transition animation
    setIsTransitioning(true);
    
    // Always update the selectedCategory
    setSelectedCategory(isSameCategory ? 'Default' : label);
    setIsOpen(false);

    setTimeout(() => {
      setIsTransitioning(false);
    }, 1100);

    let currentQuery = {};
    if (params) {
      currentQuery = qs.parse(params.toString());
    }

    const updatedQuery: any = {
      ...currentQuery
    };
    
    // Handle repeated category selection - reset to Default and default color
    if (isSameCategory) {
      delete updatedQuery.category;
      updateAccentColor(defaultColor);
      // Force reset the selected category to "Default"
      setSelectedCategory('Default');
      setPrevCategory(label);
    } else if (label === 'Default') {
      // Special handling for "Default" category - remove the category param entirely
      delete updatedQuery.category;
      // Set default color when "Default" is selected
      updateAccentColor(defaultColor);
    } else {
      updatedQuery.category = label;
      
      // Update global accent color based on category
      const categoryData = categories.find(cat => cat.label === label);
      if (categoryData) {
        updateAccentColor(categoryData.color);
      }
    }

    const url = qs.stringifyUrl({
      url: '/',
      query: updatedQuery
    }, { skipNull: true });

    router.push(url);
    if (onCategoryChange) onCategoryChange(isSameCategory ? 'Default' : label);
  }, [router, params, onCategoryChange, selectedCategory, updateAccentColor]);

  // Use the default color if "Default" is selected or if it's the same category selected twice
  const selectedCategoryColor = selectedCategory === 'Default' 
    ? defaultColor
    : categories.find(c => c.label === selectedCategory)?.color || defaultColor;
    
  const prevCategoryColor = prevCategory === 'Default'
    ? defaultColor 
    : categories.find(c => c.label === prevCategory)?.color || defaultColor;

  return (
    <div className="relative">
      <motion.div
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center justify-between bg-[#4A5568] rounded-lg shadow-md w-36 px-4 py-2">
          <div className="text-white text-sm mr-2 truncate">
            {selectedCategory}
          </div>
          
          <div className="relative flex-shrink-0">
            <CircleSpinner 
              color={selectedCategoryColor}
              prevColor={prevCategoryColor}
              isTransitioning={isTransitioning}
            />
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-2 w-[300px] bg-white rounded-lg shadow-xl p-3 z-50"
          >
            <div className="grid grid-cols-3 gap-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCategorySelect('Default')}
                className="bg-[#60A5FA] p-2 rounded-lg cursor-pointer text-center" // Changed color
              >
                <span className="text-white text-sm">Default</span>
              </motion.div>

              {categories.map((category) => (
                <motion.div
                  key={category.label}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleCategorySelect(category.label)}
                  className={`
                    ${category.color}
                    p-2
                    rounded-lg
                    cursor-pointer
                    text-center
                  `}
                >
                  <span className="text-white text-sm">
                    {category.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CategoryButton;
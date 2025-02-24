'use client'

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import qs from 'query-string';
import { useRouter, useSearchParams } from "next/navigation";
import { categories } from '@/components/Categories';

interface CategoryButtonProps {
  onCategoryChange?: (category: string) => void;
  initialCategory?: string;
}

const CircleSpinner = ({ color, isTransitioning }: { color: string, isTransitioning: boolean }) => {
  // Convert bg-color to actual color
  const getColor = (bgColor: string) => {
    const colorMap: { [key: string]: string } = {
      'bg-gray-500': '#6B7280',
      'bg-red-500': '#EF4444',
      'bg-blue-500': '#3B82F6',
      'bg-green-500': '#22C55E',
      'bg-yellow-500': '#EAB308',
      'bg-purple-500': '#A855F7',
      'bg-pink-500': '#EC4899',
    };
    return colorMap[bgColor] || '#6B7280';
  };

  const actualColor = getColor(color);

  return (
    <div className="relative w-8 h-8">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={isTransitioning ? "animate-spin" : ""}
      >
        {/* Outer spinner */}
        <motion.path
          d="M12 2C13.3132 2 14.6136 2.25866 15.8268 2.76121C17.0401 3.26375 18.1425 4.00035 19.0711 4.92893C19.9997 5.85752 20.7362 6.95991 21.2388 8.17317C21.7413 9.38642 22 10.6868 22 12"
          stroke={actualColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ 
            pathLength: isTransitioning ? [0, 1] : 1,
            rotate: isTransitioning ? [0, 360] : 0
          }}
          transition={{
            duration: 0.8,
            ease: "easeInOut",
            repeat: isTransitioning ? Infinity : 0
          }}
        />

        {/* Inner circle that fills with color */}
        <motion.circle
          cx="12"
          cy="12"
          r="6"
          fill={actualColor}
          initial={{ scale: 0 }}
          animate={{ 
            scale: isTransitioning ? [0.6, 1, 0.6] : 1,
            opacity: isTransitioning ? [0.5, 1, 0.5] : 1
          }}
          transition={{
            duration: 1.5,
            repeat: isTransitioning ? Infinity : 0,
            ease: "easeInOut"
          }}
        />
      </svg>
    </div>
  );
};

const CategoryButton: React.FC<CategoryButtonProps> = ({
  onCategoryChange,
  initialCategory = "All"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const router = useRouter();
  const params = useSearchParams();

  const handleCategorySelect = useCallback((label: string) => {
    setIsTransitioning(true);
    setSelectedCategory(label);
    setIsOpen(false);

    // Stop the transition animation after 1 second
    setTimeout(() => {
      setIsTransitioning(false);
    }, 1000);

    let currentQuery = {};
    if (params) {
      currentQuery = qs.parse(params.toString());
    }

    const updatedQuery: any = {
      ...currentQuery,
      category: label
    };

    if (params?.get('category') === label) {
      delete updatedQuery.category;
    }

    const url = qs.stringifyUrl({
      url: '/',
      query: updatedQuery
    }, { skipNull: true });

    router.push(url);
    if (onCategoryChange) onCategoryChange(label);
  }, [router, params, onCategoryChange]);

  const selectedCategoryColor = categories.find(c => c.label === selectedCategory)?.color || 'bg-gray-500';

  return (
    <div className="relative">
      <motion.div
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Fixed width button */}
        <div className="flex items-center justify-between bg-white rounded-lg shadow-md w-48 px-4 py-2">
          {/* Category label */}
          <div className="font-medium text-gray-800 truncate">
            {selectedCategory}
          </div>
          
          {/* Circle Spinner */}
          <div className="relative flex-shrink-0">
            <CircleSpinner 
              color={selectedCategoryColor} 
              isTransitioning={isTransitioning}
            />
          </div>
        </div>
      </motion.div>

      {/* Dropdown menu */}
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
                onClick={() => handleCategorySelect('All')}
                className="bg-gray-500 p-2 rounded-lg cursor-pointer text-center"
              >
                <span className="text-white text-sm">All</span>
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
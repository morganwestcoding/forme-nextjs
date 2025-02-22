'use client'

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import qs from 'query-string';
import { useRouter, useSearchParams } from "next/navigation";
import { categories } from '@/components/Categories';

interface FuturisticCategoryProps {
  onCategoryChange?: (category: string) => void;
  initialCategory?: string;
}

const FuturisticCategory: React.FC<FuturisticCategoryProps> = ({
  onCategoryChange,
  initialCategory = "All"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const router = useRouter();
  const params = useSearchParams();

  const handleCategorySelect = useCallback((label: string) => {
    setSelectedCategory(label);
    setIsOpen(false);

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
  const colorWithoutBg = selectedCategoryColor.replace('bg-', '');

  return (
    <div className="relative">
      <motion.div
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-lg cursor-pointer relative group overflow-hidden"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Main button container */}
        <div className={`
          flex items-center gap-3 px-4 py-2.5 
          bg-gray-900 border border-gray-700
          min-w-[160px] relative
        `}>
          {/* Animated color indicator */}
          <motion.div
            className={`w-3 h-3 rounded-full ${selectedCategoryColor}`}
            initial={{ scale: 0.8 }}
            animate={{
              scale: [0.8, 1.1, 0.8],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: `radial-gradient(circle, ${colorWithoutBg}, transparent)`,
                filter: "blur(6px)"
              }}
              animate={{
                opacity: [0.4, 0.7, 0.4]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>

          {/* Category text */}
          <span className="text-white text-sm font-medium">
            {selectedCategory}
          </span>

          {/* Animated borders */}
          <motion.div
            className="absolute inset-0 rounded-lg"
            style={{
              background: `linear-gradient(90deg, transparent, ${colorWithoutBg}, transparent)`,
              filter: "blur(2px)"
            }}
            animate={{
              opacity: [0.1, 0.3, 0.1],
              scale: [1, 1.02, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
      </motion.div>

      {/* Dropdown menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="absolute top-full left-0 mt-2 w-[300px] bg-gray-900 rounded-lg shadow-xl p-3 z-50 border border-gray-700"
          >
            <div className="grid grid-cols-3 gap-2">
              <motion.div
                whileHover={{ scale: 1.05, opacity: 0.9 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCategorySelect('All')}
                className="bg-gray-500 p-2 rounded-lg cursor-pointer text-center transition-all duration-300 relative overflow-hidden"
              >
                <motion.div
                  className="absolute inset-0 bg-white opacity-10"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.1, 0.2, 0.1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <span className="text-white text-sm relative z-10">All</span>
              </motion.div>

              {categories.map((category) => (
                <motion.div
                  key={category.label}
                  whileHover={{ scale: 1.05, opacity: 0.9 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleCategorySelect(category.label)}
                  className={`
                    ${category.color}
                    p-2
                    rounded-lg
                    cursor-pointer
                    text-center
                    transition-all
                    duration-300
                    relative
                    overflow-hidden
                  `}
                >
                  <motion.div
                    className="absolute inset-0 bg-white opacity-10"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.1, 0.2, 0.1]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <span className="text-white text-sm relative z-10">
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

export default FuturisticCategory;
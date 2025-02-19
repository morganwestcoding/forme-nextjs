'use client';

import { useState, useCallback } from 'react';
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
      currentQuery = qs.parse(params.toString())
    }

    const updatedQuery: any = {
      ...currentQuery,
      category: label
    }

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

  const selectedCategoryColor = categories.find(c => c.label === selectedCategory)?.color || 'bg-gray-200';

  return (
    <div className="relative">
      {/* Selected Category Display */}
      <motion.div
  onClick={() => setIsOpen(!isOpen)}
  className={`
    ${selectedCategoryColor}
    rounded-md
    p-3
    px-4
    cursor-pointer
    flex
    items-center
    justify-between
    group
    shadow-sm
    transition-all
    duration-1000
    w-[120px]
  `}
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
>
  <span className="text-white text-sm truncate">{selectedCategory}</span>
  <motion.div
    animate={{ rotate: isOpen ? 180 : 0 }}
    transition={{ duration: 0.3 }}
  >
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="16" 
      height="16" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="white" 
      strokeWidth="2"
    >
      <path d="M6 9l6 6 6-6"/>
    </svg>
  </motion.div>
</motion.div>
      {/* Dropdown */}
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
                    transition-all
                    duration-300
                  `}
                >
                  <span className="text-white text-sm">{category.label}</span>
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
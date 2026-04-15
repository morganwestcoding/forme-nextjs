'use client';

import { motion } from 'framer-motion';
import TypeformHeading from '@/components/registration/TypeformHeading';
import { itemVariants } from '@/components/registration/TypeformStep';
import { categories } from '@/components/Categories';

interface CategoryStepProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function CategoryStep({ selectedCategory, onCategoryChange }: CategoryStepProps) {
  return (
    <div>
      <TypeformHeading
        question="What type of business is this?"
        subtitle="Select a category that best describes your establishment"
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {categories.map((item) => {
          const isSelected = selectedCategory === item.label;
          return (
            <motion.button
              key={item.label}
              type="button"
              onClick={() => onCategoryChange(item.label)}
              variants={itemVariants}
              whileTap={{ scale: 0.98 }}
              className={`
                p-4 rounded-xl border text-left transition-colors duration-200
                ${isSelected
                  ? 'border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]'
                  : 'border-stone-200  bg-white dark:bg-stone-900 hover:border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 '
                }
              `}
            >
              <span className="text-sm font-medium block text-stone-900 dark:text-stone-100">
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

'use client';

import { motion } from 'framer-motion';
import TypeformHeading from '../TypeformHeading';
import { itemVariants } from '../TypeformStep';
import { categories } from '@/components/Categories';

interface ListingCategoryStepProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function ListingCategoryStep({ selectedCategory, onCategoryChange }: ListingCategoryStepProps) {
  return (
    <div>
      <TypeformHeading
        question="What type of services do you offer?"
        subtitle="Choose a category that best describes your work"
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {categories.map((category, index) => {
          const isSelected = selectedCategory === category.label;
          return (
            <motion.button
              key={category.label}
              type="button"
              onClick={() => onCategoryChange(category.label)}
              variants={itemVariants}
              whileTap={{ scale: 0.97 }}
              className={`
                p-4 rounded-xl border text-center transition-all duration-200
                ${isSelected
                  ? 'border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]'
                  : 'border-stone-200  bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 hover:border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 '
                }
              `}
            >
              <span className="text-sm font-medium">{category.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

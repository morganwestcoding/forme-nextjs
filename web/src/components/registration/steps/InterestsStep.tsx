'use client';

import { motion } from 'framer-motion';
import TypeformHeading from '../TypeformHeading';
import { itemVariants } from '../TypeformStep';
import { categories } from '@/components/Categories';

interface InterestsStepProps {
  selectedInterests: string[];
  onInterestsChange: (interests: string[]) => void;
}

export default function InterestsStep({ selectedInterests, onInterestsChange }: InterestsStepProps) {
  const toggleInterest = (label: string) => {
    if (selectedInterests.includes(label)) {
      onInterestsChange(selectedInterests.filter(i => i !== label));
    } else {
      onInterestsChange([...selectedInterests, label]);
    }
  };

  return (
    <div>
      <TypeformHeading
        question="What are you interested in?"
        subtitle="Select all that apply. This helps us personalize your experience."
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {categories.map((category) => {
          const isSelected = selectedInterests.includes(category.label);
          return (
            <motion.button
              key={category.label}
              type="button"
              onClick={() => toggleInterest(category.label)}
              variants={itemVariants}
              whileTap={{ scale: 0.97 }}
              style={{ WebkitTapHighlightColor: 'transparent' }}
              className={`
                p-4 rounded-xl border text-left
                transition-[background-color,border-color,box-shadow,color] duration-200 ease-out
                focus:outline-none
                ${isSelected
                  ? 'border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]'
                  : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-[inset_0_0_0_rgba(0,0,0,0)] hover:border-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
                }
              `}
            >
              <span className="text-sm font-medium">{category.label}</span>
            </motion.button>
          );
        })}
      </div>

      <motion.p variants={itemVariants} className="text-sm text-stone-400 dark:text-stone-500 text-center mt-6">
        Optional — you can skip this step
      </motion.p>
    </div>
  );
}

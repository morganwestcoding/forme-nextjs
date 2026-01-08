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
              className={`
                p-4 rounded-xl border text-left transition-colors duration-200
                ${isSelected
                  ? 'border-gray-300 bg-gray-100 text-gray-900 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]'
                  : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              <span className="text-sm font-medium">{category.label}</span>
            </motion.button>
          );
        })}
      </div>

      <motion.p variants={itemVariants} className="text-sm text-gray-400 text-center mt-6">
        Optional — you can skip this step
      </motion.p>
    </div>
  );
}

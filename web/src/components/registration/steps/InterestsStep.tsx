'use client';

import TypeformHeading from '../TypeformHeading';
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
            <button
              key={category.label}
              type="button"
              onClick={() => toggleInterest(category.label)}
              style={{ WebkitTapHighlightColor: 'transparent', willChange: 'box-shadow, background-color, border-color' }}
              className={`
                p-4 rounded-xl border text-left
                transition-[background-color,border-color,box-shadow] duration-200 ease-out
                focus:outline-none
                ${isSelected
                  ? 'border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-inset-pressed'
                  : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-none hover:border-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
                }
              `}
            >
              <span className="text-sm font-medium">{category.label}</span>
            </button>
          );
        })}
      </div>

      <p className="text-sm text-stone-400 dark:text-stone-500 text-center mt-6">
        Optional — you can skip this step
      </p>
    </div>
  );
}

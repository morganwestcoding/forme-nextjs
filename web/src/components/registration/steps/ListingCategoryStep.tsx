'use client';

import TypeformHeading from '../TypeformHeading';
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
        {categories.map((category) => {
          const isSelected = selectedCategory === category.label;
          return (
            <button
              key={category.label}
              type="button"
              onClick={() => onCategoryChange(category.label)}
              style={{ WebkitTapHighlightColor: 'transparent', willChange: 'box-shadow, background-color, border-color' }}
              className={`
                p-4 rounded-xl border text-center
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
    </div>
  );
}

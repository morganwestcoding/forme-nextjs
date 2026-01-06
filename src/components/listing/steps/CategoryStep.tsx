'use client';

import TypeformHeading from '@/components/registration/TypeformHeading';
import CategoryInput from '@/components/inputs/CategoryInput';
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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {categories.map((item) => (
          <CategoryInput
            key={item.label}
            onClick={(category) => onCategoryChange(category)}
            selected={selectedCategory === item.label}
            label={item.label}
          />
        ))}
      </div>
    </div>
  );
}

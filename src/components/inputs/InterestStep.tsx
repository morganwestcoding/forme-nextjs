'use client';

import Heading from "../Heading";
import { Check } from "lucide-react";

interface InterestsStepProps {
  selectedInterests: string[];
  onInterestsChange: (interests: string[]) => void;
  isLoading: boolean;
}

const categories = [
  // Service categories
  { label: 'Massage', color: 'bg-[#D4B185]' },
  { label: 'Wellness', color: 'bg-[#C4D4A9]' },
  { label: 'Fitness', color: 'bg-[#86A4BB]' },
  { label: 'Nails', color: 'bg-[#E5B9AD]' },
  { label: 'Spa', color: 'bg-[#D8C3CE]' },
  { label: 'Barber', color: 'bg-[#D6C3B6]' },
  { label: 'Beauty', color: 'bg-[#E6C9B3]' },
  { label: 'Salon', color: 'bg-[#B3C5D1]' },
  
  // Product categories
  { label: 'Clothing', color: 'bg-[#A8C5DD]' },
  { label: 'Accessories', color: 'bg-[#E8B5C3]' },
  { label: 'Electronics', color: 'bg-[#9DB5C8]' },
  { label: 'Home & Garden', color: 'bg-[#B8D4B8]' },
  { label: 'Sports & Outdoors', color: 'bg-[#8EADC4]' },
  { label: 'Toys & Games', color: 'bg-[#F5C6A5]' },
  { label: 'Books & Media', color: 'bg-[#C9B8D4]' },
];

const InterestsStep: React.FC<InterestsStepProps> = ({
  selectedInterests,
  onInterestsChange,
  isLoading
}) => {
  const toggleInterest = (label: string) => {
    if (selectedInterests.includes(label)) {
      onInterestsChange(selectedInterests.filter(i => i !== label));
    } else {
      onInterestsChange([...selectedInterests, label]);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <Heading
        title="What interests you?"
        subtitle="Select the categories you'd like to see in your feed"
      />
      
      <div className="flex flex-wrap gap-3 justify-center max-h-[400px]  px-2">
        {categories.map((category) => {
          const isSelected = selectedInterests.includes(category.label);
          
          return (
            <button
              key={category.label}
              type="button"
              onClick={() => !isLoading && toggleInterest(category.label)}
              disabled={isLoading}
              className={`
                relative px-6 py-3 rounded-full font-medium text-sm
                transition-all duration-200 transform
                ${isSelected 
                  ? `${category.color} scale-105 shadow-lg ring-2 ring-offset-2 ring-black/20` 
                  : 'bg-neutral-100 hover:bg-neutral-200 hover:scale-105'
                }
                ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                active:scale-95
              `}
            >
              <span className={`${isSelected ? 'text-white' : 'text-neutral-700'}`}>
                {category.label}
              </span>
              
              {isSelected && (
                <span className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-md">
                  <Check className="w-4 h-4 text-black" strokeWidth={3} />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {selectedInterests.length > 0 && (
        <div className="text-center">
          <p className="text-sm text-neutral-500">
            {selectedInterests.length} {selectedInterests.length === 1 ? 'interest' : 'interests'} selected
          </p>
        </div>
      )}

      {selectedInterests.length === 0 && (
        <div className="text-center">
          <p className="text-xs text-neutral-400">
            Select at least one interest to personalize your experience
          </p>
        </div>
      )}
    </div>
  );
};

export default InterestsStep;
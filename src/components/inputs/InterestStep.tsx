'use client';

import Heading from "../Heading";
import { Check } from "lucide-react";
import { useTheme } from "@/app/context/ThemeContext";

interface InterestsStepProps {
  selectedInterests: string[];
  onInterestsChange: (interests: string[]) => void;
  isLoading: boolean;
}

const categories = [
  'Massage', 'Wellness', 'Fitness', 'Nails', 'Spa', 'Barber', 'Beauty', 'Salon',
  'Clothing', 'Accessories', 'Electronics', 'Home & Garden', 'Sports', 'Toys & Games', 'Books & Media',
];

const InterestsStep: React.FC<InterestsStepProps> = ({
  selectedInterests,
  onInterestsChange,
  isLoading
}) => {
  const { accentColor } = useTheme();

  // Calculate a slightly darker shade for the gradient (same as VerificationBadge)
  const getDarkerShade = (hex: string): string => {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = -20;
    const R = Math.max(0, Math.min(255, (num >> 16) + Math.round(2.55 * amt)));
    const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + Math.round(2.55 * amt)));
    const B = Math.max(0, Math.min(255, (num & 0x0000FF) + Math.round(2.55 * amt)));
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
  };

  const darkerColor = getDarkerShade(accentColor);

  const toggleInterest = (label: string) => {
    if (selectedInterests.includes(label)) {
      onInterestsChange(selectedInterests.filter(i => i !== label));
    } else {
      onInterestsChange([...selectedInterests, label]);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Heading
        title="What interests you?"
        subtitle="Select categories to personalize your feed"
      />

      <div className="grid grid-cols-2 gap-1">
        {categories.map((label) => {
          const isSelected = selectedInterests.includes(label);

          return (
            <button
              key={label}
              type="button"
              onClick={() => !isLoading && toggleInterest(label)}
              disabled={isLoading}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-md text-left
                transition-colors duration-100
                ${isSelected
                  ? 'bg-neutral-100'
                  : 'hover:bg-neutral-50'
                }
                ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div
                className={`
                  w-4 h-4 rounded flex items-center justify-center flex-shrink-0
                  transition-all duration-100 border
                  ${!isSelected ? 'border-neutral-300' : ''}
                `}
                style={isSelected ? {
                  background: `linear-gradient(to bottom, ${accentColor}, ${darkerColor})`,
                  borderColor: darkerColor
                } : undefined}
              >
                {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={2.5} />}
              </div>
              <span className="text-sm text-neutral-700">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default InterestsStep;

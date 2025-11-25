'use client';

import React, { memo } from 'react';
import { Waves, Anchor, Rocket, Palette, Droplet, User } from 'lucide-react';

interface CategoryInputProps {
  label: string;
  selected?: boolean;
  onClick: (value: string) => void;
}

/**
 * Map category labels to icons.
 * Keep this outside the component to avoid re-creation on every render.
 */
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Massage: Waves,
  Wellness: Anchor,
  Fitness: Rocket,
  Nails: Palette,
  Spa: Droplet,
  Barber: User,
  Beauty: Palette,
  Salon: Waves,
};

const CategoryInputBase: React.FC<CategoryInputProps> = ({ label, selected, onClick }) => {
  const Icon = iconMap[label] || Waves;

  return (
    <button
      type="button"
      onClick={() => onClick(label)}
      className={`
        group relative overflow-hidden
        rounded-xl flex flex-col items-center justify-center gap-2.5 p-4
        cursor-pointer select-none
        transition-all duration-300 ease-out
        will-change-transform transform-gpu
        focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#60A5FA]
        ${selected
          ? 'bg-gradient-to-br from-[#60A5FA] to-[#3b82f6] text-white shadow-md hover:shadow-lg border border-[#60A5FA]/50'
          : 'bg-white border border-gray-300 text-gray-600 hover:border-gray-400 hover:shadow-sm hover:text-gray-700'
        }
      `}
    >
      <div className="relative z-10 flex flex-col items-center gap-2">
        {/* Icon container - simpler, cleaner */}
        <div className={`
          transition-all duration-300
          ${selected
            ? 'text-white'
            : 'text-gray-500 group-hover:text-[#60A5FA]'
          }
        `}>
          <Icon
            className="w-5 h-5 transition-transform duration-300 ease-out group-hover:scale-110 transform-gpu"
          />
        </div>

        {/* Label */}
        <span
          className={`
            text-xs font-medium leading-tight
            transition-all duration-300 ease-out
            ${selected ? 'text-white' : 'text-gray-700 group-hover:text-gray-900'}
            transform-gpu
          `}
        >
          {label}
        </span>
      </div>
    </button>
  );
};

/**
 * Memoize to avoid unnecessary re-renders from parent state churn.
 * Re-render only when `label` or `selected` changes.
 */
const CategoryInput = memo(
  CategoryInputBase,
  (prev, next) => prev.label === next.label && prev.selected === next.selected
);

export default CategoryInput;

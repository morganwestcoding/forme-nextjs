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
        rounded-xl shadow flex flex-col items-center justify-center p-4 space-y-2
        cursor-pointer select-none
        transition-[transform,background-color,color] duration-200 ease-out
        ${selected ? 'bg-[#60A5FA] text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-blue-50'}
        will-change-transform transform-gpu
        focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#60A5FA]
      `}
    >
      <Icon
        className={`
          w-5 h-5
          transition-transform duration-200 ease-out
          ${selected ? 'scale-110' : 'scale-100'}
          transform-gpu
        `}
      />
      <span
        className={`
          text-xs leading-none
          transition-transform duration-200 ease-out
          ${selected ? 'scale-105' : 'scale-100'}
          transform-gpu
        `}
      >
        {label}
      </span>
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

'use client';

import React, { memo } from 'react';
import {
  WavingHand01Icon,
  Yoga01Icon,
  Dumbbell01Icon,
  PaintBrush01Icon,
  HotTubeIcon,
  ChairBarberIcon,
  SparklesIcon,
  HairDryerIcon,
} from 'hugeicons-react';
import { useTheme } from '@/app/context/ThemeContext';

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
  Massage: WavingHand01Icon,
  Wellness: Yoga01Icon,
  Fitness: Dumbbell01Icon,
  Nails: PaintBrush01Icon,
  Spa: HotTubeIcon,
  Barber: ChairBarberIcon,
  Beauty: SparklesIcon,
  Salon: HairDryerIcon,
};

const CategoryInputBase: React.FC<CategoryInputProps> = ({ label, selected, onClick }) => {
  const Icon = iconMap[label] || SparklesIcon;
  const { accentColor } = useTheme();

  // Calculate a darker shade for the gradient
  const getDarkerShade = (hex: string): string => {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = -20;
    const R = Math.max(0, Math.min(255, (num >> 16) + Math.round(2.55 * amt)));
    const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + Math.round(2.55 * amt)));
    const B = Math.max(0, Math.min(255, (num & 0x0000FF) + Math.round(2.55 * amt)));
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
  };

  const darkerColor = getDarkerShade(accentColor);

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
        focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
        ${selected
          ? 'text-white shadow-md hover:shadow-lg'
          : 'bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-600 text-gray-600 dark:text-gray-300 hover:border-gray-400 hover:shadow-sm hover:text-gray-700 dark:hover:text-white'
        }
      `}
      style={selected ? {
        background: `linear-gradient(to bottom right, ${accentColor}, ${darkerColor})`,
        borderColor: `${accentColor}80`
      } : undefined}
    >
      <div className="relative z-10 flex flex-col items-center gap-2">
        {/* Icon container - simpler, cleaner */}
        <div
          className={`
            transition-all duration-300
            ${selected ? 'text-white' : 'text-gray-500 dark:text-gray-400'}
          `}
          style={!selected ? undefined : undefined}
          onMouseEnter={(e) => {
            if (!selected) {
              e.currentTarget.style.color = accentColor;
            }
          }}
          onMouseLeave={(e) => {
            if (!selected) {
              e.currentTarget.style.color = '';
            }
          }}
        >
          <Icon
            className="w-5 h-5 transition-transform duration-300 ease-out group-hover:scale-110 transform-gpu"
          />
        </div>

        {/* Label */}
        <span
          className={`
            text-xs font-medium leading-tight
            transition-all duration-300 ease-out
            ${selected ? 'text-white' : 'text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white'}
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

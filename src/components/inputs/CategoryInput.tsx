'use client';

import { Waves, Anchor, Rocket, Palette, Droplet, User } from 'lucide-react';
import React from 'react';

interface CategoryInputProps {
  label: string;
  selected?: boolean;
  onClick: (value: string) => void;
}

const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  Massage: Waves,
  Wellness: Anchor,
  Fitness: Rocket,
  Nails: Palette,
  Spa: Droplet,
  Barber: User,
  Beauty: Palette,
  Salon: Waves,
};

const CategoryInput: React.FC<CategoryInputProps> = ({
  label,
  selected,
  onClick,
}) => {
  const Icon = iconMap[label] || Waves;

  return (
    <div
      onClick={() => onClick(label)}
      className={`
        rounded-xl
        shadow
        flex
        flex-col
        items-center
        justify-center
        p-4
        space-y-2
        transition-all
        duration-300
        cursor-pointer
        ${selected
          ? 'bg-[#60A5FA] text-white'
          : 'bg-neutral-100 text-neutral-600 hover:bg-blue-50'}
      `}
    >
      <Icon
        className={`
          w-5
          h-5
          transition
          ${selected ? 'scale-110' : 'scale-100'}
        `}
      />
      <span
        className={`
          text-xs
          transition
          ${selected ? 'scale-105' : 'scale-100'}
        `}
      >
        {label}
      </span>
    </div>
  );
};

export default CategoryInput;

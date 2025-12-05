'use client';

import React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useTheme } from '@/app/context/ThemeContext';

const directionalCategories = [
  { label: 'Incoming', value: 'incoming', isDirection: true },
  { label: 'Outgoing', value: 'outgoing', isDirection: true },
];

const statusCategories = [
  { label: 'Pending', value: 'pending', isDirection: false },
  { label: 'Confirmed', value: 'confirmed', isDirection: false },
  { label: 'Completed', value: 'completed', isDirection: false },
  { label: 'Cancelled', value: 'cancelled', isDirection: false },
  { label: 'Overdue', value: 'overdue', isDirection: false },
];

interface CategoryNavProps {
  selectedCategories?: string[];
  onCategorySelect?: (category: string) => void;
}

const CategoryNav: React.FC<CategoryNavProps> = ({
  selectedCategories: propSelectedCategories,
  onCategorySelect,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const { accentColor } = useTheme();

  const activeCategories = params?.get('categories')?.split(',').filter(Boolean) || propSelectedCategories || [];

  const handleCategorySelect = (categoryValue: string) => {
    const current = new URLSearchParams(Array.from(params?.entries() || []));
    const currentCategories = current.get('categories')?.split(',').filter(Boolean) || [];

    const isDirectional = ['incoming', 'outgoing'].includes(categoryValue);

    let newCategories;

    if (isDirectional) {
      if (currentCategories.includes(categoryValue)) {
        newCategories = currentCategories.filter(cat => !['incoming', 'outgoing'].includes(cat));
      } else {
        newCategories = currentCategories.filter(cat => !['incoming', 'outgoing'].includes(cat));
        newCategories.push(categoryValue);
      }
    } else {
      if (currentCategories.includes(categoryValue)) {
        newCategories = currentCategories.filter(cat => !statusCategories.some(status => status.value === cat));
      } else {
        newCategories = currentCategories.filter(cat => !statusCategories.some(status => status.value === cat));
        newCategories.push(categoryValue);
      }
    }

    if (newCategories.length > 0) {
      current.set('categories', newCategories.join(','));
    } else {
      current.delete('categories');
    }

    const search = current.toString();
    const queryString = search ? `?${search}` : '';
    router.push(`${pathname}${queryString}`);

    onCategorySelect?.(categoryValue);
  };

  const allCategories = [...directionalCategories, ...statusCategories];

  return (
    <div className="flex items-center sm:justify-center gap-1.5 py-2 sm:py-3 overflow-x-auto scrollbar-hide -mx-2 px-2 sm:mx-0 sm:px-0">
      {allCategories.map((category) => {
        const isSelected = activeCategories.includes(category.value);

        return (
          <button
            key={category.value}
            onClick={() => handleCategorySelect(category.value)}
            className={`
              relative px-3 sm:px-4 py-1 sm:py-1.5 text-[12px] sm:text-[13px] font-medium rounded-lg sm:rounded-xl border transition-all duration-300 ease-out active:scale-[0.97] whitespace-nowrap flex-shrink-0
              ${isSelected
                ? 'text-white'
                : 'bg-transparent border-neutral-300 dark:border-neutral-600 text-neutral-500 dark:text-neutral-400'
              }
            `}
            style={isSelected ? {
              backgroundColor: accentColor,
              borderColor: accentColor,
              boxShadow: `0 4px 6px -1px ${accentColor}40`,
              color: 'white'
            } : undefined}
            onMouseEnter={(e) => {
              if (!isSelected) {
                e.currentTarget.style.borderColor = accentColor;
                e.currentTarget.style.color = accentColor;
                e.currentTarget.style.backgroundColor = `${accentColor}0D`;
              }
            }}
            onMouseLeave={(e) => {
              if (!isSelected) {
                e.currentTarget.style.borderColor = '';
                e.currentTarget.style.color = '';
                e.currentTarget.style.backgroundColor = '';
              }
            }}
            type="button"
          >
            <span className="relative z-10">{category.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default CategoryNav;

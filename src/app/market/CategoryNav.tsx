'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { categories } from '@/components/Categories';
import { useTheme } from '@/app/context/ThemeContext';

interface CategoryNavProps {
  searchParams: {
    category?: string;
  };
  basePath?: string;  // Optional base path for navigation (default: '/market')
}

const CategoryNav: React.FC<CategoryNavProps> = ({ searchParams, basePath = '/market' }) => {
  const router = useRouter();
  const params = useSearchParams();
  const { accentColor } = useTheme();

  const currentCategory = searchParams.category || '';

  // Toggle: select to set; click again to clear (show all)
  const handleCategorySelect = (categoryLabel: string) => {
    const current = new URLSearchParams(Array.from(params?.entries() || []));

    if (currentCategory === categoryLabel) {
      current.delete('category');
    } else {
      current.set('category', categoryLabel);
    }

    const search = current.toString();
    const query = search ? `?${search}` : '';
    router.push(`${basePath}${query}`);
  };

  return (
    <div className="flex items-center sm:justify-center gap-1.5 py-2 sm:py-3 overflow-x-auto scrollbar-hide -mx-2 px-2 sm:mx-0 sm:px-0">
      {categories.map((category) => {
        const isSelected = currentCategory === category.label;

        return (
          <button
            key={category.label}
            onClick={() => handleCategorySelect(category.label)}
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

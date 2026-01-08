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
  const { accentColor, isDarkMode } = useTheme();

  // Support both single category (legacy) and multiple categories
  const currentCategories = params?.get('categories')?.split(',').filter(Boolean) ||
    (searchParams.category ? [searchParams.category] : []);

  // Toggle: click to add/remove from selection
  const handleCategorySelect = (categoryLabel: string) => {
    const current = new URLSearchParams(Array.from(params?.entries() || []));

    let newCategories: string[];
    if (currentCategories.includes(categoryLabel)) {
      // Remove from selection
      newCategories = currentCategories.filter(cat => cat !== categoryLabel);
    } else {
      // Add to selection
      newCategories = [...currentCategories, categoryLabel];
    }

    // Update URL params
    current.delete('category'); // Remove legacy single category param
    if (newCategories.length > 0) {
      current.set('categories', newCategories.join(','));
    } else {
      current.delete('categories');
    }

    const search = current.toString();
    const query = search ? `?${search}` : '';
    router.push(`${basePath}${query}`);
  };

  return (
    <div className="relative flex items-center justify-center py-2 sm:py-3 -mx-2 px-2 sm:mx-0 sm:px-0">
      {/* Categories - centered */}
      <div className="flex items-center justify-center gap-1.5 overflow-x-auto scrollbar-hide pt-1 pb-3 -mb-2 px-4">
        {categories.map((category) => {
          const isSelected = currentCategories.includes(category.label);

          return (
            <button
              key={category.label}
              onClick={() => handleCategorySelect(category.label)}
              className={`
                relative px-3 sm:px-4 h-9 flex items-center text-[12px] sm:text-[13px] font-medium rounded-xl border transition-all duration-200 active:scale-[0.97] whitespace-nowrap flex-shrink-0 overflow-hidden
                ${isSelected
                  ? 'text-white border-transparent scale-[1.02]'
                  : 'border-stone-200/60 dark:border-zinc-700/80 text-stone-500 dark:text-zinc-400 hover:border-stone-300 dark:hover:border-zinc-600 hover:text-stone-600 dark:hover:text-zinc-300'
                }
              `}
              style={isSelected ? {
                background: accentColor,
                boxShadow: `inset 0 1px 0 rgba(255,255,255,0.15)`,
              } : {
                background: isDarkMode ? '#18181b' : '#FAFAF9',
                boxShadow: isDarkMode
                  ? 'inset 0 1px 0 rgba(255,255,255,0.04)'
                  : 'inset 0 1px 0 rgba(255,255,255,0.8)',
              }}
              type="button"
            >
              {/* Subtle glass highlight */}
              {isSelected && (
                <span
                  className="absolute inset-x-0 top-0 h-[45%] pointer-events-none rounded-t-[10px]"
                  style={{
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 100%)',
                  }}
                />
              )}
              <span className="relative z-10">{category.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryNav;

'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { categories } from '@/components/Categories';
import { useTheme } from '@/app/context/ThemeContext';
import useFilterModal from '@/app/hooks/useFilterModal';
import { ArrowUp, ArrowDown, SlidersHorizontal } from 'lucide-react';

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
  const filterModal = useFilterModal();

  const currentCategory = searchParams.category || '';

  const getActiveFilterCount = () => {
    const current = new URLSearchParams(Array.from(params?.entries() || []));
    let count = 0;
    if (current.get('minPrice')) count++;
    if (current.get('maxPrice')) count++;
    if (current.get('location')) count++;
    if (current.get('radius') && current.get('radius') !== '25') count++;
    if (current.get('openNow')) count++;
    if (current.get('verified')) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

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
    <div className="relative flex items-center justify-center py-2 sm:py-3 -mx-2 px-2 sm:mx-0 sm:px-0">
      {/* Categories - centered */}
      <div className="flex items-center justify-center gap-1.5 overflow-x-auto scrollbar-hide">
        {categories.map((category) => {
          const isSelected = currentCategory === category.label;

          return (
            <button
              key={category.label}
              onClick={() => handleCategorySelect(category.label)}
              className={`
                relative px-3 sm:px-4 h-9 flex items-center text-[12px] sm:text-[13px] font-medium rounded-xl border transition-all duration-300 ease-out active:scale-[0.97] whitespace-nowrap flex-shrink-0
                ${isSelected
                  ? 'text-white'
                  : 'bg-transparent border-neutral-300 dark:border-neutral-500 text-neutral-600 dark:text-neutral-400'
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

      {/* Sort & Filter controls - absolute right */}
      <div className="absolute right-0 flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-xl px-3 h-9">
        {/* Sort ascending */}
        <button
          className="p-0.5 rounded-lg text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-all duration-200"
          type="button"
          title="Sort ascending"
        >
          <ArrowUp className="w-4 h-4" strokeWidth={1.5} />
        </button>

        {/* Sort descending */}
        <button
          className="p-0.5 rounded-lg text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-all duration-200"
          type="button"
          title="Sort descending"
        >
          <ArrowDown className="w-4 h-4" strokeWidth={1.5} />
        </button>

        {/* Filter */}
        <button
          onClick={() => filterModal.onOpen()}
          className="relative p-0.5 rounded-lg text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-all duration-200"
          type="button"
          title="Filters"
        >
          <SlidersHorizontal className="w-4 h-4" strokeWidth={1.5} />
          {activeFilterCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 text-white text-[8px] font-bold rounded-full min-w-[14px] h-[14px] flex items-center justify-center"
              style={{ backgroundColor: accentColor }}
            >
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default CategoryNav;

'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { categories } from '@/components/Categories';
import { useTheme } from '@/app/context/ThemeContext';

interface CategoryNavProps {
  searchParams: {
    category?: string;
  };
}

const CategoryNav: React.FC<CategoryNavProps> = ({ searchParams }) => {
  const router = useRouter();
  const params = useSearchParams();
  const { accentColor } = useTheme();

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
    router.push(`/shops${query}`);
  };

  const hasSelection = currentCategories.length > 0;

  // Determine divider state: adjacent to selected rotates horizontal, others disappear
  const getDividerState = (index: number) => {
    if (!hasSelection) return 'vertical'; // No selection = all vertical

    const currentLabel = categories[index]?.label;
    const nextLabel = categories[index + 1]?.label;
    const isCurrentSelected = currentCategories.includes(currentLabel);
    const isNextSelected = nextLabel ? currentCategories.includes(nextLabel) : false;

    // Show horizontal if either adjacent item is selected
    if (isCurrentSelected || isNextSelected) return 'horizontal';
    return 'hidden'; // Others = disappear
  };

  return (
    <div className="-mx-6 md:-mx-24 pb-3 border-b-[0.75px] border-gray-400 dark:border-gray-600">
      <div className="flex items-center justify-center">
        {categories.map((category, index) => {
          const isSelected = currentCategories.includes(category.label);
          const dividerState = getDividerState(index);

          return (
            <div key={category.label} className="relative flex items-center">
              <button
                onClick={() => handleCategorySelect(category.label)}
                className={`
                  px-8 py-3.5 text-sm transition-all duration-200
                  ${isSelected
                    ? 'font-medium'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }
                `}
                style={isSelected ? { color: accentColor } : undefined}
                type="button"
              >
                {category.label}
              </button>

              {/* Divider: vertical by default, rotates horizontal when adjacent to selected, disappears otherwise */}
              {index < categories.length - 1 && (
                <span
                  className={`
                    bg-gray-300 dark:bg-gray-600 transition-all duration-300 ease-out
                    ${dividerState === 'horizontal' ? 'w-3 h-[0.5px]' : ''}
                    ${dividerState === 'vertical' ? 'w-[0.5px] h-4' : ''}
                    ${dividerState === 'hidden' ? 'w-[0.5px] h-4 opacity-0' : ''}
                  `}
                  style={dividerState === 'horizontal' ? { backgroundColor: accentColor } : undefined}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryNav;

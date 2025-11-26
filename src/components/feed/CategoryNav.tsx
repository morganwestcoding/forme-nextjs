'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { categories } from '@/components/Categories';

interface CategoryNavProps {
  searchParams: {
    category?: string;
  };
  onNavigate?: (url: string) => void;
}

const CategoryNav: React.FC<CategoryNavProps> = ({ searchParams, onNavigate }) => {
  const router = useRouter();
  const params = useSearchParams();

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

    // Use onNavigate callback if provided, otherwise fallback to router.push
    if (onNavigate) {
      onNavigate(`/${query}`);
    } else {
      router.push(`/${query}`, { scroll: false });
    }
  };

  const selectedIndex = categories.findIndex(c => c.label === currentCategory);
  const hasSelection = selectedIndex !== -1;

  // Determine divider state: adjacent to selected rotates horizontal, others disappear
  const getDividerState = (index: number) => {
    if (!hasSelection) return 'vertical'; // No selection = all vertical
    if (index === selectedIndex - 1 || index === selectedIndex) return 'horizontal'; // Adjacent = rotate
    return 'hidden'; // Others = disappear
  };

  return (
    <div className="-mx-6 md:-mx-24 pb-3 border-b-[0.75px] border-gray-400">
      <div className="flex items-center justify-center">
        {categories.map((category, index) => {
          const isSelected = currentCategory === category.label;
          const dividerState = getDividerState(index);

          return (
            <div key={category.label} className="relative flex items-center">
              <button
                onClick={() => handleCategorySelect(category.label)}
                className={`
                  px-8 py-3.5 text-sm transition-all duration-200
                  ${isSelected
                    ? 'text-[#60A5FA] font-medium'
                    : 'text-gray-500 hover:text-gray-700'
                  }
                `}
                type="button"
              >
                {category.label}
              </button>

              {/* Divider: vertical by default, rotates horizontal when adjacent to selected, disappears otherwise */}
              {index < categories.length - 1 && (
                <span
                  className={`
                    bg-gray-300 transition-all duration-300 ease-out
                    ${dividerState === 'horizontal' ? 'w-3 h-[0.5px] bg-[#60A5FA]' : ''}
                    ${dividerState === 'vertical' ? 'w-[0.5px] h-4' : ''}
                    ${dividerState === 'hidden' ? 'w-[0.5px] h-4 opacity-0' : ''}
                  `}
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

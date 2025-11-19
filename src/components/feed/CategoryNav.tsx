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

  return (
    <div className="-mx-6 md:-mx-24 pb-3 border-b border-gray-400/80">
      <div className="flex items-center justify-center">
        {categories.map((category, index) => {
          const isSelected = currentCategory === category.label;
          const isLast = index === categories.length - 1;

          return (
            <div key={category.label} className="relative flex items-center">
              <button
                onClick={() => handleCategorySelect(category.label)}
                className={`
                  px-6 py-3.5 text-sm transition-colors duration-150 rounded-lg
                  ${isSelected
                    ? 'text-[#60A5FA] hover:text-[#4F94E5]'
                    : 'text-gray-600/90 hover:text-gray-700'
                  }
                `}
                type="button"
              >
                {category.label}
              </button>

              {!isLast && (
                <div className="h-6 w-px bg-gray-300 mx-3" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryNav;

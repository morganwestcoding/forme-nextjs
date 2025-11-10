'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { categories } from '@/components/Categories';

interface CategoryNavProps {
  searchParams: {
    category?: string;
  };
}

const CategoryNav: React.FC<CategoryNavProps> = ({ searchParams }) => {
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
    router.push(`/market${query}`);
  };

  return (
    <div className="-mx-6 md:-mx-24 py-5 bg-white border-y border-gray-400">
      <div className="flex items-center justify-center">
        {categories.map((category, index) => {
          const isSelected = currentCategory === category.label;
          const isLast = index === categories.length - 1;

          return (
            <div key={category.label} className="relative flex items-center">
              {/* Category Button */}
              <button
                onClick={() => handleCategorySelect(category.label)}
                className={`
                  px-6 py-2.5 text-sm  transition-colors duration-200 rounded-lg
                  ${isSelected
                    ? 'text-[#60A5FA] hover:text-[#4F94E5]'
                    : 'text-gray-600/90 hover:text-gray-700'
                  }
                `}
                type="button"
              >
                {category.label}
              </button>

              {/* Vertical Divider */}
              {!isLast && (
                <div className="h-6 w-px bg-gray-400 mx-3" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryNav;

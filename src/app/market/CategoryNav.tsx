'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { categories } from '@/components/Categories';

interface CategoryNavProps {
  searchParams: {
    category?: string;
  };
  basePath?: string;  // Optional base path for navigation (default: '/market')
}

const CategoryNav: React.FC<CategoryNavProps> = ({ searchParams, basePath = '/market' }) => {
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
    router.push(`${basePath}${query}`);
  };

  return (
    <div className="flex items-center justify-center gap-1.5 py-3">
      {categories.map((category) => {
        const isSelected = currentCategory === category.label;

        return (
          <button
            key={category.label}
            onClick={() => handleCategorySelect(category.label)}
            className={`
              relative px-3.5 py-1.5 text-[13px] font-medium rounded-lg border transition-all duration-500 ease-out active:scale-[0.97]
              ${isSelected
                ? 'bg-gradient-to-b from-[#60A5FA] to-[#4A90E2] border-[#4A90E2] text-white shadow-sm shadow-[#60A5FA]/20'
                : 'bg-gradient-to-b from-white to-gray-50 border-gray-200/60 text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
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

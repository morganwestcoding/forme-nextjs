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
    <div className="-mx-6 md:-mx-24 border-b border-neutral-200/50">
      <div className="flex items-center justify-center gap-8">
        {categories.map((category) => {
          const isSelected = currentCategory === category.label;

          return (
            <button
              key={category.label}
              onClick={() => handleCategorySelect(category.label)}
              className={`
                relative pb-3 text-[13px] font-medium transition-all duration-200
                ${isSelected
                  ? 'text-neutral-900'
                  : 'text-neutral-500 hover:text-neutral-700'
                }
              `}
              type="button"
            >
              {category.label}
              {isSelected && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-neutral-900" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryNav;

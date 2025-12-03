'use client';

import React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

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
    <div className="flex items-center justify-center gap-1.5 py-3">
      {allCategories.map((category) => {
        const isSelected = activeCategories.includes(category.value);

        return (
          <button
            key={category.value}
            onClick={() => handleCategorySelect(category.value)}
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

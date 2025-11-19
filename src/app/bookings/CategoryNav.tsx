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
    <div className="-mx-6 md:-mx-24 pb-3 border-b border-gray-300">
      <div className="flex items-center justify-center">
        {allCategories.map((category, index) => {
          const isSelected = activeCategories.includes(category.value);
          const isLast = index === allCategories.length - 1;
          const isDirectional = category.isDirection;
          const isIncoming = category.value === 'incoming';

          return (
            <div key={category.value} className="relative flex items-center">
              <button
                onClick={() => handleCategorySelect(category.value)}
                className={`
                  px-6 py-3.5 text-sm transition-colors duration-150 rounded-lg
                  ${isSelected
                    ? isDirectional
                      ? isIncoming
                        ? 'text-emerald-600 hover:text-emerald-700'
                        : 'text-blue-600 hover:text-blue-700'
                      : 'text-[#60A5FA] hover:text-[#4F94E5]'
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

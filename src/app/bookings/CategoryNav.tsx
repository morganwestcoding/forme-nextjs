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

  const selectedIndex = allCategories.findIndex(cat => activeCategories.includes(cat.value));
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
        {allCategories.map((category, index) => {
          const isSelected = activeCategories.includes(category.value);
          const dividerState = getDividerState(index);
          const isDirectional = category.isDirection;
          const isIncoming = category.value === 'incoming';

          return (
            <div key={category.value} className="relative flex items-center">
              <button
                onClick={() => handleCategorySelect(category.value)}
                className={`
                  px-8 py-3.5 text-sm transition-all duration-200
                  ${isSelected
                    ? isDirectional
                      ? isIncoming
                        ? 'text-emerald-600 font-medium hover:text-emerald-700'
                        : 'text-blue-600 font-medium hover:text-blue-700'
                      : 'text-[#60A5FA] font-medium'
                    : 'text-gray-500 hover:text-gray-700'
                  }
                `}
                type="button"
              >
                {category.label}
              </button>

              {/* Divider: vertical by default, rotates horizontal when adjacent to selected, disappears otherwise */}
              {index < allCategories.length - 1 && (
                <span
                  className={`
                    bg-gray-300 transition-all duration-300 ease-out
                    ${dividerState === 'horizontal'
                      ? isSelected && isDirectional
                        ? isIncoming
                          ? 'w-3 h-[0.5px] bg-emerald-600'
                          : 'w-3 h-[0.5px] bg-blue-600'
                        : 'w-3 h-[0.5px] bg-[#60A5FA]'
                      : ''
                    }
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

'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { categories } from '@/components/Categories';
import { useTheme } from '@/app/context/ThemeContext';

interface CategoryNavProps {
  searchParams: {
    category?: string;
  };
  onNavigate?: (url: string) => void;
}

const CategoryNav: React.FC<CategoryNavProps> = ({ searchParams, onNavigate }) => {
  const router = useRouter();
  const params = useSearchParams();
  const { accentColor, isDarkMode } = useTheme();

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

    // Use onNavigate callback if provided, otherwise fallback to router.push
    if (onNavigate) {
      onNavigate(`/${query}`);
    } else {
      router.push(`/${query}`, { scroll: false });
    }
  };

  return (
    <div
      className="-mx-6 md:-mx-24 relative backdrop-blur-sm"
      style={{
        background: isDarkMode
          ? 'linear-gradient(180deg, rgba(24,24,27,0.95) 0%, rgba(18,18,20,0.9) 100%)'
          : 'linear-gradient(180deg, rgba(248,246,243,0.95) 0%, rgba(243,240,235,0.9) 100%)',
      }}
    >
      <div
        className="absolute bottom-0 left-0 right-0 h-[1px]"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(192,192,192,0.3) 20%, rgba(168,139,197,0.15) 40%, rgba(147,197,253,0.15) 60%, rgba(192,192,192,0.3) 80%, transparent 100%)',
        }}
      />
      <div className="flex items-center justify-center gap-8">
        {categories.map((category) => {
          const isSelected = currentCategories.includes(category.label);

          return (
            <button
              key={category.label}
              onClick={() => handleCategorySelect(category.label)}
              className={`
                relative pb-3 text-[13px] font-medium transition-all duration-200
                ${isSelected
                  ? ''
                  : 'text-stone-500 dark:text-zinc-400'
                }
              `}
              style={isSelected ? { color: accentColor } : undefined}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.color = accentColor;
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.color = '';
                }
              }}
              type="button"
            >
              {category.label}
              {isSelected && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-[2px]"
                  style={{
                    backgroundColor: accentColor,
                    boxShadow: `0 0 8px -2px ${accentColor}40`,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryNav;

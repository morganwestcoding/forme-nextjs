'use client';

import React from 'react';
import { useTheme } from '@/app/context/ThemeContext';

type FavoriteTab = 'Businesses' | 'Professionals' | 'Shops' | 'Posts';

interface CategoryNavProps {
  activeTab: FavoriteTab | null;
  setActiveTab: React.Dispatch<React.SetStateAction<FavoriteTab | null>>;
}

const CategoryNav: React.FC<CategoryNavProps> = ({ activeTab, setActiveTab }) => {
  const { accentColor } = useTheme();

  const tabs: { key: FavoriteTab; label: string }[] = [
    { key: 'Businesses', label: 'Businesses' },
    { key: 'Professionals', label: 'Professionals' },
    { key: 'Shops', label: 'Shops' },
    { key: 'Posts', label: 'Posts' },
  ];

  return (
    <div className="relative flex items-center justify-center py-2 sm:py-3 -mx-2 px-2 sm:mx-0 sm:px-0">
      <div className="flex items-center justify-center gap-1.5 overflow-x-auto scrollbar-hide py-1">
      {tabs.map((tab) => {
        const isSelected = activeTab === tab.key;

        return (
          <button
            key={tab.key}
            onClick={() => setActiveTab(isSelected ? null : tab.key)}
            className={`
              relative px-3 sm:px-4 py-1 sm:py-1.5 text-[12px] sm:text-[13px] font-medium rounded-lg sm:rounded-xl border transition-all duration-300 ease-out active:scale-[0.97] whitespace-nowrap flex-shrink-0
              ${isSelected
                ? 'text-white'
                : 'bg-transparent border-neutral-300 dark:border-neutral-600 text-neutral-500 dark:text-neutral-400'
              }
            `}
            style={isSelected ? {
              backgroundColor: accentColor,
              borderColor: accentColor,
              boxShadow: `0 4px 6px -1px ${accentColor}40`,
              color: 'white'
            } : undefined}
            onMouseEnter={(e) => {
              if (!isSelected) {
                e.currentTarget.style.borderColor = accentColor;
                e.currentTarget.style.color = accentColor;
                e.currentTarget.style.backgroundColor = `${accentColor}0D`;
              }
            }}
            onMouseLeave={(e) => {
              if (!isSelected) {
                e.currentTarget.style.borderColor = '';
                e.currentTarget.style.color = '';
                e.currentTarget.style.backgroundColor = '';
              }
            }}
            type="button"
          >
            <span className="relative z-10">{tab.label}</span>
          </button>
        );
      })}
      </div>
    </div>
  );
};

export default CategoryNav;

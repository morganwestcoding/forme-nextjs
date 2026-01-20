'use client';

import React from 'react';
import { useTheme } from '@/app/context/ThemeContext';

type FavoriteTab = 'Businesses' | 'Professionals' | 'Shops' | 'Posts';

interface CategoryNavProps {
  activeTabs: FavoriteTab[];
  setActiveTabs: React.Dispatch<React.SetStateAction<FavoriteTab[]>>;
}

const CategoryNav: React.FC<CategoryNavProps> = ({ activeTabs, setActiveTabs }) => {
  const { accentColor, isDarkMode } = useTheme();

  const tabs: { key: FavoriteTab; label: string }[] = [
    { key: 'Businesses', label: 'Businesses' },
    { key: 'Professionals', label: 'Professionals' },
    { key: 'Shops', label: 'Shops' },
    { key: 'Posts', label: 'Posts' },
  ];

  const handleTabClick = (tabKey: FavoriteTab) => {
    if (activeTabs.includes(tabKey)) {
      // Remove from selection
      setActiveTabs(activeTabs.filter(t => t !== tabKey));
    } else {
      // Add to selection
      setActiveTabs([...activeTabs, tabKey]);
    }
  };

  return (
    <div className="relative flex items-center justify-center py-2 sm:py-3 -mx-2 px-2 sm:mx-0 sm:px-0">
      <div className="flex items-center justify-center gap-1.5 overflow-x-auto scrollbar-hide py-1">
      {tabs.map((tab) => {
        const isSelected = activeTabs.includes(tab.key);

        return (
          <button
            key={tab.key}
            onClick={() => handleTabClick(tab.key)}
            className={`
              relative px-3 sm:px-4 h-9 flex items-center text-[12px] sm:text-[13px] font-medium rounded-xl border transition-all duration-200 active:scale-[0.97] whitespace-nowrap flex-shrink-0
              ${isSelected
                ? 'text-white border-transparent'
                : 'border-stone-300/90 dark:border-zinc-600/60 text-stone-500 dark:text-zinc-400 hover:border-stone-400 dark:hover:border-zinc-500 hover:text-stone-600 dark:hover:text-zinc-300'
              }
            `}
            style={isSelected ? {
              background: accentColor,
              boxShadow: '0 1px 3px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.15)',
            } : {
              background: isDarkMode ? '#222225' : '#F7F7F6',
              boxShadow: isDarkMode
                ? '0 1px 2px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.03)'
                : '0 1px 2px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.7)',
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

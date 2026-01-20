'use client';

import React from 'react';
import { useTheme } from '@/app/context/ThemeContext';

type TabKey = 'About' | 'Products' | 'Professionals' | 'Posts' | 'Reviews';

interface ShopCategoryNavProps {
  activeTab: TabKey | null;
  onTabChange: (tab: TabKey | null) => void;
}

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: 'About', label: 'About Us' },
  { key: 'Products', label: 'Products' },
  { key: 'Professionals', label: 'Professionals' },
  { key: 'Posts', label: 'Posts' },
  { key: 'Reviews', label: 'Reviews' },
];

const ShopCategoryNav: React.FC<ShopCategoryNavProps> = ({ activeTab, onTabChange }) => {
  const { accentColor, isDarkMode } = useTheme();

  return (
    <div className="flex items-center gap-1.5 py-3">
      {tabs.map((tab) => {
        const isSelected = activeTab === tab.key;

        const handleTabClick = () => {
          onTabChange(activeTab === tab.key ? null : tab.key);
        };

        return (
          <button
            key={tab.key}
            onClick={handleTabClick}
            className={`
              relative px-3 sm:px-4 h-9 flex items-center text-[12px] sm:text-[13px] font-medium rounded-xl border transition-all duration-200 active:scale-[0.97] whitespace-nowrap
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
  );
};

export default ShopCategoryNav;

'use client';

import React from 'react';
import { useTheme } from '@/app/context/ThemeContext';

type TabKey = 'About' | 'Services' | 'Professionals' | 'Posts' | 'Reviews';

interface ListingCategoryNavProps {
  activeTab: TabKey | null;
  onTabChange: (tab: TabKey | null) => void;
}

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: 'About', label: 'About Us' },
  { key: 'Services', label: 'Services' },
  { key: 'Professionals', label: 'Professionals' },
  { key: 'Posts', label: 'Posts' },
  { key: 'Reviews', label: 'Reviews' },
];

const ListingCategoryNav: React.FC<ListingCategoryNavProps> = ({ activeTab, onTabChange }) => {
  const { accentColor } = useTheme();

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
              relative px-4 py-1.5 text-[13px] font-medium rounded-xl border transition-all duration-300 ease-out active:scale-[0.97]
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
  );
};

export default ListingCategoryNav;

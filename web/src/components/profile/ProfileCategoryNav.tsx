'use client';

import React from 'react';
import { useTheme } from '@/app/context/ThemeContext';

type TabKey = 'About' | 'Posts' | 'Businesses' | 'Images' | 'Reviews';

interface ProfileCategoryNavProps {
  activeTab: TabKey | null;
  onTabChange: (tab: TabKey | null) => void;
}

const ProfileCategoryNav: React.FC<ProfileCategoryNavProps> = ({
  activeTab,
  onTabChange,
}) => {
  const { accentColor, isDarkMode } = useTheme();

  const tabs: Array<{ key: TabKey; label: string }> = [
    { key: 'About', label: 'About' },
    { key: 'Posts', label: 'Posts' },
    { key: 'Businesses', label: 'Businesses' },
    { key: 'Images', label: 'Gallery' },
    { key: 'Reviews', label: 'Reviews' },
  ];

  const iconButtonStyle = {
    background: isDarkMode ? '#222225' : '#F7F7F6',
    boxShadow: isDarkMode
      ? '0 1px 2px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.03)'
      : '0 1px 2px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.7)',
  };

  return (
    <div className="flex items-center py-3">
      {/* Spacer for balance */}
      <div className="w-20" />

      {/* Centered pills */}
      <div className="flex-1 flex items-center justify-center gap-1.5">
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
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Right side icons */}
      <div className="flex items-center gap-1 w-20 justify-end">
        <button
          type="button"
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-stone-300/90 dark:border-zinc-600/60 text-stone-500 dark:text-zinc-400 hover:border-stone-400 dark:hover:border-zinc-500 hover:text-stone-600 dark:hover:text-zinc-300 transition-all duration-200"
          style={iconButtonStyle}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.3-4.3"/>
          </svg>
        </button>
        <button
          type="button"
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-stone-300/90 dark:border-zinc-600/60 text-stone-500 dark:text-zinc-400 hover:border-stone-400 dark:hover:border-zinc-500 hover:text-stone-600 dark:hover:text-zinc-300 transition-all duration-200"
          style={iconButtonStyle}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ProfileCategoryNav;

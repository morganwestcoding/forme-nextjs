'use client';

import React from 'react';
import { useTheme } from '@/app/context/ThemeContext';

type TabKey = 'About' | 'Posts' | 'Businesses' | 'Images' | 'Services' | 'Reviews';

interface ProfileCategoryNavProps {
  activeTab: TabKey | null;
  onTabChange: (tab: TabKey | null) => void;
  showServices?: boolean;
}

const ProfileCategoryNav: React.FC<ProfileCategoryNavProps> = ({
  activeTab,
  onTabChange,
  showServices = false
}) => {
  const { accentColor } = useTheme();

  const tabs: Array<{ key: TabKey; label: string }> = [
    { key: 'About', label: 'About' },
    { key: 'Posts', label: 'Posts' },
    { key: 'Businesses', label: 'Businesses' },
    { key: 'Images', label: 'Gallery' },
    ...(showServices ? [{ key: 'Services' as TabKey, label: 'Services' }] : []),
    { key: 'Reviews', label: 'Reviews' },
  ];

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
                ? 'text-white'
                : 'bg-white border-neutral-300 text-neutral-600 hover:bg-neutral-50 hover:border-neutral-400 hover:shadow-sm'
              }
            `}
            style={isSelected ? {
              backgroundColor: accentColor,
              borderColor: accentColor,
              boxShadow: `0 4px 6px -1px ${accentColor}40`,
              color: 'white'
            } : undefined}
            type="button"
          >
            <span className="relative z-10">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ProfileCategoryNav;

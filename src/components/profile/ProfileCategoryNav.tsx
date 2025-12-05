'use client';

import React from 'react';
import { useTheme } from '@/app/context/ThemeContext';

type TabKey = 'About' | 'Posts' | 'Listings' | 'Images' | 'Services' | 'Reviews';

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
    { key: 'Listings', label: 'Listings' },
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
              relative px-4 py-1.5 text-[13px] font-medium rounded-xl border transition-all duration-300 ease-out active:scale-[0.97]
              ${isSelected
                ? 'text-white'
                : 'bg-transparent border-neutral-300 dark:border-neutral-600 text-neutral-500 dark:text-neutral-400'
              }
            `}
            style={isSelected ? {
              backgroundColor: accentColor,
              borderColor: accentColor,
              boxShadow: `0 4px 6px -1px ${accentColor}40`
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

export default ProfileCategoryNav;

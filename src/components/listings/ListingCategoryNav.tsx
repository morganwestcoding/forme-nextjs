'use client';

import React from 'react';

type TabKey = 'About' | 'Services' | 'Team' | 'Posts' | 'Reviews';

interface ListingCategoryNavProps {
  activeTab: TabKey | null;
  onTabChange: (tab: TabKey | null) => void;
}

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: 'About', label: 'About Us' },
  { key: 'Services', label: 'Services' },
  { key: 'Team', label: 'Team' },
  { key: 'Posts', label: 'Posts' },
  { key: 'Reviews', label: 'Reviews' },
];

const ListingCategoryNav: React.FC<ListingCategoryNavProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex items-center justify-center gap-1.5 py-3">
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
              relative px-3.5 py-1.5 text-[13px] font-medium rounded-lg border transition-all duration-500 ease-out active:scale-[0.97]
              ${isSelected
                ? 'bg-gradient-to-b from-[#60A5FA] to-[#4A90E2] border-[#4A90E2] text-white shadow-sm shadow-[#60A5FA]/20'
                : 'bg-gradient-to-b from-white/15 to-white/5 border-white/20 text-white/80 hover:text-white hover:border-white/40'
              }
            `}
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

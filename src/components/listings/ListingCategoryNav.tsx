'use client';

import React from 'react';

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
                ? 'bg-[#60A5FA] border-[#60A5FA] text-white shadow-md shadow-[#60A5FA]/25'
                : 'bg-transparent border-neutral-300 text-neutral-500 hover:border-[#60A5FA] hover:text-[#60A5FA] hover:bg-[#60A5FA]/5'
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

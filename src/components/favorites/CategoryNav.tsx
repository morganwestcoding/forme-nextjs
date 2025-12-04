'use client';

import React from 'react';

type FavoriteTab = 'Market' | 'Professionals' | 'Shops' | 'Posts';

interface CategoryNavProps {
  activeTab: FavoriteTab | null;
  setActiveTab: React.Dispatch<React.SetStateAction<FavoriteTab | null>>;
}

const CategoryNav: React.FC<CategoryNavProps> = ({ activeTab, setActiveTab }) => {
  const tabs: { key: FavoriteTab; label: string }[] = [
    { key: 'Market', label: 'Market' },
    { key: 'Professionals', label: 'Professionals' },
    { key: 'Shops', label: 'Shops' },
    { key: 'Posts', label: 'Posts' },
  ];

  return (
    <div className="flex items-center sm:justify-center gap-1.5 py-2 sm:py-3 overflow-x-auto scrollbar-hide -mx-2 px-2 sm:mx-0 sm:px-0">
      {tabs.map((tab) => {
        const isSelected = activeTab === tab.key;

        return (
          <button
            key={tab.key}
            onClick={() => setActiveTab(isSelected ? null : tab.key)}
            className={`
              relative px-3 sm:px-4 py-1 sm:py-1.5 text-[12px] sm:text-[13px] font-medium rounded-lg sm:rounded-xl border transition-all duration-300 ease-out active:scale-[0.97] whitespace-nowrap flex-shrink-0
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

export default CategoryNav;

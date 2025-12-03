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
    <div className="flex items-center justify-center gap-1.5 py-3">
      {tabs.map((tab) => {
        const isSelected = activeTab === tab.key;

        return (
          <button
            key={tab.key}
            onClick={() => setActiveTab(isSelected ? null : tab.key)}
            className={`
              relative px-3.5 py-1.5 text-[13px] font-medium rounded-lg border transition-all duration-500 ease-out active:scale-[0.97]
              ${isSelected
                ? 'bg-gradient-to-b from-[#60A5FA] to-[#4A90E2] border-[#4A90E2] text-white shadow-sm shadow-[#60A5FA]/20'
                : 'bg-gradient-to-b from-white to-gray-50 border-gray-200/60 text-gray-500 hover:text-gray-700 hover:border-gray-300'
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

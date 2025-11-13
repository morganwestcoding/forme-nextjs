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
    <div className="-mx-6 md:-mx-24 pb-4 border-b border-gray-300">
      <div className="flex items-center justify-center">
        {tabs.map((tab, index) => {
          const isSelected = activeTab === tab.key;
          const isLast = index === tabs.length - 1;

          return (
            <div key={tab.key} className="relative flex items-center">
              <button
                onClick={() => setActiveTab(isSelected ? null : tab.key)}
                className={`
                  px-6 py-3.5 text-sm transition-colors duration-150 rounded-lg
                  ${isSelected
                    ? 'text-[#60A5FA] hover:text-[#4F94E5]'
                    : 'text-gray-600/90 hover:text-gray-700'
                  }
                `}
                type="button"
              >
                {tab.label}
              </button>

              {!isLast && (
                <div className="h-6 w-px bg-gray-300 mx-3" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryNav;

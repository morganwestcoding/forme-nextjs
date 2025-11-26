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

  const selectedIndex = tabs.findIndex(t => t.key === activeTab);
  const hasSelection = selectedIndex !== -1;

  // Determine divider state: adjacent to selected rotates horizontal, others disappear
  const getDividerState = (index: number) => {
    if (!hasSelection) return 'vertical'; // No selection = all vertical
    if (index === selectedIndex - 1 || index === selectedIndex) return 'horizontal'; // Adjacent = rotate
    return 'hidden'; // Others = disappear
  };

  return (
    <div className="-mx-6 md:-mx-24 pb-3 border-b-[0.75px] border-gray-400">
      <div className="flex items-center justify-center">
        {tabs.map((tab, index) => {
          const isSelected = activeTab === tab.key;
          const dividerState = getDividerState(index);

          return (
            <div key={tab.key} className="relative flex items-center">
              <button
                onClick={() => setActiveTab(isSelected ? null : tab.key)}
                className={`
                  px-8 py-3.5 text-sm transition-all duration-200
                  ${isSelected
                    ? 'text-[#60A5FA] font-medium'
                    : 'text-gray-500 hover:text-gray-700'
                  }
                `}
                type="button"
              >
                {tab.label}
              </button>

              {/* Divider: vertical by default, rotates horizontal when adjacent to selected, disappears otherwise */}
              {index < tabs.length - 1 && (
                <span
                  className={`
                    bg-gray-300 transition-all duration-300 ease-out
                    ${dividerState === 'horizontal' ? 'w-3 h-[0.5px] bg-[#60A5FA]' : ''}
                    ${dividerState === 'vertical' ? 'w-[0.5px] h-4' : ''}
                    ${dividerState === 'hidden' ? 'w-[0.5px] h-4 opacity-0' : ''}
                  `}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryNav;

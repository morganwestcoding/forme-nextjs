'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Grid, List as ListIcon } from 'lucide-react';
import GlobalSearch from '../search/GlobalSearch';

type FavoriteTab = 'Reels' | 'Stores' | 'Market' | 'Shops' | 'Vendors';

interface ViewState {
  mode: 'grid' | 'list';
}

interface FavoritesExplorerProps {
  viewState: ViewState;
  setViewState: React.Dispatch<React.SetStateAction<ViewState>>;
  activeTab: FavoriteTab;
  setActiveTab: React.Dispatch<React.SetStateAction<FavoriteTab>>;
}

const FavoritesExplorer: React.FC<FavoritesExplorerProps> = ({
  viewState,
  setViewState,
  activeTab,
  setActiveTab
}) => {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewState((prev) => ({ ...prev, mode }));
  };

  // Tabs you want to show — keep aligned with the page's tabs
  const tabs: FavoriteTab[] = ['Reels', 'Market', 'Vendors']; // add 'Stores', 'Shops' if needed

  return (
    // Sticky header keeps the explorer visible even with empty states or long lists
    <div className="sticky top-0 z-30 bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/70 border-b border-gray-100">
      {/* Search + controls */}
      <div className="flex mt-4 mb-4 gap-2 px-1">
        <div className="relative flex-grow">
          <GlobalSearch placeholder="Search posts, users, listings, shops, products…" />
        </div>

        <div className="bg-[#EBF4FE] rounded-xl flex items-center shadow-sm p-1 px-2">
          <button
            onClick={() => handleViewModeChange('grid')}
            className={`p-2 rounded-lg ${viewState.mode === 'grid' ? 'bg-white shadow-sm text-[#60A5FA]' : 'text-gray-400'}`}
            aria-label="Grid view"
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleViewModeChange('list')}
            className={`p-2 rounded-lg ${viewState.mode === 'list' ? 'bg-white text-[#60A5FA]' : 'text-gray-400'}`}
            aria-label="List view"
          >
            <ListIcon className="w-5 h-5" />
          </button>
        </div>

        <button className="shadow-sm bg-white text-gray-500 py-3 px-4 rounded-xl hover:bg-neutral-100 transition-colors flex items-center space-x-2 text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" color="currentColor" fill="none" aria-hidden="true">
            <path d="M14.5405 2V4.48622C14.5405 6.23417 14.5405 7.10814 14.7545 7.94715C14.9685 8.78616 15.3879 9.55654 16.2267 11.0973L17.3633 13.1852C19.5008 17.1115 20.5696 19.0747 19.6928 20.53L19.6792 20.5522C18.7896 22 16.5264 22 12 22C7.47357 22 5.21036 22 4.3208 20.5522L4.30725 20.53C3.43045 19.0747 4.49918 17.1115 6.63666 13.1852L7.7733 11.0973C8.61209 9.55654 9.03149 8.78616 9.24548 7.94715C9.45947 7.10814 9.45947 6.23417 9.45947 4.48622V2" stroke="currentColor" strokeWidth="1.5"></path>
            <path d="M9 16.002L9.00868 15.9996" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
            <path d="M15 18.002L15.0087 17.9996" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
            <path d="M8 2L16 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
            <path d="M7.5 11.5563C8.5 10.4029 10.0994 11.2343 12 12.3182C14.5 13.7439 16 12.65 16.5 11.6152" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path>
          </svg>
          <span>Filters</span>
        </button>

        <button
          onClick={() => router.push('/create')}
          className="flex items-center justify-center py-3 space-x-2 px-4 shadow-sm rounded-xl transition-all bg-white text-gray-500 hover:bg-neutral-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" color="currentColor" fill="none" aria-hidden="true">
            <path d="M16.4249 4.60509L17.4149 3.6151C18.2351 2.79497 19.5648 2.79497 20.3849 3.6151C21.205 4.43524 21.205 5.76493 20.3849 6.58507L19.3949 7.57506M16.4249 4.60509L9.76558 11.2644C9.25807 11.772 8.89804 12.4078 8.72397 13.1041L8 16L10.8959 15.276C11.5922 15.102 12.228 14.7419 12.7356 14.2344L19.3949 7.57506M16.4249 4.60509L19.3949 7.57506" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"></path>
            <path d="M18.9999 13.5C18.9999 16.7875 18.9999 18.4312 18.092 19.5376C17.9258 19.7401 17.7401 19.9258 17.5375 20.092C16.4312 21 14.7874 21 11.4999 21H11C7.22876 21 5.34316 21 4.17159 19.8284C3.00003 18.6569 3 16.7712 3 13V12.5C3 9.21252 3 7.56879 3.90794 6.46244C4.07417 6.2599 4.2599 6.07417 4.46244 5.90794C5.56879 5 7.21252 5 10.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
          <span className="text-sm">Create</span>
        </button>
      </div>

      {/* Centered Tabs */}
      <div className="flex border-b border-gray-200 mb-2 relative justify-center">
        <div className="flex gap-8">
          {tabs.map((key) => {
            const isActive = activeTab === key;
            const activeColor = '#60A5FA';

            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`
                  relative flex items-center justify-center gap-2
                  px-6 pt-2 pb-4 h-10
                  text-sm font-medium whitespace-nowrap
                  transition-colors duration-150
                  ${isActive ? '' : 'text-gray-500 hover:text-gray-700'}
                `}
                style={{ color: isActive ? activeColor : undefined }}
                aria-pressed={isActive}
              >
                <span>{key}</span>
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 rounded-full"
                  style={{ backgroundColor: isActive ? activeColor : 'transparent' }}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FavoritesExplorer;

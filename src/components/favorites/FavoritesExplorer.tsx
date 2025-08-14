'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Grid, List as ListIcon, Sparkles, Layers, Building2 } from 'lucide-react';

type FavoriteTab = 'Reels' | 'Stores' | 'Listings' | 'Shops' | 'Products';

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

  const tabs: { key: FavoriteTab; label: FavoriteTab; Icon: JSX.Element }[] = [
    {
      key: 'Reels',
      label: 'Reels',
      Icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" color="currentColor" fill="none" viewBox="0 0 24 24">
          <path d="M18.974 15.022c.006-.029.047-.029.052 0 .304 1.486 1.466 2.648 2.953 2.952.028.006.028.047 0 .052-1.487.304-2.649 1.466-2.953 2.953-.005.028-.046.028-.052 0-.304-1.487-1.466-2.649-2.953-2.953-.029-.005-.029-.046 0-.052 1.487-.304 2.649-1.466 2.953-2.952Z" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M14.647 12.673c.741-.52 1.112-.78 1.26-1.158.123-.314.123-.718 0-1.032-.148-.378-.519-.638-1.26-1.158-.52-.364-1.058-.725-1.53-1.011a40 40 0 0 0-1.324-.738c-.788-.415-1.182-.622-1.563-.57-.316.043-.647.245-.842.513-.235.322-.264.787-.323 1.715C9.027 9.846 9 10.466 9 11c0 .534.027 1.155.066 1.765.058.928.088 1.393.323 1.716.195.267.526.468.842.511.381.052.775-.156 1.563-.57.446-.235.91-.49 1.383-.728.472-.286 1.01-.647 1.53-1.021Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M21.872 14.836C22 13.923 22 12.728 22 11c0-2.8 0-4.2-.545-5.27A4.5 4.5 0 0 0 19.27 3.545C18.2 3 16.8 3 14 3h-4c-2.8 0-4.2 0-5.27.545A4.5 4.5 0 0 0 2.545 5.73C2 6.8 2 8.2 2 11c0 2.8 0 4.2.545 5.27a4.5 4.5 0 0 0 2.185 2.185C5.8 19 7.2 19 10 19h3.426" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      key: 'Listings',
      label: 'Listings',
      Icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="currentColor" fill="none">
          <path d="M3.00003 10.9871V15.4925C3.00003 18.3243 3.00003 19.7403 3.87871 20.62C4.75739 21.4998 6.1716 21.4998 9.00003 21.4998H15C17.8284 21.4998 19.2426 21.4998 20.1213 20.62C21 19.7403 21 18.3243 21 15.4925V10.9871" stroke="currentColor" strokeWidth="1.5"></path>
          <path d="M15 16.9768C14.3159 17.584 13.2268 17.9768 12 17.9768C10.7732 17.9768 9.68412 17.584 9.00003 16.9768" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path>
          <path d="M17.7957 2.50294L6.14986 2.53202C4.41169 2.44248 3.96603 3.78259 3.96603 4.43768C3.96603 5.02359 3.89058 5.87774 2.82527 7.4831C1.75996 9.08846 1.84001 9.56536 2.44074 10.6767C2.93931 11.5991 4.20744 11.9594 4.86865 12.02C6.96886 12.0678 7.99068 10.2517 7.99068 8.97523C9.03254 12.1825 11.9956 12.1825 13.3158 11.8157C14.6386 11.4483 15.7717 10.1331 16.0391 8.97523C16.195 10.4142 16.6682 11.2538 18.0663 11.8308C19.5145 12.4284 20.7599 11.515 21.3848 10.9294C22.0097 10.3439 22.4107 9.04401 21.2968 7.6153C20.5286 6.63001 20.2084 5.7018 20.1033 4.73977C20.0423 4.18234 19.9888 3.58336 19.5972 3.20219C19.0248 2.64515 18.2036 2.47613 17.7957 2.50294Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
        </svg>
      )
    },
    {
      key: 'Shops',
      label: 'Shops',
      Icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="currentColor" fill="none">
          <path d="M8 16L16.7201 15.2733C19.4486 15.046 20.0611 14.45 20.3635 11.7289L21 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path>
          <path d="M6 6H22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path>
          <circle cx="6" cy="20" r="2" stroke="currentColor" strokeWidth="1.5"></circle>
          <circle cx="17" cy="20" r="2" stroke="currentColor" strokeWidth="1.5"></circle>
          <path d="M8 20L15 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path>
          <path d="M2 2H2.966C3.91068 2 4.73414 2.62459 4.96326 3.51493L7.93852 15.0765C8.08887 15.6608 7.9602 16.2797 7.58824 16.7616L6.63213 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path>
        </svg>
      )
    },
    {
      key: 'Products',
      label: 'Products',
      Icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
             viewBox="0 0 24 24" color="currentColor" fill="none">
          <path d="M7.998 16H11.998M7.998 11H15.998" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M7.5 3.5C5.944 3.547 5.017 3.72 4.375 4.362C3.496 5.242 3.496 6.657 3.496 9.488V15.994C3.496 18.826 3.496 20.241 4.375 21.121C5.253 22 6.668 22 9.496 22H14.496C17.324 22 18.739 22 19.617 21.121C20.496 20.241 20.496 18.826 20.496 15.994V9.488C20.496 6.657 20.496 5.242 19.617 4.362C18.976 3.72 18.048 3.547 16.492 3.5" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M7.496 3.75C7.496 2.784 8.28 2 9.246 2H14.746C15.713 2 16.496 2.784 16.496 3.75C16.496 4.717 15.713 5.5 14.746 5.5H9.246C8.28 5.5 7.496 4.717 7.496 3.75Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        </svg>
      )
    }
  ];

  return (
    <div className="min-h-0">
      {/* Search + controls */}
      <div className="flex mt-4 mb-7 gap-2">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your favorites…"
            className="w-full h-12 pl-12 pr-4 border text-sm border-gray-200 rounded-xl"
          />
        </div>

        <div className="bg-[#EBF4FE] rounded-xl flex items-center shadow-sm p-1 px-2">
          <button
            onClick={() => handleViewModeChange('grid')}
            className={`p-2 rounded-lg ${viewState.mode === 'grid' ? 'bg-white shadow-sm text-[#60A5FA]' : 'text-gray-400'}`}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleViewModeChange('list')}
            className={`p-2 rounded-lg ${viewState.mode === 'list' ? 'bg-white text-[#60A5FA]' : 'text-gray-400'}`}
          >
            <ListIcon className="w-5 h-5" />
          </button>
        </div>

        <button className="shadow-sm bg-white text-gray-500 py-3 px-4 rounded-xl hover:bg-neutral-100 transition-colors flex items-center space-x-2 text-sm">
          <Sparkles className="w-5 h-5" />
          <span>Filters</span>
        </button>

        <button
          onClick={() => router.push('/create')}
          className="flex items-center justify-center py-3 space-x-2 px-4 shadow-sm rounded-lg transition-all bg-white text-gray-500 hover:bg-neutral-200"
        >
          <Layers className="w-5 h-5" />
          <span className="text-sm">Create</span>
        </button>
      </div>

      {/* Centered Tabs */}
      <div className="flex border-b border-gray-200 mb-2 relative justify-center">
        <div className="flex gap-8">
          {tabs.map(({ key, label, Icon }) => {
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`pb-4 pt-3 px-6 flex items-center justify-center text-sm gap-2.5 transition-all duration-200 relative group ${
                  isActive ? 'font-semibold' : 'text-gray-500 hover:text-gray-700'
                }`}
                style={isActive ? { color: '#60A5FA' } : {}}
              >
                <div className={`transition-all duration-200 ${isActive ? 'transform -translate-y-px scale-105' : 'group-hover:scale-105'}`}>
                  {Icon}
                </div>
                <span className={`transition-all duration-200 ${isActive ? 'transform -translate-y-px' : ''}`}>
                  {label}
                </span>
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ backgroundColor: '#60A5FA' }} />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FavoritesExplorer;

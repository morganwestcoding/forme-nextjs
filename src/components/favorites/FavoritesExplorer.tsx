'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, Grid, List as ListIcon, Sparkles, Layers,
  Clapperboard, Building2, List, Store, Package
} from 'lucide-react';

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

  const tabs: { key: FavoriteTab; label: FavoriteTab; Icon: React.ComponentType<any> }[] = [
    { key: 'Reels',    label: 'Reels',    Icon: Clapperboard },
    { key: 'Stores',   label: 'Stores',   Icon: Building2 },
    { key: 'Listings', label: 'Listings', Icon: List },
    { key: 'Shops',    label: 'Shops',    Icon: Store },
    { key: 'Products', label: 'Products', Icon: Package },
  ];

  return (
    <div className="min-h-0">
      {/* Search + controls */}
      <div className="flex mt-4 mb-7 gap-2">
        {/* Search */}
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

        {/* View toggle */}
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

        {/* Filters (kept for UI parity; wire up as needed) */}
        <button className="shadow-sm bg-white text-gray-500 py-3 px-4 rounded-xl hover:bg-neutral-100 transition-colors flex items-center space-x-2 text-sm">
          <Sparkles className="w-5 h-5" />
          <span>Filters</span>
        </button>

        {/* Create (kept for parity; replace with your action) */}
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
                  <Icon className="w-5 h-5" />
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

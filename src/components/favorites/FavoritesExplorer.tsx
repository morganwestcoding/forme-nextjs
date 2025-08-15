'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Grid, List as ListIcon, Sparkles, Layers, Building2 } from 'lucide-react';
import { IoStorefrontOutline } from "react-icons/io5";

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
      key: 'Market',
      label: 'Market',
      Icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" color="currentColor" fill="none">
    <path d="M3.00003 10.9871V15.4925C3.00003 18.3243 3.00003 19.7403 3.87871 20.62C4.75739 21.4998 6.1716 21.4998 9.00003 21.4998H15C17.8284 21.4998 19.2426 21.4998 20.1213 20.62C21 19.7403 21 18.3243 21 15.4925V10.9871" stroke="currentColor" stroke-width="1.5"></path>
    <path d="M15 16.9768C14.3159 17.584 13.2268 17.9768 12 17.9768C10.7732 17.9768 9.68412 17.584 9.00003 16.9768" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
    <path d="M17.7957 2.50294L6.14986 2.53202C4.41169 2.44248 3.96603 3.78259 3.96603 4.43768C3.96603 5.02359 3.89058 5.87774 2.82527 7.4831C1.75996 9.08846 1.84001 9.56536 2.44074 10.6767C2.93931 11.5991 4.20744 11.9594 4.86865 12.02C6.96886 12.0678 7.99068 10.2517 7.99068 8.97523C9.03254 12.1825 11.9956 12.1825 13.3158 11.8157C14.6386 11.4483 15.7717 10.1331 16.0391 8.97523C16.195 10.4142 16.6682 11.2538 18.0663 11.8308C19.5145 12.4284 20.7599 11.515 21.3848 10.9294C22.0097 10.3439 22.4107 9.04401 21.2968 7.6153C20.5286 6.63001 20.2084 5.7018 20.1033 4.73977C20.0423 4.18234 19.9888 3.58336 19.5972 3.20219C19.0248 2.64515 18.2036 2.47613 17.7957 2.50294Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
        </svg>
      )
    },

    {
      key: 'Vendors',
      label: 'Vendors',
      Icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
             viewBox="0 0 24 24" color="currentColor" fill="none">

    <path d="M2.5 7.5V13.5C2.5 17.2712 2.5 19.1569 3.67157 20.3284C4.84315 21.5 6.72876 21.5 10.5 21.5H13.5C17.2712 21.5 19.1569 21.5 20.3284 20.3284C21.5 19.1569 21.5 17.2712 21.5 13.5V7.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M3.86909 5.31461L2.5 7.5H21.5L20.2478 5.41303C19.3941 3.99021 18.9673 3.2788 18.2795 2.8894C17.5918 2.5 16.7621 2.5 15.1029 2.5H8.95371C7.32998 2.5 6.51812 2.5 5.84013 2.8753C5.16215 3.2506 4.73113 3.93861 3.86909 5.31461Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M12 7.5V2.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M10 10.5H14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>


        </svg>



      )
    }
  ];

  return (
    <div className="min-h-0">
      {/* Search + controls */}
      <div className="flex mt-4 mb-8 gap-2">
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
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" color="currentColor" fill="none">
            <path d="M14.5405 2V4.48622C14.5405 6.23417 14.5405 7.10814 14.7545 7.94715C14.9685 8.78616 15.3879 9.55654 16.2267 11.0973L17.3633 13.1852C19.5008 17.1115 20.5696 19.0747 19.6928 20.53L19.6792 20.5522C18.7896 22 16.5264 22 12 22C7.47357 22 5.21036 22 4.3208 20.5522L4.30725 20.53C3.43045 19.0747 4.49918 17.1115 6.63666 13.1852L7.7733 11.0973C8.61209 9.55654 9.03149 8.78616 9.24548 7.94715C9.45947 7.10814 9.45947 6.23417 9.45947 4.48622V2" stroke="currentColor" strokeWidth="1.5"  ></path>
            <path d="M9 16.002L9.00868 15.9996" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
            <path d="M15 18.002L15.0087 17.9996" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" ></path>
            <path d="M8 2L16 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" ></path>
            <path d="M7.5 11.5563C8.5 10.4029 10.0994 11.2343 12 12.3182C14.5 13.7439 16 12.65 16.5 11.6152" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"  fill="#F5F5F5"></path>
          </svg>
          <span>Filters</span>
        </button>

        <button
          onClick={() => router.push('/create')}
          className="flex items-center justify-center py-3 space-x-2 px-4 shadow-sm rounded-xl transition-all bg-white text-gray-500 hover:bg-neutral-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" color="currentColor" fill="none">
            <path d="M16.4249 4.60509L17.4149 3.6151C18.2351 2.79497 19.5648 2.79497 20.3849 3.6151C21.205 4.43524 21.205 5.76493 20.3849 6.58507L19.3949 7.57506M16.4249 4.60509L9.76558 11.2644C9.25807 11.772 8.89804 12.4078 8.72397 13.1041L8 16L10.8959 15.276C11.5922 15.102 12.228 14.7419 12.7356 14.2344L19.3949 7.57506M16.4249 4.60509L19.3949 7.57506" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"></path>
            <path d="M18.9999 13.5C18.9999 16.7875 18.9999 18.4312 18.092 19.5376C17.9258 19.7401 17.7401 19.9258 17.5375 20.092C16.4312 21 14.7874 21 11.4999 21H11C7.22876 21 5.34316 21 4.17159 19.8284C3.00003 18.6569 3 16.7712 3 13V12.5C3 9.21252 3 7.56879 3.90794 6.46244C4.07417 6.2599 4.2599 6.07417 4.46244 5.90794C5.56879 5 7.21252 5 10.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg> 
          <span className="text-sm">Create</span>
        </button>
      </div>

      {/* Centered Tabs */}
{/* Centered Tabs — no layout shift, consistent icons */}
<div className="flex border-b border-gray-200 mb-2 relative justify-center">
  <div className="flex gap-8">
    {(['Reels', 'Market', 'Vendors'] as FavoriteTab[]).map((key) => {
      const isActive = activeTab === key;
      const activeColor = '#60A5FA';

      const renderIcon = () => {
        if (key === 'Reels') {
          return (
            <svg
              xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
              width="22" height="22" fill="none"
              className="flex-shrink-0"
            >
              <path d="M18.974 15.022c.006-.029.047-.029.052 0 .304 1.486 1.466 2.648 2.953 2.952.028.006.028.047 0 .052-1.487.304-2.649 1.466-2.953 2.953-.005.028-.046.028-.052 0-.304-1.487-1.466-2.649-2.953-2.953-.029-.005-.029-.046 0-.052 1.487-.304 2.649-1.466 2.953-2.952Z"
                    stroke="currentColor" strokeWidth={1.75}/>
              <path d="M14.647 12.673c.741-.52 1.112-.78 1.26-1.158.123-.314.123-.718 0-1.032-.148-.378-.519-.638-1.26-1.158-.52-.364-1.058-.725-1.53-1.011a40 40 0 0 0-1.324-.738c-.788-.415-1.182-.622-1.563-.57-.316.043-.647.245-.842.513-.235.322-.264.787-.323 1.715C9.027 9.846 9 10.466 9 11c0 .534.027 1.155.066 1.765.058.928.088 1.393.323 1.716.195.267.526.468.842.511.381.052.775-.156 1.563-.57.446-.235.91-.49 1.383-.728.472-.286 1.01-.647 1.53-1.021Z"
                    stroke="currentColor" strokeWidth={1.75} strokeLinecap="round"/>
              <path d="M21.872 14.836C22 13.923 22 12.728 22 11c0-2.8 0-4.2-.545-5.27A4.5 4.5 0 0 0 19.27 3.545C18.2 3 16.8 3 14 3h-4c-2.8 0-4.2 0-5.27.545A4.5 4.5 0 0 0 2.545 5.73C2 6.8 2 8.2 2 11c0 2.8 0 4.2.545 5.27a4.5 4.5 0 0 0 2.185 2.185C5.8 19 7.2 19 10 19h3.426"
                    stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          );
        }

        if (key === 'Market') {
          // Your market icon, normalized
          return (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                 width="22" height="22" fill="none" className="flex-shrink-0">
              <path d="M3.00003 10.9871V15.4925C3.00003 18.3243 3.00003 19.7403 3.87871 20.62C4.75739 21.4998 6.1716 21.4998 9.00003 21.4998H15C17.8284 21.4998 19.2426 21.4998 20.1213 20.62C21 19.7403 21 18.3243 21 15.4925V10.9871"
                    stroke="currentColor" strokeWidth={1.75}/>
              <path d="M15 16.9768C14.3159 17.584 13.2268 17.9768 12 17.9768C10.7732 17.9768 9.68412 17.584 9.00003 16.9768"
                    stroke="currentColor" strokeWidth={1.75} strokeLinecap="round"/>
              <path d="M17.7957 2.50294L6.14986 2.53202C4.41169 2.44248 3.96603 3.78259 3.96603 4.43768C3.96603 5.02359 3.89058 5.87774 2.82527 7.4831C1.75996 9.08846 1.84001 9.56536 2.44074 10.6767C2.93931 11.5991 4.20744 11.9594 4.86865 12.02C6.96886 12.0678 7.99068 10.2517 7.99068 8.97523C9.03254 12.1825 11.9956 12.1825 13.3158 11.8157C14.6386 11.4483 15.7717 10.1331 16.0391 8.97523C16.195 10.4142 16.6682 11.2538 18.0663 11.8308C19.5145 12.4284 20.7599 11.515 21.3848 10.9294C22.0097 10.3439 22.4107 9.04401 21.2968 7.6153C20.5286 6.63001 20.2084 5.7018 20.1033 4.73977C20.0423 4.18234 19.9888 3.58336 19.5972 3.20219C19.0248 2.64515 18.2036 2.47613 17.7957 2.50294Z"
                    stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          );
        }

        if (key === 'Vendors') {
          // The storefront / vendors icon you’re using elsewhere
          return (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                 width="22" height="22" fill="none" className="flex-shrink-0">
              <path d="M2.5 7.5V13.5C2.5 17.2712 2.5 19.1569 3.67157 20.3284C4.84315 21.5 6.72876 21.5 10.5 21.5H13.5C17.2712 21.5 19.1569 21.5 20.3284 20.3284C21.5 19.1569 21.5 17.2712 21.5 13.5V7.5"
                    stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3.86909 5.31461L2.5 7.5H21.5L20.2478 5.41303C19.3941 3.99021 18.9673 3.2788 18.2795 2.8894C17.5918 2.5 16.7621 2.5 15.1029 2.5H8.95371C7.32998 2.5 6.51812 2.5 5.84013 2.8753C5.16215 3.2506 4.73113 3.93861 3.86909 5.31461Z"
                    stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 7.5V2.5" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10 10.5H14" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          );
        }

        return null;
      };

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
        >
          {/* Icon */}
          {renderIcon()}

          {/* Label */}
          <span>{key}</span>

          {/* Persistent underline */}
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

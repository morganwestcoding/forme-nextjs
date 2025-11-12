// components/Discover/DiscoverHeader.tsx
'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import useCreatePostModal from '@/app/hooks/useCreatePostModal';
import useFilterModal from '@/app/hooks/useFilterModal';
import { useViewMode } from '@/app/hooks/useViewMode';
import GlobalSearch from '../search/GlobalSearch';

interface DiscoverHeaderProps {
  isHeroMode?: boolean;
}

const DiscoverHeader: React.FC<DiscoverHeaderProps> = ({
  isHeroMode = false
}) => {
  const params = useSearchParams();
  const createPostModal = useCreatePostModal();
  const filterModal = useFilterModal();
  const { viewMode, setViewMode } = useViewMode();

  const handleCreatePost = () => {
    createPostModal.onOpen();
  };

  const handleOpenFilters = () => {
    filterModal.onOpen();
  };

  // Count active filters for badge
  const getActiveFilterCount = () => {
    const current = new URLSearchParams(Array.from(params?.entries() || []));
    let count = 0;

    if (current.get('q')) count++;
    if (current.get('category')) count++;
    if (current.get('type')) count++;
    if (current.get('location')) count++;
    if (current.get('radius') && current.get('radius') !== '25') count++;
    if (current.get('minPrice')) count++;
    if (current.get('maxPrice')) count++;
    if (current.get('openNow')) count++;
    if (current.get('verified')) count++;
    if (current.get('featured')) count++;

    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  // Hero mode or normal mode button styles
  const buttonBaseClasses = isHeroMode
    ? "backdrop-blur-md bg-white/10 hover:bg-blue-400/10 border border-white/40 hover:border-blue-400/60 text-white hover:text-[#60A5FA]"
    : "bg-gradient-to-br from-white via-white to-gray-50 border border-gray-400 text-gray-600/90 hover:!bg-gray-100 hover:bg-none hover:border-gray-500 hover:text-gray-700 transition-all duration-500 ease-out";

  return (
    <div className="min-h-0">
      {/* Search and Controls */}
      <div className="flex mt-4 gap-2">
        {/* Search Bar */}
        <div className="relative flex-grow">
          <GlobalSearch
            placeholder="Search posts, users, listings, shops, products…"
            isHeroMode={isHeroMode}
          />
        </div>

        {/* View Toggle */}
        <div className={`${buttonBaseClasses} rounded-lg flex items-center gap-0.5 px-2 py-0.5 relative group`}>
          {/* Grid View Button */}
          <button
            onClick={() => setViewMode('grid')}
            className={`relative py-2 px-3.5 rounded-md transition-all duration-200 ${
              viewMode === 'grid'
                ? 'bg-gray-800'
                : 'hover:bg-black/5'
            }`}
            type="button"
            title="Grid View"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              className="transition-colors duration-200"
            >
              <path d="M13 4H11C8.64298 4 7.46447 4 6.73223 4.73223C6 5.46447 6 6.64298 6 9V15C6 17.357 6 18.5355 6.73223 19.2678C7.46447 20 8.64298 20 11 20H13C15.357 20 16.5355 20 17.2678 19.2678C18 18.5355 18 17.357 18 15V9C18 6.64298 18 5.46447 17.2678 4.73223C16.5355 4 15.357 4 13 4Z" stroke={viewMode === 'grid' ? 'white' : 'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 17.5C2.82843 17.5 3.5 16.8284 3.5 16V8C3.5 7.17157 2.82843 6.5 2 6.5" stroke={viewMode === 'grid' ? 'white' : 'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M22 17.5C21.1716 17.5 20.5 16.8284 20.5 16V8C20.5 7.17157 21.1716 6.5 22 6.5" stroke={viewMode === 'grid' ? 'white' : 'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* TikTok View Button */}
          <button
            onClick={() => setViewMode('tiktok')}
            className={`relative py-2 px-3.5 rounded-md transition-all duration-200 ${
              viewMode === 'tiktok'
                ? 'bg-gray-800'
                : 'hover:bg-black/5'
            }`}
            type="button"
            title="TikTok View"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              className="transition-colors duration-200"
            >
              <path d="M16 7C18.357 7 19.5355 7 20.2678 7.73223C21 8.46447 21 9.64298 21 12C21 14.357 21 15.5355 20.2678 16.2678C19.5355 17 18.357 17 16 17H8C5.64298 17 4.46447 17 3.73223 16.2678C3 15.5355 3 14.357 3 12C3 9.64298 3 8.46447 3.73223 7.73223C4.46447 7 5.64298 7 8 7L16 7Z" stroke={viewMode === 'tiktok' ? 'white' : 'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M17 2C16.8955 2.54697 16.7107 2.94952 16.3838 3.26777C15.6316 4 14.4211 4 12 4C9.5789 4 8.36835 4 7.61621 3.26777C7.28931 2.94952 7.10449 2.54697 7 2" stroke={viewMode === 'tiktok' ? 'white' : 'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M17 22C16.8955 21.453 16.7107 21.0505 16.3838 20.7322C15.6316 20 14.4211 20 12 20C9.5789 20 8.36835 20 7.61621 20.7322C7.28931 21.0505 7.10449 21.453 7 22" stroke={viewMode === 'tiktok' ? 'white' : 'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Filters Button */}
        <button
          onClick={handleOpenFilters}
          className={`${buttonBaseClasses} py-2.5 px-4 rounded-lg transition-all duration-200 flex items-center space-x-2 text-sm relative group`}
          type="button"
        >
          <div className="relative w-[22px] h-[22px] flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="22"
              height="22"
              color="currentColor"
              fill="none"
              className={`absolute inset-0 transition-all duration-300 ${activeFilterCount > 0 ? 'opacity-0 scale-75' : 'opacity-100 scale-100'}`}
            >
              <path d="M14.5405 2V4.48622C14.5405 6.23417 14.5405 7.10814 14.7545 7.94715C14.9685 8.78616 15.3879 9.55654 16.2267 11.0973L17.3633 13.1852C19.5008 17.1115 20.5696 19.0747 19.6928 20.53L19.6792 20.5522C18.7896 22 16.5264 22 12 22C7.47357 22 5.21036 22 4.3208 20.5522L4.30725 20.53C3.43045 19.0747 4.49918 17.1115 6.63666 13.1852L7.7733 11.0973C8.61209 9.55654 9.03149 8.78616 9.24548 7.94715C9.45947 7.10814 9.45947 6.23417 9.45947 4.48622V2" stroke="currentColor" strokeWidth="1.5"></path>
              <path d="M9 16.002L9.00868 15.9996" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
              <path d="M15 18.002L15.0087 17.9996" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
              <path d="M8 2L16 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
              <path d="M7.5 11.5563C8.5 10.4029 10.0994 11.2343 12 12.3182C14.5 13.7439 16 12.65 16.5 11.6152" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="#F5F5F5"></path>
            </svg>
            <span
              className={`absolute flex items-center justify-center transition-all duration-300 ${activeFilterCount > 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}
              style={{
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: '28px',
                height: '28px'
              }}
            >
              <span className="w-full h-full rounded-md border-[#60A5FA] border bg-blue-50 flex items-center justify-center text-xs font-semibold" style={{ color: '#60A5FA' }}>
                {activeFilterCount > 0 && activeFilterCount}
              </span>
            </span>
          </div>
          <span>Filters</span>
        </button>

        {/* Create Button */}
        <button
          onClick={handleCreatePost}
          className={`${buttonBaseClasses} flex items-center justify-center py-2.5 space-x-2 px-4 rounded-lg transition-all duration-200 group`}
          type="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" color="currentColor" fill="none" className="transition-colors duration-200">
            <path d="M16.4249 4.60509L17.4149 3.6151C18.2351 2.79497 19.5648 2.79497 20.3849 3.6151C21.205 4.43524 21.205 5.76493 20.3849 6.58507L19.3949 7.57506M16.4249 4.60509L9.76558 11.2644C9.25807 11.772 8.89804 12.4078 8.72397 13.1041L8 16L10.8959 15.276C11.5922 15.102 12.228 14.7419 12.7356 14.2344L19.3949 7.57506M16.4249 4.60509L19.3949 7.57506" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"></path>
            <path d="M18.9999 13.5C18.9999 16.7875 18.9999 18.4312 18.092 19.5376C17.9258 19.7401 17.7401 19.9258 17.5375 20.092C16.4312 21 14.7874 21 11.4999 21H11C7.22876 21 5.34316 21 4.17159 19.8284C3.00003 18.6569 3 16.7712 3 13V12.5C3 9.21252 3 7.56879 3.90794 6.46244C4.07417 6.2599 4.2599 6.07417 4.46244 5.90794C5.56879 5 7.21252 5 10.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
          <span className="text-sm">Create</span>
        </button>
      </div>
    </div>
  );
};

export default DiscoverHeader;
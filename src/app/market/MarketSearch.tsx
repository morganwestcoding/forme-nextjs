'use client';

import React, { useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Link02Icon } from 'hugeicons-react';
import useRentModal from '@/app/hooks/useListingModal';
import useFilterModal from '@/app/hooks/useFilterModal';

interface MarketSearchProps {
  isHeroMode?: boolean;
  categoryNav?: React.ReactNode;
  basePath?: string;  // Optional base path for navigation (default: '/market')
}

const MarketSearch: React.FC<MarketSearchProps> = ({ isHeroMode = false, categoryNav, basePath = '/market' }) => {
  const router = useRouter();
  const params = useSearchParams();
  const rentModal = useRentModal();
  const filterModal = useFilterModal();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCreateListing = () => {
    rentModal.onOpen();
  };

  const handleOpenFilters = () => {
    filterModal.onOpen();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    setIsLoading(true);
    router.push(`${basePath}?q=${encodeURIComponent(input)}`);
    setInput('');
    // Brief delay to show loading state before navigation completes
    setTimeout(() => setIsLoading(false), 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e);
    }
  };

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

  const containerClasses = isHeroMode
    ? "bg-white/[0.08] backdrop-blur-sm border border-white/20 rounded-2xl"
    : "bg-neutral-100 border border-neutral-200 rounded-2xl";

  const iconButtonClasses = isHeroMode
    ? "p-2 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition-all duration-200"
    : "p-2 rounded-xl hover:bg-neutral-200 text-neutral-600 hover:text-neutral-900 transition-all duration-200";

  return (
    <form onSubmit={handleSubmit}>
      <div className={`${containerClasses} mt-3 overflow-hidden`}>
        {/* Top Half - Search Input */}
        <div className="flex items-center gap-1.5 px-3 py-2.5">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Looking for something? I can help you find it..."
            className={`flex-1 text-[14px] bg-transparent border-none outline-none font-normal pl-3 ${isHeroMode ? 'text-white placeholder-white/50' : 'text-neutral-900 placeholder-neutral-400'}`}
          />

          <div className={`w-px h-5 ${isHeroMode ? 'bg-white/20' : 'bg-neutral-300'}`} />

          <button
            className={iconButtonClasses}
            type="button"
            title="Attach"
          >
            <Link02Icon size={22} strokeWidth={1.5} />
          </button>

          <button
            onClick={handleOpenFilters}
            className={`${iconButtonClasses} relative`}
            type="button"
            title="Filters"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" color="currentColor" fill="none">
              <path d="M14.5405 2V4.48622C14.5405 6.23417 14.5405 7.10814 14.7545 7.94715C14.9685 8.78616 15.3879 9.55654 16.2267 11.0973L17.3633 13.1852C19.5008 17.1115 20.5696 19.0747 19.6928 20.53L19.6792 20.5522C18.7896 22 16.5264 22 12 22C7.47357 22 5.21036 22 4.3208 20.5522L4.30725 20.53C3.43045 19.0747 4.49918 17.1115 6.63666 13.1852L7.7733 11.0973C8.61209 9.55654 9.03149 8.78616 9.24548 7.94715C9.45947 7.10814 9.45947 6.23417 9.45947 4.48622V2" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M9 16.002L9.00868 15.9996" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M15 18.002L15.0087 17.9996" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 2L16 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7.5 11.5563C8.5 10.4029 10.0994 11.2343 12 12.3182C14.5 13.7439 16 12.65 16.5 11.6152" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="#F5F5F5"/>
            </svg>
            {activeFilterCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-[#60A5FA] text-white text-[9px] font-bold rounded-full min-w-[15px] h-[15px] flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          <button
            onClick={handleCreateListing}
            className={iconButtonClasses}
            type="button"
            title="Create"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" color="currentColor" fill="none">
              <path d="M16.4249 4.60509L17.4149 3.6151C18.2351 2.79497 19.5648 2.79497 20.3849 3.6151C21.205 4.43524 21.205 5.76493 20.3849 6.58507L19.3949 7.57506M16.4249 4.60509L9.76558 11.2644C9.25807 11.772 8.89804 12.4078 8.72397 13.1041L8 16L10.8959 15.276C11.5922 15.102 12.228 14.7419 12.7356 14.2344L19.3949 7.57506M16.4249 4.60509L19.3949 7.57506" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M18.9999 13.5C18.9999 16.7875 18.9999 18.4312 18.092 19.5376C17.9258 19.7401 17.7401 19.9258 17.5375 20.092C16.4312 21 14.7874 21 11.4999 21H11C7.22876 21 5.34316 21 4.17159 19.8284C3.00003 18.6569 3 16.7712 3 13V12.5C3 9.21252 3 7.56879 3.90794 6.46244C4.07417 6.2599 4.2599 6.07417 4.46244 5.90794C5.56879 5 7.21252 5 10.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Divider */}
        {categoryNav && (
          <>
            <div className={`h-px ${isHeroMode ? 'bg-white/20' : 'bg-neutral-300'}`} />

            {/* Bottom Half - Category Nav */}
            <div className="px-3">
              {categoryNav}
            </div>
          </>
        )}
      </div>
    </form>
  );
};

export default MarketSearch;

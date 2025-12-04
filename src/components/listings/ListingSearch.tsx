'use client';

import React, { useState, useRef } from 'react';

interface ListingSearchProps {
  onSearchChange: (query: string) => void;
  onReserveClick?: () => void;
  onEditClick?: () => void;
  onFollowClick?: () => void;
  isOwner?: boolean;
  isEmployee?: boolean;
  isFollowing?: boolean;
  currentUser?: boolean;
}

const ListingSearch: React.FC<ListingSearchProps> = ({
  onSearchChange,
  onReserveClick,
  onEditClick,
  onFollowClick,
  isOwner = false,
  isEmployee = false,
  isFollowing = false,
  currentUser = false,
}) => {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    onSearchChange(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
    }
  };

  const containerClasses = "bg-neutral-100 border border-neutral-200 rounded-2xl";
  const iconButtonClasses = "p-2 rounded-xl hover:bg-neutral-200 text-neutral-600 hover:text-neutral-900 transition-all duration-200";

  return (
    <div className={`${containerClasses} mt-3 overflow-hidden`}>
      {/* Top Half - Search Input */}
      <div className="flex items-center gap-1.5 px-3 py-2.5">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Looking for something? I can help you find it..."
          className="flex-1 text-[14px] bg-transparent border-none outline-none text-neutral-900 placeholder-neutral-400 font-normal pl-3"
        />

        {currentUser && <div className="w-px h-5 bg-white/20" />}

        {/* Reserve Button */}
        {currentUser && onReserveClick && (
          <button
            onClick={onReserveClick}
            className={iconButtonClasses}
            type="button"
            title="Reserve"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 2V4M6 2V4" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M11.9955 13H12.0045M11.9955 17H12.0045M15.991 13H16M8 13H8.00897M8 17H8.00897" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3.5 8H20.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2.5 12.2432C2.5 7.88594 2.5 5.70728 3.75212 4.35364C5.00424 3 7.01949 3 11.05 3H12.95C16.9805 3 18.9958 3 20.2479 4.35364C21.5 5.70728 21.5 7.88594 21.5 12.2432V12.7568C21.5 17.1141 21.5 19.2927 20.2479 20.6464C18.9958 22 16.9805 22 12.95 22H11.05C7.01949 22 5.00424 22 3.75212 20.6464C2.5 19.2927 2.5 17.1141 2.5 12.7568V12.2432Z" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 8H21" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}

        {/* Edit/Follow Button */}
        {currentUser && (
          isOwner || isEmployee ? (
            <button
              onClick={onEditClick}
              className={iconButtonClasses}
              type="button"
              title="Edit"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M16.4249 4.60509L17.4149 3.6151C18.2351 2.79497 19.5648 2.79497 20.3849 3.6151C21.205 4.43524 21.205 5.76493 20.3849 6.58507L19.3949 7.57506M16.4249 4.60509L9.76558 11.2644C9.25807 11.772 8.89804 12.4078 8.72397 13.1041L8 16L10.8959 15.276C11.5922 15.102 12.228 14.7419 12.7356 14.2344L19.3949 7.57506M16.4249 4.60509L19.3949 7.57506" strokeLinejoin="round"/>
                <path d="M18.9999 13.5C18.9999 16.7875 18.9999 18.4312 18.092 19.5376C17.9258 19.7401 17.7401 19.9258 17.5375 20.092C16.4312 21 14.7874 21 11.4999 21H11C7.22876 21 5.34316 21 4.17159 19.8284C3.00003 18.6569 3 16.7712 3 13V12.5C3 9.21252 3 7.56879 3.90794 6.46244C4.07417 6.2599 4.2599 6.07417 4.46244 5.90794C5.56879 5 7.21252 5 10.5 5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          ) : (
            <button
              onClick={onFollowClick}
              className={iconButtonClasses}
              type="button"
              title={isFollowing ? 'Following' : 'Follow'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <line x1="19" y1="8" x2="19" y2="14"/>
                <line x1="22" y1="11" x2="16" y2="11"/>
              </svg>
            </button>
          )
        )}
      </div>

    </div>
  );
};

export default ListingSearch;

'use client';

import { useState } from 'react';

interface NewsfeedFilterProps {
  onFilterChange?: (filter: string) => void;
}

const NewsfeedFilter: React.FC<NewsfeedFilterProps> = ({
  onFilterChange
}) => {
  const [selectedFilter, setSelectedFilter] = useState('for-you');

  const handleFilterClick = (filter: string) => {
    setSelectedFilter(filter);
    if (onFilterChange) {
      onFilterChange(filter);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 mb-4 shadow-sm">
      {/* Search and Filter Row */}

      <div className="flex items-center gap-3 mb-4">
  <div className="flex-grow relative">
    <div className="ml-1 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="19" height="19" color="#6B7280" fill="#ffffff">
        <path d="M14 14L16.5 16.5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M16.4333 18.5252C15.8556 17.9475 15.8556 17.0109 16.4333 16.4333C17.0109 15.8556 17.9475 15.8556 18.5252 16.4333L21.5667 19.4748C22.1444 20.0525 22.1444 20.9891 21.5667 21.5667C20.9891 22.1444 20.0525 22.1444 19.4748 21.5667L16.4333 18.5252Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M16 9C16 5.13401 12.866 2 9 2C5.13401 2 2 5.13401 2 9C2 12.866 5.13401 16 9 16C12.866 16 16 12.866 16 9Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    </div>
    <input
      type="text"
      placeholder="Search"
      className="w-full text-[#6B7280] placeholder:text-[#6B7280] border border-[#6B7280] rounded-lg p-3 pl-12 bg-slate-100 text-sm shadow-sm"
    />
  </div>
</div>
      {/* Filter Buttons */}
      <ul className="flex flex-row space-x-2">
        <li 
          className={`group flex items-center shadow-sm justify-center p-3 rounded-lg transition-colors duration-250 cursor-pointer ${
            selectedFilter === 'following' ? 'bg-gray-500' : 'bg-gray-100 hover:bg-gray-200'
          } flex-1`}
          onClick={() => handleFilterClick('following')}
        >
          <span className={`text-[0.8rem] ${
            selectedFilter === 'following' ? 'text-white' : 'text-[#6B7280] group-hover:text-white'
          }`}>Following</span>
        </li>

        <li 
          className={`group flex items-center shadow-sm justify-center p-3 rounded-lg transition-colors duration-250 cursor-pointer ${
            selectedFilter === 'for-you' ? 'bg-gray-500' : 'bg-gray-100 hover:bg-gray-200'
          } flex-1`}
          onClick={() => handleFilterClick('for-you')}
        >
          <span className={`text-[0.8rem]  ${
            selectedFilter === 'for-you' ? 'text-white' : 'text-[#6B7280] group-hover:text-white'
          }`}>For You</span>
        </li>

        <li 
          className={`group flex items-center shadow-sm justify-center p-3 rounded-lg transition-colors duration-250 cursor-pointer ${
            selectedFilter === 'likes' ? 'bg-gray-500' : 'bg-gray-100 hover:bg-gray-200'
          } flex-1`}
          onClick={() => handleFilterClick('likes')}
        >
          <span className={`text-[0.8rem] ${
            selectedFilter === 'likes' ? 'text-white' : 'text-[#6B7280] group-hover:text-white'
          }`}>Likes</span>
        </li>

        <li 
          className={`group flex items-center justify-center p-2 rounded-lg transition-colors duration-250 cursor-pointer ${
            selectedFilter === 'bookmarks' ? 'bg-gray-500' : 'bg-gray-100 hover:bg-gray-200'
          } flex-1`}
          onClick={() => handleFilterClick('bookmarks')}
        >
          <span className={`text-[0.8rem]  ${
            selectedFilter === 'bookmarks' ? 'text-white' : 'text-[#6B7280] group-hover:text-white'
          }`}>Bookmarks</span>
        </li>
      </ul>
    </div>
  );
};

export default NewsfeedFilter;
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
    <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
      <ul className="flex flex-row space-x-2">
        <li 
          className={`group flex items-center justify-center p-3 rounded-lg transition-colors duration-250 cursor-pointer ${
            selectedFilter === 'following' ? 'bg-gray-500' : 'bg-slate-50 hover:bg-gray-200'
          } flex-1`}
          onClick={() => handleFilterClick('following')}
        >
          <span className={`text-[0.8rem] font-light ${
            selectedFilter === 'following' ? 'text-white' : 'text-[#6B7280] group-hover:text-white'
          }`}>Following</span>
        </li>

        <li 
          className={`group flex items-center justify-center p-3 rounded-lg transition-colors duration-250 cursor-pointer ${
            selectedFilter === 'for-you' ? 'bg-gray-500' : 'bg-slate-50 hover:bg-gray-200'
          } flex-1`}
          onClick={() => handleFilterClick('for-you')}
        >
          <span className={`text-[0.8rem] font-light ${
            selectedFilter === 'for-you' ? 'text-white' : 'text-[#6B7280] group-hover:text-white'
          }`}>For You</span>
        </li>

        <li 
          className={`group flex items-center justify-center p-3 rounded-lg transition-colors duration-250 cursor-pointer ${
            selectedFilter === 'likes' ? 'bg-gray-500' : 'bg-slate-50 hover:bg-gray-200'
          } flex-1`}
          onClick={() => handleFilterClick('likes')}
        >
          <span className={`text-[0.8rem] font-light ${
            selectedFilter === 'likes' ? 'text-white' : 'text-[#6B7280] group-hover:text-white'
          }`}>Likes</span>
        </li>

        <li 
          className={`group flex items-center justify-center p-2 rounded-lg transition-colors duration-250 cursor-pointer ${
            selectedFilter === 'bookmarks' ? 'bg-gray-500' : 'bg-slate-50 hover:bg-gray-200'
          } flex-1`}
          onClick={() => handleFilterClick('bookmarks')}
        >
          <span className={`text-[0.8rem] font-light ${
            selectedFilter === 'bookmarks' ? 'text-white' : 'text-[#6B7280] group-hover:text-white'
          }`}>Bookmarks</span>
        </li>
      </ul>
    </div>
  );
};

export default NewsfeedFilter;
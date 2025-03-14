'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useColorContext } from '@/app/context/ColorContext';
import qs from 'query-string';

interface NewsfeedFilterProps {
  onFilterChange?: (filter: string) => void;
}

const NewsfeedFilter: React.FC<NewsfeedFilterProps> = ({ onFilterChange }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Initialize selectedFilter from URL or default to 'for-you'
  const [selectedFilter, setSelectedFilter] = useState(() => {
    const filterParam = searchParams?.get('filter');
    return filterParam || 'for-you';
  });
  
  const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, left: 0 });
  const buttonRefs = useRef<(HTMLLIElement | null)[]>([]);
  const { hexColor } = useColorContext();

  useEffect(() => {
    // Update the indicator position whenever the component mounts or the filter changes
    updateIndicatorPosition();
    
    // Add a resize listener to update the indicator when window is resized
    window.addEventListener('resize', updateIndicatorPosition);
    return () => window.removeEventListener('resize', updateIndicatorPosition);
  }, [selectedFilter]);

  const updateIndicatorPosition = () => {
    const activeButton = buttonRefs.current.find(
      (ref) => ref?.getAttribute('data-filter') === selectedFilter
    );

    if (activeButton) {
      const { offsetLeft, offsetWidth } = activeButton;
      setIndicatorStyle({
        width: offsetWidth,
        left: offsetLeft,
      });
    }
  };

  const handleFilterClick = (filter: string) => {
    setSelectedFilter(filter);
    
    // Update URL with the selected filter
    let currentQuery = {};
    if (searchParams) {
      currentQuery = qs.parse(searchParams.toString());
    }
    
    const updatedQuery: any = {
      ...currentQuery,
      filter
    };
    
    // Remove category filter when changing between filter tabs to show all posts in that filter
    if (updatedQuery.category) {
      delete updatedQuery.category;
    }
    
    const url = qs.stringifyUrl({
      url: '/',
      query: updatedQuery
    }, { skipNull: true });
    
    router.push(url);
    
    if (onFilterChange) {
      onFilterChange(filter);
    }
  };

  return (
    <div className="relative bg-[#4A5568] w-full rounded-md px-4">
      <ul className="flex items-center justify-between w-full relative">
        {['Following', 'For You', 'Likes', 'Bookmarks'].map((filter, index) => {
          const filterValue = filter.toLowerCase().replace(' ', '-');
          return (
            <li
              key={filterValue}
              ref={(el) => (buttonRefs.current[index] = el)}
              data-filter={filterValue}
              className={`
                flex-1 text-center py-3 cursor-pointer select-none
                transition-colors duration-200 ease-in-out
                ${selectedFilter === filterValue
                  ? 'text-white'
                  : 'text-gray-400 hover:text-gray-200'
                }
              `}
              onClick={() => handleFilterClick(filterValue)}
            >
              <span className="text-sm whitespace-nowrap">{filter}</span>
            </li>
          );
        })}
        
        {/* Animated Indicator with dynamic color from context */}
        <div
          className="absolute bottom-0 h-1 rounded-t-sm transition-all duration-300 ease-in-out"
          style={{
            width: `${indicatorStyle.width}px`,
            left: `${indicatorStyle.left}px`,
            backgroundColor: hexColor || '#60A5FA',
          }}
        />
      </ul>
    </div>
  );
};

export default NewsfeedFilter;
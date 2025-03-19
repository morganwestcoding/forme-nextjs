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
  
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0 });
  const [prevColor, setPrevColor] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const buttonRefs = useRef<(HTMLDivElement | null)[]>([]);
  const { hexColor } = useColorContext();

  // Filter options configuration
  const filterOptions = [
    { label: 'Following', value: 'following' },
    { label: 'For You', value: 'for-you' },
    { label: 'Likes', value: 'likes' },
    { label: 'Bookmarks', value: 'bookmarks' }
  ];

  // Update pill position and dimensions based on selected filter
  useEffect(() => {
    updatePillPosition();
    window.addEventListener('resize', updatePillPosition);
    return () => window.removeEventListener('resize', updatePillPosition);
  }, [selectedFilter]);

  const updatePillPosition = () => {
    const index = filterOptions.findIndex(option => option.value === selectedFilter);
    if (index >= 0 && buttonRefs.current[index]) {
      const button = buttonRefs.current[index];
      if (button) {
        setPillStyle({
          left: button.offsetLeft,
          width: button.offsetWidth
        });
      }
    }
  };

  const handleFilterClick = (filter: string) => {
    if (filter === selectedFilter) return;
    
    // Save previous color before changing
    setPrevColor(hexColor);
    setIsTransitioning(true);
    
    // Update selected filter
    setSelectedFilter(filter);
    
    // Reset transition state after animation completes
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
    
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
    <div className="bg-gray-100 border border-gray-100 rounded-lg p-1">
      <div className="grid grid-cols-4 gap-1 relative">
        {/* Animated pill that slides */}
        <div 
          className="absolute rounded-md shadow-sm transition-all duration-300 ease-in-out"
          style={{
            left: `${pillStyle.left}px`,
            width: `${pillStyle.width}px`,
            height: '40px', // Match the height of your buttons
            backgroundColor: isTransitioning ? 
              `linear-gradient(to right, ${prevColor}, ${hexColor})` : 
              hexColor || '#60A5FA',
            transition: 'left 0.3s ease, width 0.3s ease, background-color 0.5s ease',
            zIndex: 0
          }}
        ></div>

        {filterOptions.map((filter, index) => {
          const isActive = selectedFilter === filter.value;
          
          return (
            <div
              key={filter.value}
              ref={el => buttonRefs.current[index] = el}
              className="py-2 cursor-pointer transition-all duration-200 ease-out text-center"
              onClick={() => handleFilterClick(filter.value)}
            >
              {/* Text with higher z-index to ensure it's above the pill */}
              <span className={`
                relative z-10 text-sm whitespace-nowrap transition-colors duration-200
                ${isActive ? 'text-white font-medium' : 'text-neutral-500'}
              `}>
                {filter.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NewsfeedFilter;
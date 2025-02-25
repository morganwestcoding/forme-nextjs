'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useColorContext } from '@/app/context/ColorContext';

interface NewsfeedFilterProps {
  onFilterChange?: (filter: string) => void;
}

const NewsfeedFilter: React.FC<NewsfeedFilterProps> = ({ onFilterChange }) => {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState('for-you');
  const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, left: 0 });
  const buttonRefs = useRef<(HTMLLIElement | null)[]>([]);
  const { hexColor } = useColorContext();

  useEffect(() => {
    updateIndicatorPosition();
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
    if (onFilterChange) {
      onFilterChange(filter);
    }
  };

  return (
    <div className="relative bg-[#333745] w-full rounded-md px-4">
      <ul className="flex items-center justify-between w-full relative">
        {['Following', 'For You', 'Likes', 'Bookmarks'].map((filter, index) => (
          <li
            key={filter.toLowerCase().replace(' ', '-')}
            ref={(el) => (buttonRefs.current[index] = el)}
            data-filter={filter.toLowerCase().replace(' ', '-')}
            className={`
              flex-1 text-center py-3.5 cursor-pointer select-none
              transition-colors duration-200 ease-in-out
              ${selectedFilter === filter.toLowerCase().replace(' ', '-')
                ? 'text-white'
                : 'text-gray-400 hover:text-gray-200'
              }
            `}
            onClick={() => handleFilterClick(filter.toLowerCase().replace(' ', '-'))}
          >
            <span className="text-sm whitespace-nowrap">{filter}</span>
          </li>
        ))}
        
        {/* Animated Indicator with dynamic color from context */}
        <div
          className="absolute bottom-0 h-1 rounded-t-sm transition-all duration-300 ease-in-out"
          style={{
            width: `${indicatorStyle.width}px`,
            left: `${indicatorStyle.left}px`,
            backgroundColor: hexColor,
          }}
        />
      </ul>
    </div>
  );
};

export default NewsfeedFilter;
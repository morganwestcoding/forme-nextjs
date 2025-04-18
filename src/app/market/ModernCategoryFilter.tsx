'use client';

import { useState, useEffect } from 'react';
import { useColorContext } from '@/app/context/ColorContext';

interface ModernCategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const ModernCategoryFilter = ({ 
  selectedCategory, 
  onCategoryChange 
}: ModernCategoryFilterProps) => {
  const { hexColor } = useColorContext();
  const [activeCategory, setActiveCategory] = useState(selectedCategory || 'all');
  const [showAll, setShowAll] = useState(true);
  
  // Update local state when prop changes
  useEffect(() => {
    setActiveCategory(selectedCategory || 'all');
  }, [selectedCategory]);

  // Category options with icons
  const categories = [
    { 
      id: 'all', 
      label: 'All', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
          <line x1="4" y1="22" x2="4" y2="15"></line>
        </svg>
      ) 
    },
    { 
      id: 'barber', 
      label: 'Barber', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 21h10"></path>
          <path d="M12 21v-2"></path>
          <path d="M3 7l2-2"></path>
          <path d="M19 7l-2-2"></path>
          <rect x="5" y="3" width="14" height="4" rx="1"></rect>
          <path d="M19 5v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5"></path>
        </svg>
      ) 
    },
    { 
      id: 'beauty', 
      label: 'Beauty', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.6 15.4c-.8 1.4-2 2.6-3.4 3.4-2.4 1.2-5 1.2-7.4 0-1.4-.8-2.6-2-3.4-3.4-1.2-2.4-1.2-5 0-7.4.8-1.4 2-2.6 3.4-3.4 2.4-1.2 5-1.2 7.4 0 1.4.8 2.6 2 3.4 3.4 1.2 2.4 1.2 5 0 7.4z"></path>
          <path d="M12 16 8 8"></path>
          <path d="m16 16-4-8"></path>
        </svg>
      ) 
    },
    { 
      id: 'fitness', 
      label: 'Fitness', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
          <path d="M4 22h16"></path>
          <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
          <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
          <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
        </svg>
      ) 
    },
    { 
      id: 'spa', 
      label: 'Spa',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 12c0-3.5 2.5-6 6-8 3.5 2 6 4.5 6 8s-2.5 6-6 8c-3.5-2-6-4.5-6-8z"></path>
          <path d="M8 12c0 3.5 2.5 6 6 8 3.5-2 6-4.5 6-8s-2.5-6-6-8c-3.5 2-6 4.5-6 8z"></path>
        </svg>
      ) 
    },
    { 
      id: 'massage', 
      label: 'Massage', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 18v-6"></path>
          <path d="M8 14l8-4"></path>
        </svg>
      ) 
    },
    { 
      id: 'haircut', 
      label: 'Haircut', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      ) 
    },
    { 
      id: 'nails', 
      label: 'Nails', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"></path>
        </svg>
      ) 
    }
  ];

  // Handle category selection
  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    onCategoryChange(categoryId);
  };

  // Determine how many categories to show initially (responsive)
  const visibleCategories = showAll ? categories : categories.slice(0, 5);

  return (
    <div className="mb-2">
      <div className="flex items-center gap-2 flex-wrap">
        {visibleCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category.id)}
            className={`
              flex items-center gap-2 py-2 px-3 rounded-full text-sm font-medium transition-all duration-200
              ${activeCategory === category.id 
                ? 'text-white' 
                : 'text-neutral-600 hover:bg-neutral-100'}
            `}
            style={{
              backgroundColor: activeCategory === category.id ? (hexColor || '#60A5FA') : 'transparent',
              border: `1px solid ${activeCategory === category.id ? (hexColor || '#60A5FA') : '#e5e7eb'}`
            }}
          >
            <span className={activeCategory === category.id ? 'text-white' : 'text-neutral-500'}>
              {category.icon}
            </span>
            {category.label}
          </button>
        ))}
        
        {categories.length > 5 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-1 py-2 px-3 rounded-full text-sm font-medium text-neutral-600 hover:bg-neutral-100 border border-neutral-200 transition-all duration-200"
          >
            {showAll ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m18 15-6-6-6 6"/>
                </svg>
                Less
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
                More
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default ModernCategoryFilter;
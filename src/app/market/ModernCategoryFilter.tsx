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

  // Simple category options without icons
  const categories = [
    { id: 'all', label: 'All' },
    { id: 'barber', label: 'Barber' },
    { id: 'beauty', label: 'Beauty' },
    { id: 'fitness', label: 'Fitness' },
    { id: 'spa', label: 'Spa' },
    { id: 'massage', label: 'Massage' },
    { id: 'haircut', label: 'Haircut' },
    { id: 'nails', label: 'Nails' }
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
              py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200
              ${activeCategory === category.id 
                ? 'text-white' 
                : 'text-neutral-600 hover:bg-neutral-100'}
            `}
            style={{
              backgroundColor: activeCategory === category.id ? (hexColor || '#60A5FA') : 'transparent',
              border: `1px solid ${activeCategory === category.id ? (hexColor || '#60A5FA') : '#e5e7eb'}`
            }}
          >
            {category.label}
          </button>
        ))}
        
        {categories.length > 5 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="py-2.5 px-4 rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-100 border border-neutral-200 transition-all duration-200"
          >
            {showAll ? "Less" : "More"}
          </button>
        )}
      </div>
    </div>
  );
};

export default ModernCategoryFilter;
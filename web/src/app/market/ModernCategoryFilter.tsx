'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useColorContext } from '@/app/context/ColorContext';
import { categories as categoryOptions } from '@/components/Categories';
import qs from 'query-string';

interface ModernCategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const ModernCategoryFilter = ({ 
  selectedCategory, 
  onCategoryChange 
}: ModernCategoryFilterProps) => {
  const { updateAccentColor } = useColorContext();
  const [activeCategory, setActiveCategory] = useState(selectedCategory || 'Default');
  const [showAll, setShowAll] = useState(true);
  const router = useRouter();
  const params = useSearchParams();
  
  // Update local state when prop changes
  useEffect(() => {
    setActiveCategory(selectedCategory || 'Default');
  }, [selectedCategory]);

  // Simple category options without icons - we'll combine with the imported categories
  const displayCategories = [
    { id: 'Default', label: 'Default', color: 'bg-[#60A5FA]' },
    ...categoryOptions.map(cat => ({
      id: cat.label,
      label: cat.label,
      color: cat.color
    }))
  ];

  // Function to get category color from id
  const getCategoryColor = (categoryId: string) => {
    const category = displayCategories.find(cat => cat.id === categoryId);
    if (!category) return '#60A5FA';
    
    // Extract hex color from bg-[#HEXCODE] format
    const match = category.color.match(/#[A-Fa-f0-9]{6}/);
    return match ? match[0] : '#60A5FA';
  };

  // Function to darken a hex color by a factor
  const darkenColor = (hex: string, factor: number = 0.2) => {
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Convert to RGB
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);
    
    // Darken each component
    r = Math.max(0, Math.floor(r * (1 - factor)));
    g = Math.max(0, Math.floor(g * (1 - factor)));
    b = Math.max(0, Math.floor(b * (1 - factor)));
    
    // Convert back to hex
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  // Handle category selection with URL param update
  const handleCategoryClick = (categoryId: string) => {
    // Check if it's the same category to toggle
    const isSameCategory = activeCategory === categoryId;
    const newCategory = isSameCategory ? 'Default' : categoryId;
    
    // Update local state
    setActiveCategory(newCategory);
    
    // Update URL parameters
    let currentQuery = {};
    if (params) {
      currentQuery = qs.parse(params.toString());
    }
    
    const updatedQuery: any = {
      ...currentQuery
    };
    
    if (newCategory === 'Default') {
      delete updatedQuery.category;
      updateAccentColor('bg-[#60A5FA]');
    } else {
      updatedQuery.category = newCategory;
      
      // Find and update the accent color
      const categoryData = displayCategories.find(cat => cat.id === newCategory);
      if (categoryData) {
        updateAccentColor(categoryData.color);
      }
    }
    
    // Update URL
    const url = qs.stringifyUrl({
      url: '/market',
      query: updatedQuery
    }, { skipNull: true });
    
    router.push(url);
    
    // Call the parent component's handler
    onCategoryChange(newCategory);
  };

  // Determine how many categories to show initially (responsive)
  const visibleCategories = showAll ? displayCategories : displayCategories.slice(0, 5);

  return (
    <div>
      <div className="flex items-center gap-2 flex-wrap">
        {visibleCategories.map((category) => {
          const isActive = activeCategory === category.id;
          const categoryColor = getCategoryColor(category.id);
          const darkerColor = darkenColor(categoryColor, 0.3);
          
          return (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`
                py-3.5 shadow-sm px-4 rounded-xl text-xs font-medium transition-all duration-200
                bg-white
              `}
              style={{
                backgroundColor: isActive ? categoryColor : '#ffffff',
                borderColor: isActive ? categoryColor : '#e5e7eb',
                color: isActive ? 'white' : 'rgba(75, 85, 99)',
              }}
            >
              {category.label}
            </button>
          );
        })}
        
        {displayCategories.length > 5 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="py-3 px-4 rounded-xl bg-white text-xs font-medium text-neutral-600 hover:bg-neutral-100 border border-gray-200 transition-all duration-200"
          >
            {showAll ? "Less" : "More"}
          </button>
        )}
      </div>
    </div>
  );
};

export default ModernCategoryFilter;
'use client'

import React, { useState, useCallback, useEffect } from 'react';
import qs from 'query-string';
import { useRouter, useSearchParams } from "next/navigation";
import { categories } from '@/components/Categories';
import { useColorContext } from '@/app/context/ColorContext';

interface CategoryButtonProps {
  onCategoryChange?: (category: string) => void;
  initialCategory?: string;
}

const FuturisticSpinner = ({ color, isTransitioning, prevColor }: { 
  color: string, 
  isTransitioning: boolean,
  prevColor: string 
}) => {
  const [showNewColor, setShowNewColor] = useState(false);

  useEffect(() => {
    if (isTransitioning) {
      setShowNewColor(false);
      const timer = setTimeout(() => {
        setShowNewColor(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isTransitioning]);

  const getHexColor = (bgColor: string) => {
    const match = bgColor.match(/#[A-Fa-f0-9]{6}/);
    return match ? match[0] : '#60A5FA';
  };

  const currentColor = getHexColor(color);
  const previousColor = getHexColor(prevColor);

  return (
    <div className="relative w-7 h-7">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Base circle with subtle shadow */}
        <circle
          cx="12"
          cy="12"
          r="11"
          fill="white"
          filter="drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.1))"
        />
        
        {/* Rotating ring */}
        <circle 
          cx="12" 
          cy="12" 
          r="8.5" 
          stroke={isTransitioning ? previousColor : currentColor}
          strokeWidth="0.75" 
          strokeDasharray="4 2" 
          fill="none"
          className="animate-spin"
          style={{ 
            animationDuration: '8s',
            transformOrigin: 'center'
          }}
        />
        
        {/* Inner rotating ring (opposite direction) */}
        <circle 
          cx="12" 
          cy="12" 
          r="6.5" 
          stroke={isTransitioning ? previousColor : currentColor}
          strokeWidth="0.5" 
          strokeDasharray="1 1" 
          fill="none"
          className="animate-spin"
          style={{ 
            animationDuration: '4s',
            animationDirection: 'reverse',
            transformOrigin: 'center'
          }}
        />

        {/* Main circle border */}
        <circle
          cx="12"
          cy="12"
          r="5"
          stroke={isTransitioning ? previousColor : currentColor}
          strokeWidth="1.5"
          fill={isTransitioning ? 'white' : 'white'}
          strokeOpacity={isTransitioning ? 0.7 : 1}
        />
        
        {/* Animated arc that draws when changing category */}
        {isTransitioning && (
          <>
            <circle
              cx="12"
              cy="12"
              r="5"
              stroke={currentColor}
              strokeWidth="1.5"
              fill="none"
              strokeDasharray="31.4"
              className="origin-center animate-drawArc"
              style={{
                strokeDashoffset: 31.4,
                animation: "drawArc 0.8s forwards ease-in-out"
              }}
            />
            <style jsx>{`
              @keyframes drawArc {
                to {
                  stroke-dashoffset: 0;
                }
              }
            `}</style>
          </>
        )}

        {/* Pulsing inner dot */}
        <circle
          cx="12"
          cy="12"
          r="2.5"
          fill={showNewColor ? currentColor : previousColor}
          className="animate-pulse"
          style={{ animationDuration: '2s' }}
        />
        
        {/* Tech lines */}
        {[45, 135, 225, 315].map((angle, i) => (
          <line 
            key={i}
            x1="12"
            y1="12"
            x2={12 + 10 * Math.cos(angle * Math.PI / 180)}
            y2={12 + 10 * Math.sin(angle * Math.PI / 180)}
            stroke={isTransitioning ? previousColor : currentColor}
            strokeWidth="0.4"
            strokeOpacity="0.6"
            strokeDasharray="1 1"
          />
        ))}
      </svg>
    </div>
  );
};

const FuturisticCategory: React.FC<CategoryButtonProps> = ({
  onCategoryChange,
  initialCategory = "Default"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [prevCategory, setPrevCategory] = useState(initialCategory);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const router = useRouter();
  const params = useSearchParams();
  const { updateAccentColor } = useColorContext();
  const defaultColor = 'bg-[#60A5FA]';

  const handleCategorySelect = useCallback((label: string) => {
    const isSameCategory = params?.get('category') === label || (label === 'Default' && !params?.get('category'));
    
    // Update previous category before changing the selected one
    setPrevCategory(selectedCategory);
    
    // Start transition animation
    setIsTransitioning(true);
    
    // Always update the selectedCategory
    setSelectedCategory(isSameCategory ? 'Default' : label);
    setIsOpen(false);

    setTimeout(() => {
      setIsTransitioning(false);
    }, 1100);

    let currentQuery = {};
    if (params) {
      currentQuery = qs.parse(params.toString());
    }

    const updatedQuery: any = {
      ...currentQuery
    };
    
    // Handle repeated category selection - reset to Default and default color
    if (isSameCategory) {
      delete updatedQuery.category;
      updateAccentColor(defaultColor);
      // Force reset the selected category to "Default"
      setSelectedCategory('Default');
      setPrevCategory(label);
    } else if (label === 'Default') {
      // Special handling for "Default" category - remove the category param entirely
      delete updatedQuery.category;
      // Set default color when "Default" is selected
      updateAccentColor(defaultColor);
    } else {
      updatedQuery.category = label;
      
      // Update global accent color based on category
      const categoryData = categories.find(cat => cat.label === label);
      if (categoryData) {
        updateAccentColor(categoryData.color);
      }
    }

    const url = qs.stringifyUrl({
      url: '/',
      query: updatedQuery
    }, { skipNull: true });

    router.push(url);
    if (onCategoryChange) onCategoryChange(isSameCategory ? 'Default' : label);
  }, [router, params, onCategoryChange, selectedCategory, updateAccentColor]);

  // Use the default color if "Default" is selected or if it's the same category selected twice
  const selectedCategoryColor = selectedCategory === 'Default' 
    ? defaultColor
    : categories.find(c => c.label === selectedCategory)?.color || defaultColor;
    
  const prevCategoryColor = prevCategory === 'Default'
    ? defaultColor 
    : categories.find(c => c.label === prevCategory)?.color || defaultColor;

  return (
    <div className="relative">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer transition-transform duration-200 hover:scale-102 active:scale-98"
      >
        <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-100 w-36 px-4 py-2">
          <div className="text-neutral-500 text-sm mr-2 truncate font-medium">
            {selectedCategory}
          </div>
          
          <div className="relative flex-shrink-0">
            <FuturisticSpinner 
              color={selectedCategoryColor}
              prevColor={prevCategoryColor}
              isTransitioning={isTransitioning}
            />
          </div>
        </div>
      </div>

      {isOpen && (
        <div 
          className="absolute top-full left-0 mt-2 w-[300px] bg-white rounded-md shadow-xl p-3 z-50 border border-gray-100 opacity-0 translate-y-[-20px] animate-slideDown"
        >
          <div className="grid grid-cols-3 gap-2">
            <div
              onClick={() => handleCategorySelect('Default')}
              className="bg-[#60A5FA] p-2 rounded-md cursor-pointer text-center transition-transform duration-200 hover:scale-105 active:scale-95"
            >
              <span className="text-white text-sm">Default</span>
            </div>

            {categories.map((category) => (
              <div
                key={category.label}
                onClick={() => handleCategorySelect(category.label)}
                className={`
                  ${category.color}
                  p-2
                  rounded-md
                  cursor-pointer
                  text-center
                  transition-transform duration-200 hover:scale-105 active:scale-95
                `}
              >
                <span className="text-white text-sm">
                  {category.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideDown {
          0% {
            opacity: 0;
            transform: translateY(-20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.2s forwards ease-out;
        }
      `}</style>
    </div>
  );
};

export default FuturisticCategory;
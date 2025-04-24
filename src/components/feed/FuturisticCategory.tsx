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

const RingSpinner = ({ color, isTransitioning, prevColor }: { 
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

  // Extract hex color from bg-[#HEXCODE] format
  const getHexColor = (bgColor: string) => {
    const match = bgColor.match(/#[A-Fa-f0-9]{6}/);
    return match ? match[0] : '#60A5FA';
  };

  const currentColor = getHexColor(color);
  const previousColor = getHexColor(prevColor);
  
  // Generate lighter versions of colors for gradients
  const lightenColor = (hex: string, percent: number) => {
    try {
      // Convert hex to RGB
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      
      // Calculate lighter versions (moving toward white)
      const lighterR = Math.min(255, Math.floor(r + (255 - r) * percent));
      const lighterG = Math.min(255, Math.floor(g + (255 - g) * percent));
      const lighterB = Math.min(255, Math.floor(b + (255 - b) * percent));
      
      // Convert back to hex
      return `#${lighterR.toString(16).padStart(2, '0')}${lighterG.toString(16).padStart(2, '0')}${lighterB.toString(16).padStart(2, '0')}`;
    } catch (e) {
      // Fallback if any issues with color processing
      return hex;
    }
  };

  // Generate unique gradient IDs to prevent conflicts if multiple spinners on page
  const uniqueId = React.useMemo(() => `gradient-${Math.random().toString(36).substring(2, 9)}`, []);
  const currentGradientId = `current-${uniqueId}`;
  const prevGradientId = `prev-${uniqueId}`;
  const animatedGradientId = `animated-${uniqueId}`;
  const shineGradientId = `shine-${uniqueId}`;
  const animatedShineGradientId = `animated-shine-${uniqueId}`;

  return (
    <div className="relative w-7 h-7">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Define gradients */}
        <defs>
          {/* Current color gradient - vertical gradient for base color */}
          <linearGradient id={currentGradientId} x1="12" y1="5" x2="12" y2="19" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={lightenColor(currentColor, 0.2)} />
            <stop offset="50%" stopColor={currentColor} />
            <stop offset="100%" stopColor={lightenColor(currentColor, 0.1)} />
          </linearGradient>
          
          {/* Previous color gradient */}
          <linearGradient id={prevGradientId} x1="12" y1="5" x2="12" y2="19" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={lightenColor(previousColor, 0.2)} />
            <stop offset="50%" stopColor={previousColor} />
            <stop offset="100%" stopColor={lightenColor(previousColor, 0.1)} />
          </linearGradient>
          
          {/* Animated color gradient */}
          <linearGradient id={animatedGradientId} x1="12" y1="5" x2="12" y2="19" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={lightenColor(currentColor, 0.2)} />
            <stop offset="50%" stopColor={currentColor} />
            <stop offset="100%" stopColor={lightenColor(currentColor, 0.1)} />
          </linearGradient>
          
          {/* Shine overlay - diagonal white gradient for sheen effect */}
          <linearGradient id={shineGradientId} x1="5" y1="5" x2="19" y2="19" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="white" stopOpacity="0.5" />
            <stop offset="25%" stopColor="white" stopOpacity="0.1" />
            <stop offset="50%" stopColor="white" stopOpacity="0" />
            <stop offset="100%" stopColor="white" stopOpacity="0.2" />
          </linearGradient>
          
          {/* Animated shine overlay */}
          <linearGradient id={animatedShineGradientId} x1="5" y1="5" x2="19" y2="19" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="white" stopOpacity="0.5" />
            <stop offset="25%" stopColor="white" stopOpacity="0.1" />
            <stop offset="50%" stopColor="white" stopOpacity="0" />
            <stop offset="100%" stopColor="white" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        
        {/* Background circle */}
        <circle
          cx="12"
          cy="12"
          r="10"
          fill="white"
          filter="drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.1))"
        />
        
        {/* Circular track - smaller inner circle, wider stroke */}
        <circle
          cx="12"
          cy="12"
          r="6.5"
          stroke="#F0F0F0"
          strokeWidth="3.5"
          fill="none"
        />
        
        {/* Main colored circle - BASE LAYER */}
        <circle
          cx="12"
          cy="12"
          r="6.5"
          stroke={isTransitioning ? previousColor : currentColor}
          strokeWidth="3.5"
          fill="none"
        />
        
        {/* Color gradient overlay - adds depth to the color */}
        <circle
          cx="12"
          cy="12"
          r="6.5"
          stroke={`url(#${isTransitioning ? prevGradientId : currentGradientId})`}
          strokeWidth="3.5"
          fill="none"
        />
        
        {/* Shine gradient overlay - adds the sheen effect */}
        <circle
          cx="12"
          cy="12"
          r="6.5"
          stroke={`url(#${shineGradientId})`}
          strokeWidth="3.5"
          fill="none"
          style={{ mixBlendMode: 'soft-light', opacity: 0.7 }}
        />
        
        {/* Animated circle that draws clockwise when changing category */}
        {isTransitioning && (
          <>
            {/* Base animated circle with solid color */}
            <circle
              cx="12"
              cy="12"
              r="6.5"
              stroke={currentColor}
              strokeWidth="3.5"
              fill="none"
              strokeDasharray="40.84" // 2 * PI * 6.5
              className="origin-center"
              style={{
                strokeDashoffset: 40.84,
                animation: "drawCircle 0.8s forwards ease-in-out"
              }}
            />
            
            {/* Gradient overlay for animated circle */}
            <circle
              cx="12"
              cy="12"
              r="6.5"
              stroke={`url(#${animatedGradientId})`}
              strokeWidth="3.5"
              fill="none"
              strokeDasharray="40.84"
              className="origin-center"
              style={{
                strokeDashoffset: 40.84,
                animation: "drawCircle 0.8s forwards ease-in-out"
              }}
            />
            
            {/* Shine overlay for animated circle */}
            <circle
              cx="12"
              cy="12"
              r="6.5"
              stroke={`url(#${animatedShineGradientId})`}
              strokeWidth="3.5"
              fill="none"
              strokeDasharray="40.84"
              className="origin-center"
              style={{
                strokeDashoffset: 40.84,
                animation: "drawCircle 0.8s forwards ease-in-out",
                mixBlendMode: 'soft-light',
                opacity: 0.7
              }}
            />
          </>
        )}
      </svg>
      
      {/* Animation styles */}
      <style jsx>{`
        @keyframes drawCircle {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
};

const ModernCategory: React.FC<CategoryButtonProps> = ({
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
        <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-100 w-36 px-4 py-2">
          <div className="text-neutral-500 text-sm mr-2 truncate font-medium">
            {selectedCategory}
          </div>
          
          <div className="relative flex-shrink-0">
            <RingSpinner 
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

export default ModernCategory;
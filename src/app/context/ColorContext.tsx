// app/context/ColorContext.tsx
'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import { categories } from '@/components/Categories';

// Define the context shape
interface ColorContextType {
  accentColor: string;
  hexColor: string;
  updateAccentColor: (color: string) => void;
}

// Create context with a default value
const ColorContext = createContext<ColorContextType>({
  accentColor: 'bg-[#60A5FA]',
  hexColor: '#60A5FA',
  updateAccentColor: () => {},
});

// Export the hook for easy usage
export const useColorContext = () => useContext(ColorContext);

interface ColorProviderProps {
  children: ReactNode;
}

export const ColorProvider = ({ children }: ColorProviderProps) => {
  const [accentColor, setAccentColor] = useState<string>('bg-[#60A5FA]');
  const [hexColor, setHexColor] = useState<string>('#60A5FA');
  const params = useSearchParams();

  // Extract hex color from bg-[#xxx] format
  const getHexColor = (bgColor: string): string => {
    const match = bgColor.match(/#[A-Fa-f0-9]{6}/);
    return match ? match[0] : '#60A5FA';
  };

  // Update accent color based on URL params
  useEffect(() => {
    const categoryParam = params?.get('category');
    if (categoryParam) {
      const categoryData = categories.find(cat => cat.label === categoryParam);
      if (categoryData) {
        setAccentColor(categoryData.color);
        setHexColor(getHexColor(categoryData.color));
      }
    } else {
      // Default color when no category is selected
      setAccentColor('bg-[#60A5FA]');
      setHexColor('#60A5FA');
    }
  }, [params]);

  // Function to manually update accent color
  const updateAccentColor = (color: string) => {
    setAccentColor(color);
    setHexColor(getHexColor(color));
  };

  return (
    <ColorContext.Provider value={{ accentColor, hexColor, updateAccentColor }}>
      {children}
    </ColorContext.Provider>
  );
};
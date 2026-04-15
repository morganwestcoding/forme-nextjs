'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ThemeContextType {
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  resetTheme: () => void;
}

const DEFAULT_DARK_MODE = false;

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [isDarkMode, setIsDarkModeState] = useState<boolean>(DEFAULT_DARK_MODE);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('forme-theme');
    if (savedTheme) {
      try {
        const parsed = JSON.parse(savedTheme);
        if (typeof parsed.isDarkMode === 'boolean') setIsDarkModeState(parsed.isDarkMode);
      } catch (e) {
        // silently handled
      }
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem('forme-theme', JSON.stringify({ isDarkMode }));
  }, [isDarkMode, isHydrated]);

  const setIsDarkMode = (dark: boolean) => setIsDarkModeState(dark);

  const resetTheme = () => {
    setIsDarkModeState(DEFAULT_DARK_MODE);
    localStorage.removeItem('forme-theme');
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, setIsDarkMode, resetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export { DEFAULT_DARK_MODE };

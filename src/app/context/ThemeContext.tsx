'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ThemeContextType {
  accentColor: string;
  isDarkMode: boolean;
  setAccentColor: (color: string) => void;
  setIsDarkMode: (dark: boolean) => void;
  resetTheme: () => void;
}

const DEFAULT_ACCENT_COLOR = '#60A5FA';
const DEFAULT_DARK_MODE = false;

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [accentColor, setAccentColorState] = useState<string>(DEFAULT_ACCENT_COLOR);
  const [isDarkMode, setIsDarkModeState] = useState<boolean>(DEFAULT_DARK_MODE);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('forme-theme');
    if (savedTheme) {
      try {
        const parsed = JSON.parse(savedTheme);
        if (parsed.accentColor) setAccentColorState(parsed.accentColor);
        if (typeof parsed.isDarkMode === 'boolean') setIsDarkModeState(parsed.isDarkMode);
      } catch (e) {
        console.error('Failed to parse theme from localStorage:', e);
      }
    }
    setIsHydrated(true);
  }, []);

  // Apply dark mode class to document
  useEffect(() => {
    if (!isHydrated) return;

    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode, isHydrated]);

  // Apply accent color as CSS variable
  useEffect(() => {
    if (!isHydrated) return;

    document.documentElement.style.setProperty('--accent-color', accentColor);

    // Calculate hover color (slightly darker)
    const hoverColor = adjustBrightness(accentColor, -15);
    document.documentElement.style.setProperty('--accent-color-hover', hoverColor);

    // Calculate light variant (for backgrounds)
    const lightColor = accentColor + '1A'; // 10% opacity
    document.documentElement.style.setProperty('--accent-color-light', lightColor);

    // Calculate shadow color
    const shadowColor = accentColor + '40'; // 25% opacity
    document.documentElement.style.setProperty('--accent-color-shadow', shadowColor);
  }, [accentColor, isHydrated]);

  // Save theme to localStorage whenever it changes
  useEffect(() => {
    if (!isHydrated) return;

    localStorage.setItem('forme-theme', JSON.stringify({
      accentColor,
      isDarkMode
    }));
  }, [accentColor, isDarkMode, isHydrated]);

  const setAccentColor = (color: string) => {
    setAccentColorState(color);
  };

  const setIsDarkMode = (dark: boolean) => {
    setIsDarkModeState(dark);
  };

  const resetTheme = () => {
    setAccentColorState(DEFAULT_ACCENT_COLOR);
    setIsDarkModeState(DEFAULT_DARK_MODE);
    localStorage.removeItem('forme-theme');
  };

  return (
    <ThemeContext.Provider value={{
      accentColor,
      isDarkMode,
      setAccentColor,
      setIsDarkMode,
      resetTheme
    }}>
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

// Helper function to adjust color brightness
function adjustBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, Math.min(255, (num >> 16) + amt));
  const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amt));
  const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt));
  return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

export { DEFAULT_ACCENT_COLOR, DEFAULT_DARK_MODE };

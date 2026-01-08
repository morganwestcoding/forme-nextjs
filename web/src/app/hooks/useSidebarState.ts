'use client';

import { useState, useEffect } from 'react';

/**
 * Hook to track sidebar collapsed state across the app.
 * Listens for 'sidebarToggle' events and reads from localStorage.
 *
 * @returns boolean - true if sidebar is collapsed, false otherwise
 */
export function useSidebarState(): boolean {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const checkSidebarState = () => {
      const collapsed = localStorage.getItem('sidebarCollapsed') === 'true';
      setIsCollapsed(collapsed);
    };

    // Check initial state
    checkSidebarState();

    // Listen for toggle events
    window.addEventListener('sidebarToggle', checkSidebarState);

    return () => {
      window.removeEventListener('sidebarToggle', checkSidebarState);
    };
  }, []);

  return isCollapsed;
}

export default useSidebarState;

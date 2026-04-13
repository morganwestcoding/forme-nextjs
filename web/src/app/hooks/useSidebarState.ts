'use client';

/**
 * Returns true (full-width layout). No sidebar is rendered.
 * Kept as a hook so consuming components don't need changes.
 */
export function useSidebarState(): boolean {
  return true;
}

export default useSidebarState;

// hooks/useViewMode.ts
import { create } from 'zustand';

export type ViewMode = 'grid' | 'tiktok';

interface ViewModeStore {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

export const useViewMode = create<ViewModeStore>((set) => ({
  viewMode: 'grid',
  setViewMode: (mode) => set({ viewMode: mode }),
}));

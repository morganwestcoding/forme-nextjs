import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LocationModalStore {
  isOpen: boolean;
  selectedLocation: string;
  recentLocations: string[];
  onOpen: () => void;
  onClose: () => void;
  setLocation: (location: string) => void;
  clearRecents: () => void;
}

const MAX_RECENTS = 5;

const useLocationModal = create<LocationModalStore>()(
  persist(
    (set) => ({
      isOpen: false,
      selectedLocation: '',
      recentLocations: [],
      onOpen: () => set({ isOpen: true }),
      onClose: () => set({ isOpen: false }),
      setLocation: (location) =>
        set((state) => {
          if (!location) {
            return { selectedLocation: '', isOpen: false };
          }
          const next = [location, ...state.recentLocations.filter((l) => l !== location)].slice(0, MAX_RECENTS);
          return { selectedLocation: location, recentLocations: next, isOpen: false };
        }),
      clearRecents: () => set({ recentLocations: [] }),
    }),
    {
      name: 'forme-location',
      partialize: (state) => ({
        selectedLocation: state.selectedLocation,
        recentLocations: state.recentLocations,
      }),
    }
  )
);

export default useLocationModal;

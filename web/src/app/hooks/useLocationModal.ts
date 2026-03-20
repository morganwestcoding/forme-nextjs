import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LocationModalStore {
  isOpen: boolean;
  selectedLocation: string;
  onOpen: () => void;
  onClose: () => void;
  setLocation: (location: string) => void;
}

const useLocationModal = create<LocationModalStore>()(
  persist(
    (set) => ({
      isOpen: false,
      selectedLocation: 'Los Angeles, CA',
      onOpen: () => set({ isOpen: true }),
      onClose: () => set({ isOpen: false }),
      setLocation: (location) => set({ selectedLocation: location, isOpen: false }),
    }),
    {
      name: 'forme-location',
      partialize: (state) => ({ selectedLocation: state.selectedLocation }),
    }
  )
);

export default useLocationModal;

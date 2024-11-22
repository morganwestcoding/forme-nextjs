// hooks/useRentModal.ts
import { create } from 'zustand';
import { SafeListing } from '@/app/types';

interface RentModalStore {
  isOpen: boolean;
  listing: SafeListing | null;
  onOpen: (listing?: SafeListing) => void;
  onClose: () => void;
}

const useRentModal = create<RentModalStore>((set) => ({
  isOpen: false,
  listing: null,
  onOpen: (listing) => set({ isOpen: true, listing: listing || null }),
  onClose: () => set({ isOpen: false, listing: null })
}));

export default useRentModal;
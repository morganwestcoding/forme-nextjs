// app/hooks/useRentModal.ts
import { create } from 'zustand';
import { SafeListing, SafeUser } from '@/app/types';

type RentListing = (SafeListing & { user?: SafeUser }) | null;

type RentModalStore = {
  isOpen: boolean;
  listing: RentListing;
  onOpen: (listing?: RentListing) => void;
  onClose: () => void;
};

const useRentModal = create<RentModalStore>((set) => ({
  isOpen: false,
  listing: null,
  onOpen: (listing = null) => set({ isOpen: true, listing }),
  onClose: () => set({ isOpen: false, listing: null }),
}));

export default useRentModal;

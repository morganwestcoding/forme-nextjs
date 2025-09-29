// app/hooks/useListingModal.ts
import { create } from 'zustand';
import { SafeListing, SafeUser } from '@/app/types';

type ListingType = (SafeListing & { user?: SafeUser }) | null;

type ListingModalStore = {
  isOpen: boolean;
  listing: ListingType;
  onOpen: (listing?: ListingType) => void;
  onClose: () => void;
};

const useListingModal = create<ListingModalStore>((set) => ({
  isOpen: false,
  listing: null,
  onOpen: (listing = null) => set({ isOpen: true, listing }),
  onClose: () => set({ isOpen: false, listing: null }),
}));

export default useListingModal;
// hooks/useListingGridModal.ts
import { create } from 'zustand';

interface ListingGridModalStore {
  isOpen: boolean;
  listingId: string | null;
  onOpen: (listingId: string) => void;
  onClose: () => void;
}

const useListingGridModal = create<ListingGridModalStore>((set) => ({
  isOpen: false,
  listingId: null,
  onOpen: (listingId) => set({ isOpen: true, listingId }),
  onClose: () => set({ isOpen: false, listingId: null }),
}));

export default useListingGridModal;
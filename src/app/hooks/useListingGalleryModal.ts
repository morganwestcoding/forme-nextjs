import { create } from 'zustand';

interface ListingGalleryModalStore {
  isOpen: boolean;
  listingId: string | null;
  onOpen: (listingId: string) => void;
  onClose: () => void;
}

const useListingGalleryModal = create<ListingGalleryModalStore>((set) => ({
  isOpen: false,
  listingId: null,
  onOpen: (listingId) => set({ isOpen: true, listingId }),
  onClose: () => set({ isOpen: false, listingId: null }),
}));

export default useListingGalleryModal;
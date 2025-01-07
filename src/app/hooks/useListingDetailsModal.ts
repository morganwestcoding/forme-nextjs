import { create } from 'zustand';
import { SafeListing } from '@/app/types';

interface ListingDetailsModalStore {
  isOpen: boolean;
  listing?: SafeListing;
  onOpen: (listing: SafeListing) => void;
  onClose: () => void;
}

const useListingDetailsModal = create<ListingDetailsModalStore>((set) => ({
  isOpen: false,
  listing: undefined,
  onOpen: (listing) => set({ isOpen: true, listing }),
  onClose: () => set({ isOpen: false, listing: undefined }),
}));

export default useListingDetailsModal;
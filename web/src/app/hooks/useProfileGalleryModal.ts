import { create } from 'zustand';

interface ProfileGalleryModalStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

const useProfileGalleryModal = create<ProfileGalleryModalStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

export default useProfileGalleryModal;
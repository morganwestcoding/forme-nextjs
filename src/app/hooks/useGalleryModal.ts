import { create } from 'zustand';

interface GalleryModalStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

const useGalleryModal = create<GalleryModalStore>((set) => ({
    isOpen: false,
    onOpen: () => {
      console.log('Opening Gallery Modal');
      set({ isOpen: true });
    },
    onClose: () => {
      console.log('Closing Gallery Modal');
      set({ isOpen: false });
    }
  }));

export default useGalleryModal;

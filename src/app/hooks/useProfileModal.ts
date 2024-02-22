import { create } from 'zustand';

interface ProfileModalStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

const useProfileModal = create<ProfileModalStore>((set) => ({
    isOpen: false,
    onOpen: () => {
      console.log('Opening Profile Modal');
      set({ isOpen: true });
    },
    onClose: () => {
      console.log('Closing Profile Modal');
      set({ isOpen: false });
    }
  }));

export default useProfileModal;

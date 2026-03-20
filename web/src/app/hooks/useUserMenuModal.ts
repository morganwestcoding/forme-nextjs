import { create } from 'zustand';

interface UserMenuModalStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

const useUserMenuModal = create<UserMenuModalStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

export default useUserMenuModal;

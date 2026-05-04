import { create } from 'zustand';

interface BooleanModalStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

const createBooleanModalStore = () =>
  create<BooleanModalStore>((set) => ({
    isOpen: false,
    onOpen: () => set({ isOpen: true }),
    onClose: () => set({ isOpen: false }),
  }));

export default createBooleanModalStore;

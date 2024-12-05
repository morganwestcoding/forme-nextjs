// hooks/useDemoModal.ts
import { create } from 'zustand';

interface DemoModalStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

const useDemoModal = create<DemoModalStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false })
}));

export default useDemoModal;
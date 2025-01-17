// app/hooks/useInboxModal.ts
import { create } from 'zustand';

interface InboxModalStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

const useInboxModal = create<InboxModalStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

export default useInboxModal;
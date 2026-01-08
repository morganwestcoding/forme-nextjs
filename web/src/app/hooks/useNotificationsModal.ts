// app/hooks/useNotificationsModal.ts
import { create } from 'zustand';

interface NotificationsModalStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

const useNotificationsModal = create<NotificationsModalStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

export default useNotificationsModal;

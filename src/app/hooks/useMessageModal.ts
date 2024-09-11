// src/app/hooks/useMessageModal.ts

import { create } from 'zustand';

interface MessageModalStore {
  isOpen: boolean;
  conversationId: string | null;
  otherUserId: string | null;
  onOpen: (conversationId: string, otherUserId: string) => void;
  onClose: () => void;
}

const useMessageModal = create<MessageModalStore>((set) => ({
  isOpen: false,
  conversationId: null,
  otherUserId: null,
  onOpen: (conversationId: string, otherUserId: string) => set({ isOpen: true, conversationId, otherUserId }),
  onClose: () => set({ isOpen: false, conversationId: null, otherUserId: null }),
}));

export default useMessageModal;
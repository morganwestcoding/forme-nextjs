// src/app/hooks/useMessageModal.ts

import { create } from 'zustand';

interface OtherUserData {
  name: string | null;
  image: string | null;
}

interface MessageModalStore {
  isOpen: boolean;
  conversationId: string | null;
  otherUserId: string | null;
  otherUserData: OtherUserData | null;
  onOpen: (conversationId: string, otherUserId: string, otherUserData?: OtherUserData) => void;
  onClose: () => void;
}

const useMessageModal = create<MessageModalStore>((set) => ({
  isOpen: false,
  conversationId: null,
  otherUserId: null,
  otherUserData: null,
  onOpen: (conversationId: string, otherUserId: string, otherUserData?: OtherUserData) =>
    set({ isOpen: true, conversationId, otherUserId, otherUserData: otherUserData || null }),
  onClose: () => set({ isOpen: false, conversationId: null, otherUserId: null, otherUserData: null }),
}));

export default useMessageModal;
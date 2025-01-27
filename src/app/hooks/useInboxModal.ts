// app/hooks/useInboxModal.ts
import { create } from 'zustand';
import { SafeUser } from '@/app/types';

interface InboxModalStore {
  isOpen: boolean;
  currentUser: SafeUser | null | undefined;
  onOpen: (user: SafeUser | null | undefined) => void;
  onClose: () => void;
}

const useInboxModal = create<InboxModalStore>((set) => ({
  isOpen: false,
  currentUser: null,
  onOpen: (user) => set({ isOpen: true, currentUser: user }),
  onClose: () => set({ isOpen: false, currentUser: null }),
}));

export default useInboxModal;
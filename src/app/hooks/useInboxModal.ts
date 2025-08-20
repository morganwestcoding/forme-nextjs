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
  // 👇 keep currentUser so MessageModal can restore the inbox with it
  onClose: () => set((s) => ({ isOpen: false, currentUser: s.currentUser })),
}));

export default useInboxModal;
